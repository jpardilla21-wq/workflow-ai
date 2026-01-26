import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

Deno.serve(async (req) => {
  // Initialize Base44 client first
  const base44 = createClientFromRequest(req);
  
  const signature = req.headers.get('stripe-signature');
  
  if (!signature) {
    console.error('Missing stripe-signature header');
    return Response.json({ error: 'Missing signature' }, { status: 400 });
  }

  try {
    const body = await req.text();
    
    // Use async signature verification for Deno
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret
    );

    console.log('Webhook event:', event.type);

    // Handle subscription events
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userEmail = session.metadata?.user_email;
        
        if (userEmail && session.payment_status === 'paid') {
          // Upgrade user to premium
          const users = await base44.asServiceRole.entities.User.filter({ email: userEmail });
          if (users.length > 0) {
            await base44.asServiceRole.entities.User.update(users[0].id, {
              subscription_tier: 'premium',
              stripe_customer_id: session.customer
            });
            console.log(`Upgraded user ${userEmail} to premium`);
          }
        }
        break;
      }

      case 'customer.subscription.deleted':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerEmail = subscription.metadata?.user_email;
        
        if (customerEmail) {
          const users = await base44.asServiceRole.entities.User.filter({ email: customerEmail });
          if (users.length > 0) {
            const newTier = subscription.status === 'active' ? 'premium' : 'free';
            await base44.asServiceRole.entities.User.update(users[0].id, {
              subscription_tier: newTier
            });
            console.log(`Updated user ${customerEmail} to ${newTier}`);
          }
        }
        break;
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ 
      error: error.message || 'Webhook processing failed' 
    }, { status: 400 });
  }
});
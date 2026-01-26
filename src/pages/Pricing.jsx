import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Crown, Sparkles, Zap, Loader2, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Pricing() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (error) {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const handleUpgrade = async () => {
    if (!user) {
      base44.auth.redirectToLogin(window.location.pathname);
      return;
    }

    // Check if running in iframe (preview)
    if (window.self !== window.top) {
      alert('Checkout is only available from the published app. Please publish your app to process payments.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('createCheckout', {
        priceId: 'price_1StssQCspH9MHEn6I8VCoXmP'
      });

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (error) {
      alert('Failed to start checkout. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full mb-8">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span className="text-sm font-medium text-indigo-900">Simple, Transparent Pricing</span>
        </div>

        <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
          Choose Your Plan
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Start free, upgrade when you need more. No hidden fees, cancel anytime.
        </p>
      </div>

      {/* Current Plan Alert */}
      {user && (
        <div className="max-w-4xl mx-auto px-6 mb-8">
          <Alert className="border-indigo-200 bg-indigo-50">
            <Sparkles className="h-4 w-4 text-indigo-600" />
            <AlertDescription className="text-indigo-900">
              You're currently on the <strong>{user.subscription_tier === 'premium' ? 'Premium' : 'Free'}</strong> plan
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="max-w-5xl mx-auto px-6 lg:px-8 pb-24">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <Card className="border-2 border-slate-200 hover:border-slate-300 transition-all">
            <CardHeader className="text-center pb-8 pt-8">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-slate-600" />
              </div>
              <CardTitle className="text-2xl mb-2">Free</CardTitle>
              <div className="mb-4">
                <span className="text-5xl font-bold text-slate-900">$0</span>
                <span className="text-slate-600">/month</span>
              </div>
              <p className="text-slate-600">Perfect for trying out automation</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">5 AI-generated workflows per month</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Access to basic templates</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Save up to 5 workflows</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">n8n & Make support</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Detailed setup guides</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">API documentation</span>
                </div>
              </div>

              {!user || user.subscription_tier === 'free' ? (
                <Link to={createPageUrl('AIBuilder')}>
                  <Button variant="outline" className="w-full h-12">
                    Get Started Free
                  </Button>
                </Link>
              ) : (
                <Button variant="outline" className="w-full h-12" disabled>
                  Current Plan
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="border-2 border-indigo-500 hover:border-indigo-600 transition-all relative overflow-hidden shadow-xl">
            {/* Popular Badge */}
            <div className="absolute top-0 right-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold px-6 py-2 rounded-bl-lg">
              MOST POPULAR
            </div>

            <CardHeader className="text-center pb-8 pt-8">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl mb-2">Premium</CardTitle>
              <div className="mb-4">
                <span className="text-5xl font-bold text-slate-900">$29</span>
                <span className="text-slate-600">/month</span>
              </div>
              <p className="text-slate-600">For serious automation users</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700 font-medium">Unlimited AI-generated workflows</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700 font-medium">Access to all 300+ templates</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700 font-medium">Unlimited saved workflows</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">n8n & Make support</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Priority AI processing</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Advanced workflow features</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Email support</span>
                </div>
              </div>

              {user && user.subscription_tier === 'premium' ? (
                <Button className="w-full h-12 bg-indigo-600 hover:bg-indigo-700" disabled>
                  Current Plan
                </Button>
              ) : (
                <Button 
                  onClick={handleUpgrade}
                  className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  <Crown className="w-5 h-5 mr-2" />
                  Upgrade to Premium
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Can I cancel anytime?</h3>
              <p className="text-slate-600">
                Yes, you can cancel your Premium subscription at any time. You'll continue to have access until the end of your billing period.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">What happens to my workflows if I downgrade?</h3>
              <p className="text-slate-600">
                Your existing workflows remain saved. On the free plan, you can keep 5 workflows and generate 5 new ones per month.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Do I need coding knowledge?</h3>
              <p className="text-slate-600">
                No! Our AI generates complete workflows with detailed setup instructions. Just follow the guide to implement.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">What platforms do you support?</h3>
              <p className="text-slate-600">
                We support both n8n and Make. You can generate workflows for either platform or both simultaneously.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
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
        <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Choose the plan that fits your workflow needs. No hidden fees, upgrade anytime.
        </p>
      </div>

      {/* Success/Cancel Messages */}
      {success && (
        <div className="max-w-4xl mx-auto px-6 mb-8">
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-900">
              <strong>Welcome to Premium!</strong> Your subscription is now active. Enjoy unlimited workflows!
            </AlertDescription>
          </Alert>
        </div>
      )}

      {canceled && (
        <div className="max-w-4xl mx-auto px-6 mb-8">
          <Alert className="border-amber-200 bg-amber-50">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-900">
              Checkout canceled. You can upgrade anytime when you're ready!
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 pb-24">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Starter Plan */}
          <Card className="border-2 border-slate-200 hover:border-slate-300 transition-all">
            <CardHeader className="text-center pb-6 pt-8">
              <CardTitle className="text-2xl mb-2 text-slate-900">Starter</CardTitle>
              <p className="text-sm text-slate-600 mb-4">Perfect for individuals just starting out.</p>
              <div className="mb-2">
                <span className="text-5xl font-bold text-slate-900">$23</span>
                <span className="text-slate-600">/mo</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button variant="outline" className="w-full h-11">
                Get Started
              </Button>

              <div className="space-y-3 pt-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">What's Included</p>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">500 AI Credits</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Standard Models (GPT-3.5)</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Community Support</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Basic Analytics</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="border-2 border-indigo-500 hover:border-indigo-600 transition-all relative overflow-hidden shadow-xl scale-105">
            {/* Popular Badge */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-semibold px-4 py-1 rounded-b-lg">
              MOST POPULAR
            </div>

            <CardHeader className="text-center pb-6 pt-10">
              <CardTitle className="text-2xl mb-2 text-slate-900">Pro</CardTitle>
              <p className="text-sm text-slate-600 mb-4">For power users who need more capabilities.</p>
              <div className="mb-2">
                <span className="text-5xl font-bold text-slate-900">$59</span>
                <span className="text-slate-600">/mo</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button 
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Get Started'
                )}
              </Button>

              <div className="space-y-3 pt-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Everything in Starter, Plus</p>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">2,500 AI Credits</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Advanced Models (GPT-4)</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Priority Email Support</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">API Access</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Custom Workflows</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Plan */}
          <Card className="border-2 border-slate-200 hover:border-slate-300 transition-all">
            <CardHeader className="text-center pb-6 pt-8">
              <CardTitle className="text-2xl mb-2 text-slate-900">Business</CardTitle>
              <p className="text-sm text-slate-600 mb-4">Scalable solutions for large teams.</p>
              <div className="mb-2">
                <span className="text-5xl font-bold text-slate-900">$179</span>
                <span className="text-slate-600">/mo</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button variant="outline" className="w-full h-11">
                Contact Sales
              </Button>

              <div className="space-y-3 pt-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Everything in Pro, Plus</p>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">10,000 AI Credits</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Custom Fine-tuning</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Dedicated Account Manager</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">SSO & Advanced Security</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">SLA Guarantees</span>
                </div>
              </div>
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
import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Sparkles, Zap, Crown, ArrowRight, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import Logo from '../components/Logo';

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-white opacity-70" />
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-32">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="flex justify-center mb-8">
              <Logo size="large" />
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 mb-6 tracking-tight">
              Build Powerful
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                AI Automations
              </span>
            </h1>

            <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Use AI to create custom n8n and Make automations with detailed setup guides. 
              No coding required.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to={createPageUrl('AIBuilder')}>
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-base px-8 py-6 h-auto">
                  Start Building with AI
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to={createPageUrl('Pricing')}>
                <Button size="lg" variant="outline" className="text-base px-8 py-6 h-auto">
                  View Pricing
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              From templates to AI-powered creation, we make automation accessible
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="p-8 rounded-2xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-100"
            >
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">AI-Powered Builder</h3>
              <p className="text-slate-600 leading-relaxed">
                Describe your workflow in plain English. AI generates complete automations with detailed setup instructions.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-white border border-purple-100"
            >
              <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Complete Setup Guides</h3>
              <p className="text-slate-600 leading-relaxed">
                Every workflow includes step-by-step instructions, API documentation, and configuration guides.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-8 rounded-2xl bg-gradient-to-br from-amber-50 to-white border border-amber-100"
            >
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">n8n & Make Support</h3>
              <p className="text-slate-600 leading-relaxed">
                Generate workflows for n8n, Make, or both platforms. Export ready-to-use JSON files instantly.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-600">
              From idea to automation in minutes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Describe Your Workflow</h3>
              <p className="text-slate-600">
                Tell our AI what automation you need in plain English
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Get Complete Setup</h3>
              <p className="text-slate-600">
                Receive JSON files, API setup guides, and detailed implementation steps
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-amber-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Deploy & Automate</h3>
              <p className="text-slate-600">
                Import to n8n or Make, follow the guide, and watch your automation work
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Automate?
          </h2>
          <p className="text-xl text-indigo-100 mb-12">
            Start with 5 free automations. Upgrade anytime for unlimited access.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={createPageUrl('AIBuilder')}>
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-slate-50 text-base px-8 py-6 h-auto">
                Start Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to={createPageUrl('Pricing')}>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-base px-8 py-6 h-auto">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
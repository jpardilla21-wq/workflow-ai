import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, Image, Users, Zap, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function OnboardingFlow({ user, onComplete }) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      icon: Sparkles,
      title: 'Welcome to Workflow AI',
      description: 'Build powerful automations without code. Let\'s get you started with a quick tour.',
      color: 'from-indigo-600 to-purple-600'
    },
    {
      icon: Image,
      title: 'Create from Images',
      description: 'Upload screenshots or diagrams of your workflow, and AI will generate the complete automation.',
      color: 'from-purple-600 to-pink-600'
    },
    {
      icon: Zap,
      title: 'AI Builder',
      description: 'Describe your automation in plain English. Get complete workflows with setup guides and JSON exports.',
      color: 'from-pink-600 to-red-600'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Share workflows with teammates, set permissions, and collaborate in real-time.',
      color: 'from-red-600 to-orange-600'
    }
  ];

  const handleComplete = async () => {
    try {
      const progress = await base44.entities.UserProgress.filter({ user_email: user.email });
      
      if (progress.length > 0) {
        await base44.entities.UserProgress.update(progress[0].id, {
          onboarding_completed: true,
          completed_steps: ['welcome', 'image_upload', 'ai_builder', 'collaboration']
        });
      } else {
        await base44.entities.UserProgress.create({
          user_email: user.email,
          onboarding_completed: true,
          completed_steps: ['welcome', 'image_upload', 'ai_builder', 'collaboration']
        });
      }
      
      onComplete();
    } catch (error) {
      console.error('Failed to save progress:', error);
      onComplete();
    }
  };

  const currentStep = steps[step];
  const Icon = currentStep.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      >
        <motion.div
          key={step}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8"
        >
          <div className={`w-20 h-20 bg-gradient-to-br ${currentStep.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
            <Icon className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">
            {currentStep.title}
          </h2>
          
          <p className="text-lg text-slate-600 text-center mb-8">
            {currentStep.description}
          </p>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mb-8">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all ${
                  idx === step ? 'w-8 bg-indigo-600' : 'w-2 bg-slate-300'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleComplete}
              className="flex-1"
            >
              Skip Tour
            </Button>
            <Button
              onClick={() => {
                if (step === steps.length - 1) {
                  handleComplete();
                } else {
                  setStep(step + 1);
                }
              }}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              {step === steps.length - 1 ? (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Get Started
                </>
              ) : (
                'Next'
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
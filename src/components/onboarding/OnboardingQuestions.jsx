import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Users, Briefcase, Target, Sparkles, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function OnboardingQuestions({ user, onComplete }) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    company: '',
    company_size: '',
    role: '',
    role_other: '',
    use_case: '',
    experience_level: '',
    goals: []
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleGoal = (goal) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const handleComplete = async () => {
    try {
      const profileData = {
        ...formData,
        user_email: user.email,
        role: formData.role === 'other' && formData.role_other ? formData.role_other : formData.role
      };

      const existing = await base44.entities.UserProfile.filter({ user_email: user.email });
      
      if (existing.length > 0) {
        await base44.entities.UserProfile.update(existing[0].id, profileData);
      } else {
        await base44.entities.UserProfile.create(profileData);
      }

      const progressData = await base44.entities.UserProgress.filter({ user_email: user.email });
      if (progressData.length > 0) {
        await base44.entities.UserProgress.update(progressData[0].id, {
          onboarding_completed: true
        });
      } else {
        await base44.entities.UserProgress.create({
          user_email: user.email,
          onboarding_completed: true,
          completed_steps: []
        });
      }

      // Redirect to pricing page
      window.location.href = '/Pricing';
    } catch (error) {
      console.error('Failed to save profile:', error);
      window.location.href = '/Pricing';
    }
  };

  const steps = [
    {
      icon: Building2,
      title: "Let's get to know you",
      description: "Tell us about your company",
      fields: (
        <>
          <div className="space-y-2">
            <Label>Company Name (Optional)</Label>
            <Input
              placeholder="e.g., Acme Inc"
              value={formData.company}
              onChange={(e) => updateField('company', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Company Size</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'solo', label: 'Just me' },
                { value: '2-10', label: '2-10' },
                { value: '11-50', label: '11-50' },
                { value: '51-200', label: '51-200' },
                { value: '201+', label: '201+' }
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => updateField('company_size', value)}
                  className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    formData.company_size === value
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </>
      ),
      canProgress: formData.company_size
    },
    {
      icon: Briefcase,
      title: "What's your role?",
      description: "This helps us personalize your experience",
      fields: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Your Role</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'founder', label: 'Founder/CEO' },
                { value: 'developer', label: 'Developer' },
                { value: 'product_manager', label: 'Product Manager' },
                { value: 'operations', label: 'Operations' },
                { value: 'marketing', label: 'Marketing' },
                { value: 'other', label: 'Other' }
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => updateField('role', value)}
                  className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    formData.role === value
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {formData.role === 'other' && (
            <div className="space-y-2">
              <Label>Please specify your role</Label>
              <Input
                placeholder="e.g., Consultant, Designer, etc."
                value={formData.role_other}
                onChange={(e) => updateField('role_other', e.target.value)}
                autoFocus
              />
            </div>
          )}
        </div>
      ),
      canProgress: formData.role && (formData.role !== 'other' || formData.role_other)
    },
    {
      icon: Target,
      title: "What brings you here?",
      description: "Select your primary use case",
      fields: (
        <div className="space-y-2">
          <Label>Primary Use Case</Label>
          <div className="grid gap-2">
            {[
              { value: 'personal_productivity', label: 'Personal Productivity', desc: 'Automate my daily tasks' },
              { value: 'business_automation', label: 'Business Automation', desc: 'Scale my operations' },
              { value: 'team_collaboration', label: 'Team Collaboration', desc: 'Work better with my team' },
              { value: 'client_work', label: 'Client Work', desc: 'Build automations for clients' },
              { value: 'learning', label: 'Learning', desc: 'Explore automation possibilities' }
            ].map(({ value, label, desc }) => (
              <button
                key={value}
                onClick={() => updateField('use_case', value)}
                className={`px-4 py-3 rounded-lg border-2 text-left transition-all ${
                  formData.use_case === value
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`font-medium ${formData.use_case === value ? 'text-indigo-700' : 'text-slate-900'}`}>
                  {label}
                </div>
                <div className="text-xs text-slate-500">{desc}</div>
              </button>
            ))}
          </div>
        </div>
      ),
      canProgress: formData.use_case
    },
    {
      icon: Sparkles,
      title: "What are your goals?",
      description: "Select all that apply",
      fields: (
        <>
          <div className="space-y-2">
            <Label>Your Goals (Select multiple)</Label>
            <div className="grid gap-2">
              {[
                'Save time on repetitive tasks',
                'Integrate multiple tools',
                'Improve team efficiency',
                'Reduce manual errors',
                'Scale my business',
                'Learn automation'
              ].map((goal) => (
                <button
                  key={goal}
                  onClick={() => toggleGoal(goal)}
                  className={`px-4 py-3 rounded-lg border-2 text-left text-sm font-medium transition-all flex items-center gap-2 ${
                    formData.goals.includes(goal)
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {formData.goals.includes(goal) && (
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  )}
                  {goal}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Your Experience Level</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'beginner', label: 'Beginner' },
                { value: 'intermediate', label: 'Intermediate' },
                { value: 'advanced', label: 'Advanced' }
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => updateField('experience_level', value)}
                  className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    formData.experience_level === value
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </>
      ),
      canProgress: formData.goals.length > 0 && formData.experience_level
    }
  ];

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
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Icon className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-3xl font-bold text-slate-900 text-center mb-2">
            {currentStep.title}
          </h2>
          
          <p className="text-slate-600 text-center mb-8">
            {currentStep.description}
          </p>

          <div className="space-y-6 mb-8">
            {currentStep.fields}
          </div>

          {/* Progress */}
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
            {step > 0 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="flex-1"
              >
                Back
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleComplete}
              className="flex-1"
            >
              Skip
            </Button>
            <Button
              onClick={() => {
                if (step === steps.length - 1) {
                  handleComplete();
                } else {
                  setStep(step + 1);
                }
              }}
              disabled={!currentStep.canProgress}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              {step === steps.length - 1 ? 'Complete' : 'Continue'}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
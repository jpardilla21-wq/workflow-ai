import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TutorialTooltip({ 
  step, 
  isActive, 
  onNext, 
  onPrev, 
  onSkip, 
  totalSteps,
  currentStep 
}) {
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!isActive || !step.targetSelector) return;

    const updatePosition = () => {
      const target = document.querySelector(step.targetSelector);
      if (target) {
        const rect = target.getBoundingClientRect();
        setPosition({
          top: rect.bottom + 10,
          left: rect.left
        });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [isActive, step.targetSelector]);

  if (!isActive) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="fixed z-50 bg-white rounded-lg shadow-2xl border-2 border-indigo-500 p-4 max-w-sm"
        style={{ top: position.top, left: position.left }}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              {currentStep}
            </div>
            <span className="text-xs text-slate-500">of {totalSteps}</span>
          </div>
          <button onClick={onSkip} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <h3 className="font-semibold text-slate-900 mb-2">{step.title}</h3>
        <p className="text-sm text-slate-600 mb-4">{step.description}</p>

        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onPrev}
            disabled={currentStep === 1}
            className="text-xs"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <Button
            size="sm"
            onClick={onNext}
            className="bg-indigo-600 hover:bg-indigo-700 text-xs"
          >
            {currentStep === totalSteps ? 'Finish' : 'Next'}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Brain, CheckCircle2, Layers } from 'lucide-react';

interface LoadingStateProps {
  title?: string;
  contentType?: 'flashcards' | 'quiz' | 'both';
  onCancel?: () => void;
}

const GENERATION_STEPS = [
  'Analyzing educational notes & extracting core concepts...',
  'Structuring clear pedagogical questions & key insights...',
  'Crafting realistic distractors and in-depth explanations...',
  'Validating strict JSON schema with Zod type-safety...',
  'Finalizing interactive study components...',
];

export const LoadingState: React.FC<LoadingStateProps> = ({
  title = 'Generating Study Content',
  contentType = 'both',
  onCancel,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < GENERATION_STEPS.length - 1 ? prev + 1 : prev));
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto py-12 px-6 bg-white border border-navy-100 rounded-2xl shadow-soft text-center">
      {/* Animated glowing icon */}
      <div className="relative inline-flex items-center justify-center mb-6">
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.7, 0.3] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          className="absolute inset-0 bg-brand-400 rounded-full blur-xl"
        />
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/25">
          <Brain className="w-8 h-8 animate-pulse" />
        </div>
      </div>

      <h3 className="text-xl font-bold text-navy-900 mb-2">
        {title}
      </h3>
      <p className="text-sm text-navy-500 max-w-md mx-auto mb-8">
        Gemini AI is digesting your materials and formulating structured, interactive{' '}
        <span className="font-semibold text-brand-600">
          {contentType === 'both' ? 'flashcards & quiz questions' : contentType}
        </span>
        .
      </p>

      {/* Progress Steps */}
      <div className="max-w-md mx-auto text-left space-y-3 mb-8">
        {GENERATION_STEPS.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          return (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.15 }}
              className={`flex items-center space-x-3 text-xs p-2.5 rounded-lg transition-colors ${
                isCurrent
                  ? 'bg-brand-50 text-brand-900 font-medium border border-brand-200/60'
                  : isDone
                  ? 'text-emerald-700 bg-emerald-50/50'
                  : 'text-navy-400'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : isCurrent ? (
                <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-600 animate-ping" />
                </div>
              ) : (
                <div className="w-4 h-4 rounded-full border border-navy-200 shrink-0 flex items-center justify-center text-[10px] text-navy-400">
                  {idx + 1}
                </div>
              )}
              <span className="truncate">{step}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Skeletons preview */}
      <div className="max-w-md mx-auto p-4 bg-navy-50/60 rounded-xl border border-dashed border-navy-200 space-y-2.5 mb-6">
        <div className="h-3 bg-navy-200/60 rounded w-3/4 animate-pulse" />
        <div className="h-3 bg-navy-200/40 rounded w-full animate-pulse" />
        <div className="h-3 bg-navy-200/50 rounded w-5/6 animate-pulse" />
      </div>

      {onCancel && (
        <button
          onClick={onCancel}
          type="button"
          className="text-xs text-navy-400 hover:text-navy-600 font-medium underline underline-offset-4 transition-colors"
        >
          Cancel request
        </button>
      )}
    </div>
  );
};

import React from 'react';
import { motion } from 'framer-motion';
import { RotateCw, HelpCircle, CheckCircle, Info, Sparkles } from 'lucide-react';
import { FlashcardItem } from '../types/study';

interface FlashcardProps {
  card: FlashcardItem;
  isFlipped: boolean;
  onFlip: () => void;
  isKnown?: boolean;
  isRevision?: boolean;
}

export const Flashcard: React.FC<FlashcardProps> = ({
  card,
  isFlipped,
  onFlip,
  isKnown = false,
  isRevision = false,
}) => {
  return (
    <div
      onClick={onFlip}
      className="relative w-full max-w-2xl h-[420px] mx-auto cursor-pointer perspective-1000 select-none group"
      role="button"
      tabIndex={0}
      aria-label="Flashcard - Click or press Space to flip"
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onFlip();
        }
      }}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="w-full h-full relative transform-style-3d"
      >
        {/* FRONT SIDE */}
        <div
          className={`absolute inset-0 w-full h-full backface-hidden bg-white border rounded-3xl p-8 sm:p-10 flex flex-col justify-between shadow-soft hover:shadow-soft-lg transition-shadow duration-300 ${
            isKnown
              ? 'border-emerald-300 ring-2 ring-emerald-400/20'
              : isRevision
              ? 'border-amber-300 ring-2 ring-amber-400/20'
              : 'border-navy-100 hover:border-brand-200'
          }`}
        >
          {/* Top header on card */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-100">
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
              <span>QUESTION</span>
            </span>

            <div className="flex items-center space-x-2">
              {isKnown && (
                <span className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle className="w-3 h-3" />
                  <span>Marked Known</span>
                </span>
              )}
              {isRevision && (
                <span className="inline-flex items-center space-x-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  <HelpCircle className="w-3 h-3" />
                  <span>Needs Revision</span>
                </span>
              )}
              <span className="text-xs text-navy-400 font-medium hidden sm:inline">
                Click or Space to flip
              </span>
            </div>
          </div>

          {/* Question Text */}
          <div className="my-auto py-4">
            <p className="text-xl sm:text-2xl font-bold text-navy-900 leading-snug tracking-tight">
              {card.question}
            </p>
          </div>

          {/* Bottom helper */}
          <div className="pt-4 border-t border-navy-50 flex items-center justify-between text-xs text-navy-400">
            <span className="font-mono text-[11px] uppercase tracking-wider text-navy-400">
              RecallAI Flashcard
            </span>
            <div className="inline-flex items-center space-x-1.5 font-medium text-brand-600 group-hover:text-brand-700 transition-colors">
              <RotateCw className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-180" />
              <span>Reveal Answer</span>
            </div>
          </div>
        </div>

        {/* BACK SIDE */}
        <div
          className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-b from-white via-white to-brand-50/30 border rounded-3xl p-8 sm:p-10 flex flex-col justify-between shadow-soft hover:shadow-soft-lg transition-shadow duration-300 ${
            isKnown
              ? 'border-emerald-300 ring-2 ring-emerald-400/20'
              : isRevision
              ? 'border-amber-300 ring-2 ring-amber-400/20'
              : 'border-brand-200'
          }`}
        >
          {/* Top header on card */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>ANSWER</span>
            </span>

            <span className="text-xs text-navy-400 font-medium inline-flex items-center space-x-1">
              <RotateCw className="w-3 h-3 text-navy-400" />
              <span>Click to view Question</span>
            </span>
          </div>

          {/* Main Answer Text */}
          <div className="my-auto py-2 overflow-y-auto max-h-[220px] pr-2">
            <p className="text-lg sm:text-xl font-semibold text-navy-900 leading-relaxed mb-4">
              {card.answer}
            </p>

            {/* Explanation card */}
            {card.explanation && (
              <div className="p-3.5 bg-brand-50/70 border border-brand-100/80 rounded-xl text-left">
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-brand-800 mb-1">
                  <Info className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                  <span>Key Context & Explanation</span>
                </div>
                <p className="text-xs text-navy-700 leading-relaxed">
                  {card.explanation}
                </p>
              </div>
            )}
          </div>

          {/* Bottom card footer */}
          <div className="pt-4 border-t border-navy-50 flex items-center justify-between text-xs text-navy-400">
            <span className="font-mono text-[11px] uppercase tracking-wider text-navy-400">
              Card Answer
            </span>
            <span className="text-navy-500 font-medium">
              Use keys 1 (Revision) or 2 (Known)
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  BookOpen,
  HelpCircle,
  Save,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Layers,
} from 'lucide-react';
import { GenerationParams, GenerationResponse, StudySet } from '../types/study';
import { StudyInput } from '../components/StudyInput';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { ApiError } from '../services/api';

interface CreateStudySetProps {
  onGenerate: (params: GenerationParams) => Promise<void>;
  isLoading: boolean;
  error: ApiError | Error | string | null;
  generatedContent: GenerationResponse | null;
  generatedSource?: string;
  generationNotice?: string;
  onSaveAndStudy: (set: StudySet, mode: 'flashcards' | 'quiz') => void;
  onOpenSettings: () => void;
  onRetry: () => void;
  onCancelRequest?: () => void;
  onUseSampleFallback?: () => void;
}

export const CreateStudySet: React.FC<CreateStudySetProps> = ({
  onGenerate,
  isLoading,
  error,
  generatedContent,
  generatedSource,
  generationNotice,
  onSaveAndStudy,
  onOpenSettings,
  onRetry,
  onCancelRequest,
  onUseSampleFallback,
}) => {
  const [activePreviewTab, setActivePreviewTab] = useState<'flashcards' | 'quiz'>('flashcards');

  const handleStartStudy = (mode: 'flashcards' | 'quiz') => {
    if (!generatedContent) return;

    const newSet: StudySet = {
      id: `set-${Date.now()}`,
      title: generatedContent.title || 'Untitled Study Set',
      type: generatedContent.type,
      sourcePrompt: generatedContent.title,
      difficulty: 'medium',
      createdAt: new Date().toISOString(),
      flashcards: generatedContent.flashcards || [],
      questions: generatedContent.questions || [],
    };

    onSaveAndStudy(newSet, mode);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* Top Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
          Create AI Study Set
        </h2>
        <p className="text-xs sm:text-sm text-navy-500">
          Transform raw text, lecture slides, or complex topics into structured learning modules.
        </p>
      </div>

      {/* Input component */}
      {!isLoading && !generatedContent && (
        <StudyInput onGenerate={onGenerate} isLoading={isLoading} />
      )}

      {/* Loading State with animated steps */}
      {isLoading && (
        <LoadingState onCancel={onCancelRequest} />
      )}

      {/* Error State with graceful retry */}
      {error && !isLoading && (
        <ErrorState
          error={error}
          onRetry={onRetry}
          onOpenSettings={onOpenSettings}
          onUseSampleFallback={onUseSampleFallback}
        />
      )}

      {/* Generated Content Preview & Action Banner */}
      {generatedContent && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-navy-100 rounded-3xl p-6 sm:p-8 shadow-soft-lg space-y-6"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-100">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                  Ready to Study
                </span>
                {generatedSource === 'gemini' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                    Gemini AI
                  </span>
                )}
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-navy-900 tracking-tight">
                {generatedContent.title}
              </h3>
            </div>

            {/* Preview Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              {generatedContent.flashcards && generatedContent.flashcards.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleStartStudy('flashcards')}
                  className="px-4 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-950 text-white text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Study Flashcards</span>
                </button>
              )}

              {generatedContent.questions && generatedContent.questions.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleStartStudy('quiz')}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all flex items-center space-x-1.5"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Start Quiz</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Informational notice */}
          {generationNotice && (
            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{generationNotice}</span>
            </div>
          )}

          {/* Tab switches for Both */}
          {generatedContent.flashcards && generatedContent.questions && (
            <div className="flex items-center space-x-2 p-1 bg-navy-50 rounded-xl max-w-xs">
              <button
                type="button"
                onClick={() => setActivePreviewTab('flashcards')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                  activePreviewTab === 'flashcards'
                    ? 'bg-white text-navy-900 shadow-sm'
                    : 'text-navy-500 hover:text-navy-800'
                }`}
              >
                Flashcards ({generatedContent.flashcards.length})
              </button>
              <button
                type="button"
                onClick={() => setActivePreviewTab('quiz')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                  activePreviewTab === 'quiz'
                    ? 'bg-white text-navy-900 shadow-sm'
                    : 'text-navy-500 hover:text-navy-800'
                }`}
              >
                Quiz ({generatedContent.questions.length})
              </button>
            </div>
          )}

          {/* Items Preview */}
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {activePreviewTab === 'flashcards' && generatedContent.flashcards ? (
              generatedContent.flashcards.map((card, idx) => (
                <div
                  key={card.id || idx}
                  className="p-4 bg-navy-50/60 border border-navy-100 rounded-2xl text-left"
                >
                  <div className="text-[11px] font-bold text-brand-600 mb-1">
                    CARD #{idx + 1}
                  </div>
                  <div className="text-sm font-bold text-navy-900 mb-2">
                    {card.question}
                  </div>
                  <div className="text-xs text-navy-700 bg-white p-2.5 rounded-xl border border-navy-100">
                    <span className="font-semibold text-navy-900">Answer: </span>
                    {card.answer}
                  </div>
                </div>
              ))
            ) : generatedContent.questions ? (
              generatedContent.questions.map((q, idx) => (
                <div
                  key={q.id || idx}
                  className="p-4 bg-navy-50/60 border border-navy-100 rounded-2xl text-left"
                >
                  <div className="text-[11px] font-bold text-indigo-600 mb-1">
                    QUESTION #{idx + 1}
                  </div>
                  <div className="text-sm font-bold text-navy-900 mb-2">
                    {q.question}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                    {q.options.map((opt, optIdx) => (
                      <div
                        key={optIdx}
                        className={`p-2 rounded-lg border text-xs ${
                          optIdx === q.correctAnswer
                            ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900'
                            : 'bg-white border-navy-100 text-navy-600'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}. {opt}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : null}
          </div>

          {/* Footer: Create Another */}
          <div className="pt-2 flex justify-start">
            <button
              type="button"
              onClick={onRetry}
              className="text-xs text-navy-500 hover:text-navy-800 font-semibold flex items-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Create Another Study Set</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

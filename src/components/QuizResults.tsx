import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Trophy,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  BookOpen,
  Check,
  X,
} from 'lucide-react';
import { QuizQuestionItem } from '../types/study';

interface QuizResultsProps {
  total: number;
  correct: number;
  incorrect: number;
  accuracy: number;
  timeSpentSeconds: number;
  wrongQuestions: QuizQuestionItem[];
  userAnswers: Record<string, number>;
  questions: QuizQuestionItem[];
  studySetTitle: string;
  onRetryIncorrect: () => void;
  onRetakeFullQuiz: () => void;
  onGoToDashboard?: () => void;
  onOpenFlashcards?: () => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export const QuizResults: React.FC<QuizResultsProps> = ({
  total,
  correct,
  incorrect,
  accuracy,
  timeSpentSeconds,
  wrongQuestions,
  userAnswers,
  questions,
  studySetTitle,
  onRetryIncorrect,
  onRetakeFullQuiz,
  onGoToDashboard,
  onOpenFlashcards,
}) => {
  // Fire confetti celebration on high score!
  useEffect(() => {
    if (accuracy >= 70) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#8b5cf6', '#10b981', '#3b82f6'],
        });
      } catch (e) {
        // Safe ignore if confetti fails
      }
    }
  }, [accuracy]);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}m ${secs}s`;
  };

  const getScoreGrade = () => {
    if (accuracy >= 90) return { title: 'Outstanding Mastery!', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' };
    if (accuracy >= 75) return { title: 'Great Job!', color: 'text-brand-600', bg: 'bg-brand-50 border-brand-200' };
    if (accuracy >= 50) return { title: 'Good Effort!', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' };
    return { title: 'Keep Practicing!', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' };
  };

  const grade = getScoreGrade();

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 my-6">
      {/* Top Banner Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-navy-100 rounded-3xl p-8 sm:p-10 shadow-soft-xl text-center"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-tr from-brand-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-brand-500/25">
          <Trophy className="w-10 h-10" />
        </div>

        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-bold border mb-3 ${grade.bg} ${grade.color}`}
        >
          {grade.title.toUpperCase()}
        </span>

        <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight mb-2">
          {accuracy}% Accuracy
        </h2>
        <p className="text-sm text-navy-500 max-w-md mx-auto mb-8">
          Quiz completed for <span className="font-semibold text-navy-800">"{studySetTitle}"</span>.
          {incorrect > 0 && ' Questions answered incorrectly have been added to your Revision Queue.'}
        </p>

        {/* 4 Stat Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-navy-50/60 border border-navy-100 text-left">
            <div className="text-xs font-semibold text-navy-500 mb-1">Total Questions</div>
            <div className="text-2xl font-bold text-navy-900">{total}</div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-left">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-800 mb-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Correct</span>
            </div>
            <div className="text-2xl font-bold text-emerald-900">{correct}</div>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-100 text-left">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-rose-800 mb-1">
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>Incorrect</span>
            </div>
            <div className="text-2xl font-bold text-rose-900">{incorrect}</div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-left">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-indigo-800 mb-1">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>Time Taken</span>
            </div>
            <div className="text-2xl font-bold text-indigo-900 font-mono text-lg sm:text-2xl pt-0.5">
              {formatTime(timeSpentSeconds)}
            </div>
          </div>
        </div>

        {/* Main Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {incorrect > 0 && (
            <button
              onClick={onRetryIncorrect}
              type="button"
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm shadow-md shadow-amber-500/20 transition-all active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry {incorrect} Incorrect Answers</span>
            </button>
          )}

          <button
            onClick={onRetakeFullQuiz}
            type="button"
            className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-white hover:bg-navy-50 text-navy-800 border border-navy-200 font-semibold text-sm shadow-sm transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Full Quiz</span>
          </button>

          {onOpenFlashcards && (
            <button
              onClick={onOpenFlashcards}
              type="button"
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-white hover:bg-navy-50 text-brand-700 border border-brand-200 font-semibold text-sm shadow-sm transition-all"
            >
              <BookOpen className="w-4 h-4" />
              <span>Review Flashcards</span>
            </button>
          )}

          {onGoToDashboard && (
            <button
              onClick={onGoToDashboard}
              type="button"
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-navy-900 hover:bg-navy-950 text-white font-semibold text-sm shadow-sm transition-all"
            >
              <span>Back to Dashboard</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* Detailed Question Review Breakdown */}
      <div className="bg-white border border-navy-100 rounded-3xl p-6 sm:p-8 shadow-soft">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-navy-100">
          <div>
            <h3 className="text-lg font-bold text-navy-900">Question-by-Question Review</h3>
            <p className="text-xs text-navy-500">Review your answers against the correct solutions.</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-navy-100 text-navy-700">
            {questions.length} Items
          </span>
        </div>

        <div className="space-y-6">
          {questions.map((q, idx) => {
            const chosen = userAnswers[q.id];
            const isCorrect = chosen === q.correctAnswer;

            return (
              <div
                key={q.id || idx}
                className={`p-5 rounded-2xl border transition-all ${
                  isCorrect
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-rose-200 bg-rose-50/20'
                }`}
              >
                {/* Status indicator */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-navy-400">
                      #{idx + 1}
                    </span>
                    <span
                      className={`inline-flex items-center space-x-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                        isCorrect
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {isCorrect ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      <span>{isCorrect ? 'Correct' : 'Incorrect'}</span>
                    </span>
                  </div>
                </div>

                <p className="text-base font-bold text-navy-900 mb-3">{q.question}</p>

                {/* Option comparison */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-3">
                  {q.options.map((opt, optIdx) => {
                    const isOptionCorrect = optIdx === q.correctAnswer;
                    const isOptionChosen = optIdx === chosen;

                    let bg = 'bg-white border-navy-100 text-navy-600';
                    if (isOptionCorrect) {
                      bg = 'bg-emerald-100/70 border-emerald-300 font-bold text-emerald-950';
                    } else if (isOptionChosen && !isCorrect) {
                      bg = 'bg-rose-100/70 border-rose-300 font-bold text-rose-950 line-through';
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`p-2.5 rounded-xl border flex items-center space-x-2 ${bg}`}
                      >
                        <span className="font-mono font-bold opacity-70">
                          {OPTION_LETTERS[optIdx]}.
                        </span>
                        <span className="truncate">{opt}</span>
                        {isOptionCorrect && (
                          <Check className="w-3.5 h-3.5 text-emerald-700 ml-auto shrink-0" />
                        )}
                        {isOptionChosen && !isCorrect && (
                          <X className="w-3.5 h-3.5 text-rose-700 ml-auto shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {q.explanation && (
                  <div className="p-3 bg-white/90 border border-navy-100 rounded-xl text-xs text-navy-700 leading-relaxed">
                    <span className="font-bold text-navy-900">Explanation: </span>
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

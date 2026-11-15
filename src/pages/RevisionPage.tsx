import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  Trash2,
  ArrowRight,
  BookOpen,
  HelpCircle,
  Sparkles,
  Info,
  Check,
  Search,
} from 'lucide-react';
import { RevisionItem } from '../types/study';

interface RevisionPageProps {
  revisionQueue: RevisionItem[];
  onStartRevisionQuiz: () => void;
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
  onGoToDashboard: () => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export const RevisionPage: React.FC<RevisionPageProps> = ({
  revisionQueue,
  onStartRevisionQuiz,
  onRemoveItem,
  onClearAll,
  onGoToDashboard,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = revisionQueue.filter(
    (item) =>
      item.question.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sourceTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Top Header Card */}
      <div className="bg-white border border-navy-100 rounded-3xl p-6 sm:p-8 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Active Recall Queue
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
            Wrong Answer Revision
          </h2>
          <p className="text-xs sm:text-sm text-navy-500 mt-1 max-w-lg leading-relaxed">
            Every question you miss during quizzes is automatically captured here. Practice them until mastered; correct answers in revision quiz are automatically cleared!
          </p>
        </div>

        {revisionQueue.length > 0 && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={onClearAll}
              type="button"
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors"
            >
              Clear Queue
            </button>

            <button
              onClick={onStartRevisionQuiz}
              type="button"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center justify-center space-x-2 active:scale-95"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Practice All ({revisionQueue.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Empty State */}
      {revisionQueue.length === 0 ? (
        <div className="text-center py-16 px-6 bg-white border border-navy-100 rounded-3xl shadow-soft">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-navy-900 mb-2">
            Zero Questions Requiring Revision!
          </h3>
          <p className="text-sm text-navy-500 max-w-md mx-auto mb-6 leading-relaxed">
            You're completely caught up. All quiz questions answered were either correct or already cleared from the revision queue.
          </p>
          <button
            onClick={onGoToDashboard}
            type="button"
            className="px-5 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-950 text-white font-semibold text-xs transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-navy-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search wrong questions or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs text-navy-900 bg-white border border-navy-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/25"
            />
          </div>

          {/* List of wrong questions */}
          <div className="space-y-4">
            <AnimatePresence>
              {filteredItems.map((item, idx) => {
                const q = item.question;
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-5 sm:p-6 bg-white border border-navy-100 rounded-2xl shadow-soft hover:shadow-soft-lg transition-all"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                          {item.sourceTitle}
                        </span>
                        <span className="text-[11px] text-navy-400 font-mono">
                          Missed {new Date(item.dateAdded).toLocaleDateString()}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.id)}
                        title="Remove from revision"
                        className="p-1.5 text-navy-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h4 className="text-base font-bold text-navy-900 mb-4">
                      {q.question}
                    </h4>

                    {/* Options list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-4">
                      {q.options.map((opt, optIdx) => {
                        const isCorrect = optIdx === q.correctAnswer;
                        const wasSelected = item.lastSelectedAnswer === optIdx;

                        let style = 'bg-navy-50/50 border-navy-100 text-navy-700';
                        if (isCorrect) {
                          style = 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold ring-1 ring-emerald-400/20';
                        } else if (wasSelected) {
                          style = 'bg-rose-50 border-rose-200 text-rose-950 font-medium line-through';
                        }

                        return (
                          <div
                            key={optIdx}
                            className={`p-2.5 rounded-xl border flex items-center space-x-2 ${style}`}
                          >
                            <span className="font-mono font-bold opacity-75">
                              {OPTION_LETTERS[optIdx]}.
                            </span>
                            <span className="truncate">{opt}</span>
                            {isCorrect && (
                              <Check className="w-3.5 h-3.5 text-emerald-600 ml-auto shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="p-3 bg-brand-50/50 border border-brand-100 rounded-xl text-xs text-navy-700 leading-relaxed">
                        <span className="font-bold text-brand-900">Why this is right: </span>
                        {q.explanation}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

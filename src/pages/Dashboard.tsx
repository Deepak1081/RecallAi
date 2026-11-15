import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  BookOpen,
  HelpCircle,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Clock,
  Layers,
  CheckCircle2,
  BrainCircuit,
} from 'lucide-react';
import { StudySet, GenerationParams, RevisionItem } from '../types/study';
import { StudyInput } from '../components/StudyInput';

interface DashboardProps {
  onStartGeneration: (params: GenerationParams) => void;
  isLoading: boolean;
  studySets: StudySet[];
  revisionQueue: RevisionItem[];
  metrics: {
    totalSessions: number;
    totalCardsReviewed: number;
    totalQuizzes: number;
    avgAccuracy: number;
    questionsNeedingRevision: number;
  };
  onOpenStudySet: (set: StudySet, mode: 'flashcards' | 'quiz') => void;
  onOpenRevisionQuiz: () => void;
  onViewAllSets: () => void;
  onViewRevisionQueue: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onStartGeneration,
  isLoading,
  studySets,
  revisionQueue,
  metrics,
  onOpenStudySet,
  onOpenRevisionQuiz,
  onViewAllSets,
  onViewRevisionQueue,
}) => {
  return (
    <div className="space-y-10 pb-12">
      {/* Hero Welcome Banner */}
      <div className="text-center max-w-2xl mx-auto pt-4 space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200/80 shadow-soft-sm">
          <Sparkles className="w-3.5 h-3.5 text-brand-500" />
          <span>Transform notes into active recall systems</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-950 tracking-tight">
          What would you like to learn today?
        </h1>
        <p className="text-sm sm:text-base text-navy-500 leading-relaxed">
          Paste your study notes or type any academic topic. RecallAI uses structured AI to generate interactive flashcards and high-yield quizzes instantly.
        </p>
      </div>

      {/* Main Study Input Card */}
      <StudyInput onGenerate={onStartGeneration} isLoading={isLoading} />

      {/* Metric Quick Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-navy-100 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-navy-500">Study Sets</span>
            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-navy-900">{studySets.length}</div>
          <p className="text-[11px] text-navy-400 mt-0.5">Ready for review</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-navy-100 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-navy-500">Flashcards Reviewed</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-navy-900">{metrics.totalCardsReviewed}</div>
          <p className="text-[11px] text-navy-400 mt-0.5">Cards practiced</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-navy-100 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-navy-500">Avg Quiz Accuracy</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-navy-900">
            {metrics.avgAccuracy > 0 ? `${metrics.avgAccuracy}%` : '—'}
          </div>
          <p className="text-[11px] text-navy-400 mt-0.5">Across {metrics.totalQuizzes} quizzes</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-navy-100 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-navy-500">Need Revision</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-navy-900">{metrics.questionsNeedingRevision}</div>
          <p className="text-[11px] text-navy-400 mt-0.5">Wrong questions queued</p>
        </div>
      </div>

      {/* Revision Alert Card (if any wrong questions exist) */}
      {revisionQueue.length > 0 && (
        <div className="p-6 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-soft">
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-navy-900">
                You have {revisionQueue.length} question{revisionQueue.length > 1 ? 's' : ''} to revise
              </h4>
              <p className="text-xs text-navy-600 mt-0.5 max-w-lg">
                Reinforce memory by re-testing only the questions you missed in previous quiz sessions.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={onViewRevisionQueue}
              type="button"
              className="px-4 py-2 text-xs font-semibold text-navy-700 hover:text-navy-900 bg-white border border-navy-200 rounded-xl hover:bg-navy-50 transition-colors"
            >
              View List
            </button>
            <button
              onClick={onOpenRevisionQuiz}
              type="button"
              className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm transition-all flex items-center space-x-1.5"
            >
              <span>Practice Revision Quiz</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Recent Study Sets Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-navy-900">Recent Study Sets</h3>
            <p className="text-xs text-navy-500">Pick up right where you left off</p>
          </div>

          {studySets.length > 3 && (
            <button
              onClick={onViewAllSets}
              type="button"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
            >
              <span>View All ({studySets.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {studySets.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-navy-200 p-6">
            <BookOpen className="w-10 h-10 text-navy-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-navy-800">No study sets yet</h4>
            <p className="text-xs text-navy-500 mt-1 max-w-sm mx-auto">
              Enter a topic above or pick one of the quick suggestions to generate your first study set!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {studySets.slice(0, 6).map((set) => {
              const cardCount = set.flashcards?.length || 0;
              const quizCount = set.questions?.length || 0;

              return (
                <div
                  key={set.id}
                  className="bg-white rounded-2xl border border-navy-100 p-5 shadow-soft hover:shadow-soft-lg hover:border-brand-200 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-navy-100 text-navy-700">
                        {set.type}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          set.difficulty === 'easy'
                            ? 'bg-emerald-50 text-emerald-700'
                            : set.difficulty === 'hard'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-indigo-50 text-indigo-700'
                        }`}
                      >
                        {set.difficulty}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-navy-950 mb-1.5 line-clamp-1">
                      {set.title}
                    </h4>
                    <p className="text-xs text-navy-500 line-clamp-2 leading-relaxed mb-4">
                      {set.sourcePrompt}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center space-x-3 text-xs text-navy-400 pt-3 border-t border-navy-50 mb-3 font-medium">
                      {cardCount > 0 && <span>{cardCount} flashcards</span>}
                      {cardCount > 0 && quizCount > 0 && <span>•</span>}
                      {quizCount > 0 && <span>{quizCount} questions</span>}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {cardCount > 0 && (
                        <button
                          type="button"
                          onClick={() => onOpenStudySet(set, 'flashcards')}
                          className="w-full py-2 px-3 rounded-xl bg-navy-50 hover:bg-brand-50 hover:text-brand-700 text-navy-700 border border-navy-200 hover:border-brand-200 text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Flashcards</span>
                        </button>
                      )}

                      {quizCount > 0 && (
                        <button
                          type="button"
                          onClick={() => onOpenStudySet(set, 'quiz')}
                          className="w-full py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center justify-center space-x-1.5"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Take Quiz</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

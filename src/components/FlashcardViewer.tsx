import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Shuffle,
  CheckCircle,
  HelpCircle,
  Trophy,
  Award,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { FlashcardItem } from '../types/study';
import { Flashcard } from './Flashcard';
import { ProgressBar } from './ProgressBar';
import { useFlashcards } from '../hooks/useFlashcards';

interface FlashcardViewerProps {
  cards: FlashcardItem[];
  studySetId: string;
  studySetTitle: string;
  onSwitchToQuiz?: () => void;
}

export const FlashcardViewer: React.FC<FlashcardViewerProps> = ({
  cards,
  studySetId,
  studySetTitle,
  onSwitchToQuiz,
}) => {
  const {
    currentCard,
    currentIndex,
    totalCards,
    isFlipped,
    isCompleted,
    knownCardIds,
    revisionCardIds,
    knownCount,
    revisionCount,
    progressPercentage,
    flip,
    nextCard,
    prevCard,
    markKnown,
    markNeedRevision,
    restartSession,
    reviewOnlyNeedRevision,
    shuffleDeck,
  } = useFlashcards({ cards, studySetId, studySetTitle });

  if (!cards || cards.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-white rounded-3xl border border-navy-100 shadow-soft">
        <BookOpen className="w-12 h-12 text-navy-300 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-navy-800">No flashcards available</h3>
        <p className="text-sm text-navy-500 mt-1">Generate a study set with flashcards to start practicing.</p>
      </div>
    );
  }

  // Completion Screen
  if (isCompleted) {
    const accuracy = totalCards > 0 ? Math.round((knownCount / totalCards) * 100) : 0;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl mx-auto my-8 p-8 sm:p-10 bg-white rounded-3xl border border-navy-100 shadow-soft-xl text-center"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-tr from-brand-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-brand-500/25">
          <Trophy className="w-10 h-10" />
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-100 mb-2 inline-block">
          DECK COMPLETE
        </span>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight mb-2">
          Awesome Session!
        </h2>
        <p className="text-sm text-navy-500 mb-8 max-w-md mx-auto">
          You've reviewed all <span className="font-semibold text-navy-800">{totalCards}</span> flashcards for{' '}
          <span className="font-semibold text-navy-800">"{studySetTitle}"</span>.
        </p>

        {/* Score Badges */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-left">
            <div className="flex items-center space-x-2 text-emerald-800 text-xs font-semibold mb-1">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Mastered</span>
            </div>
            <div className="text-2xl font-bold text-emerald-900">
              {knownCount}{' '}
              <span className="text-xs font-normal text-emerald-700">({accuracy}%)</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100 text-left">
            <div className="flex items-center space-x-2 text-amber-800 text-xs font-semibold mb-1">
              <HelpCircle className="w-4 h-4 text-amber-600" />
              <span>Needs Revision</span>
            </div>
            <div className="text-2xl font-bold text-amber-900">
              {revisionCount}{' '}
              <span className="text-xs font-normal text-amber-700">
                ({totalCards > 0 ? Math.round((revisionCount / totalCards) * 100) : 0}%)
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {revisionCount > 0 && (
            <button
              onClick={reviewOnlyNeedRevision}
              type="button"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm shadow-sm transition-all"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Practice {revisionCount} Weak Cards</span>
            </button>
          )}

          <button
            onClick={restartSession}
            type="button"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-white hover:bg-navy-50 text-navy-800 border border-navy-200 font-semibold text-sm shadow-sm transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restart Deck</span>
          </button>

          {onSwitchToQuiz && (
            <button
              onClick={onSwitchToQuiz}
              type="button"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-md shadow-brand-500/20 transition-all"
            >
              <span>Test Knowledge in Quiz</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Top Header bar with progress indicator & stats */}
      <div className="bg-white px-6 py-4 rounded-2xl border border-navy-100 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-navy-900 tracking-tight truncate max-w-md">
            {studySetTitle}
          </h3>
          <div className="flex items-center space-x-3 text-xs text-navy-500 mt-1">
            <span className="font-semibold text-navy-700">
              Card {currentIndex + 1} of {totalCards}
            </span>
            <span>•</span>
            <span className="text-emerald-700 font-medium">{knownCount} known</span>
            <span>•</span>
            <span className="text-amber-700 font-medium">{revisionCount} revision</span>
          </div>
        </div>

        {/* Quick controls */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={shuffleDeck}
            type="button"
            title="Shuffle cards"
            className="p-2 rounded-lg text-navy-500 hover:text-navy-900 hover:bg-navy-50 border border-navy-200 transition-colors"
          >
            <Shuffle className="w-4 h-4" />
          </button>
          <button
            onClick={restartSession}
            type="button"
            title="Restart session"
            className="p-2 rounded-lg text-navy-500 hover:text-navy-900 hover:bg-navy-50 border border-navy-200 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <ProgressBar
        progress={progressPercentage}
        label={`Progress: ${currentIndex + 1} / ${totalCards}`}
        subLabel={`${progressPercentage}%`}
        color="brand"
        size="md"
      />

      {/* Main Flashcard Component with 3D Flip */}
      {currentCard && (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Flashcard
              card={currentCard}
              isFlipped={isFlipped}
              onFlip={flip}
              isKnown={knownCardIds.has(currentCard.id)}
              isRevision={revisionCardIds.has(currentCard.id)}
            />
          </motion.div>
        </AnimatePresence>
      )}

      {/* Control Bar: Previous, Next, Known, Need Revision */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        {/* Navigation buttons */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={prevCard}
            disabled={currentIndex === 0}
            type="button"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1 px-4 py-2.5 rounded-xl border border-navy-200 bg-white hover:bg-navy-50 text-navy-700 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={nextCard}
            type="button"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1 px-4 py-2.5 rounded-xl border border-navy-200 bg-white hover:bg-navy-50 text-navy-700 text-xs font-semibold shadow-sm transition-all"
          >
            <span>{currentIndex === totalCards - 1 ? 'Finish' : 'Next'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mastery action buttons */}
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={markNeedRevision}
            type="button"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold shadow-sm transition-all active:scale-95"
          >
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <span>Need Revision (1)</span>
          </button>

          <button
            onClick={markKnown}
            type="button"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-500/20 transition-all active:scale-95"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Mark Known (2)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { ArrowLeft, HelpCircle, BookOpen } from 'lucide-react';
import { StudySet } from '../types/study';
import { FlashcardViewer } from '../components/FlashcardViewer';

interface FlashcardsPageProps {
  studySet: StudySet;
  onBack: () => void;
  onSwitchToQuiz?: () => void;
}

export const FlashcardsPage: React.FC<FlashcardsPageProps> = ({
  studySet,
  onBack,
  onSwitchToQuiz,
}) => {
  const cards = studySet.flashcards || [];
  const hasQuiz = (studySet.questions?.length || 0) > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-navy-600 hover:text-navy-950 py-2 px-3 rounded-xl hover:bg-white border border-transparent hover:border-navy-200 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Study Sets</span>
        </button>

        {hasQuiz && onSwitchToQuiz && (
          <button
            type="button"
            onClick={onSwitchToQuiz}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-brand-50 text-brand-700 border border-brand-200 text-xs font-semibold shadow-sm transition-all"
          >
            <HelpCircle className="w-3.5 h-3.5 text-brand-600" />
            <span>Switch to Quiz</span>
          </button>
        )}
      </div>

      {/* Main Flashcard Viewer Component */}
      <FlashcardViewer
        cards={cards}
        studySetId={studySet.id}
        studySetTitle={studySet.title}
        onSwitchToQuiz={hasQuiz ? onSwitchToQuiz : undefined}
      />
    </div>
  );
};

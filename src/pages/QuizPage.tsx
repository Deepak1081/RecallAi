import React from 'react';
import { ArrowLeft, BookOpen, Layers } from 'lucide-react';
import { StudySet, QuizQuestionItem } from '../types/study';
import { useQuiz } from '../hooks/useQuiz';
import { QuizQuestion } from '../components/QuizQuestion';
import { QuizResults } from '../components/QuizResults';
import { ProgressBar } from '../components/ProgressBar';

interface QuizPageProps {
  studySet: StudySet;
  customQuestions?: QuizQuestionItem[];
  isRevisionMode?: boolean;
  onBack: () => void;
  onSwitchToFlashcards?: () => void;
  onGoToDashboard: () => void;
}

export const QuizPage: React.FC<QuizPageProps> = ({
  studySet,
  customQuestions,
  isRevisionMode = false,
  onBack,
  onSwitchToFlashcards,
  onGoToDashboard,
}) => {
  const questionsToUse = customQuestions || studySet.questions || [];
  const hasFlashcards = (studySet.flashcards?.length || 0) > 0;

  const {
    currentQuestion,
    currentIndex,
    totalQuestions,
    selectedOption,
    isSubmitted,
    isFinished,
    userAnswers,
    formattedTime,
    progressPercentage,
    selectOption,
    submitAnswer,
    nextQuestion,
    retryWrongAnswers,
    retakeFullQuiz,
    results,
  } = useQuiz({
    questions: questionsToUse,
    studySetId: studySet.id,
    studySetTitle: studySet.title,
    isRevisionMode,
  });

  if (!questionsToUse || questionsToUse.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-white rounded-3xl border border-navy-100 shadow-soft max-w-xl mx-auto">
        <Layers className="w-12 h-12 text-navy-300 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-navy-800">No quiz questions available</h3>
        <p className="text-sm text-navy-500 mt-1 mb-6">
          This study set does not contain any quiz questions yet.
        </p>
        <button
          onClick={onBack}
          type="button"
          className="px-4 py-2 rounded-xl bg-navy-900 text-white text-xs font-semibold"
        >
          Back to Sets
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Top Header bar with navigation and mode indicator */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-navy-600 hover:text-navy-950 py-2 px-3 rounded-xl hover:bg-white border border-transparent hover:border-navy-200 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isRevisionMode ? 'Exit Revision Quiz' : 'Back to Sets'}</span>
        </button>

        {isRevisionMode && (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            Wrong Answer Revision Session
          </span>
        )}

        {!isRevisionMode && hasFlashcards && onSwitchToFlashcards && !isFinished && (
          <button
            type="button"
            onClick={onSwitchToFlashcards}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-navy-50 text-navy-700 border border-navy-200 text-xs font-semibold shadow-sm transition-all"
          >
            <BookOpen className="w-3.5 h-3.5 text-navy-500" />
            <span>Study Flashcards</span>
          </button>
        )}
      </div>

      {/* Progress Bar (visible during active quiz) */}
      {!isFinished && (
        <div className="bg-white p-4 rounded-2xl border border-navy-100 shadow-soft">
          <ProgressBar
            progress={progressPercentage}
            label={`Quiz Progress: ${currentIndex + 1} of ${totalQuestions}`}
            subLabel={`${progressPercentage}%`}
            color="indigo"
            size="md"
          />
        </div>
      )}

      {/* Main Question View or Results View */}
      {!isFinished && currentQuestion && (
        <QuizQuestion
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          totalQuestions={totalQuestions}
          selectedOption={selectedOption}
          isSubmitted={isSubmitted}
          formattedTime={formattedTime}
          onSelectOption={selectOption}
          onSubmitAnswer={submitAnswer}
          onNextQuestion={nextQuestion}
        />
      )}

      {/* Final Results Screen */}
      {isFinished && results && (
        <QuizResults
          total={results.total}
          correct={results.correct}
          incorrect={results.incorrect}
          accuracy={results.accuracy}
          timeSpentSeconds={results.timeSpentSeconds}
          wrongQuestions={results.wrongQuestions}
          userAnswers={userAnswers}
          questions={questionsToUse}
          studySetTitle={studySet.title}
          onRetryIncorrect={retryWrongAnswers}
          onRetakeFullQuiz={retakeFullQuiz}
          onGoToDashboard={onGoToDashboard}
          onOpenFlashcards={hasFlashcards ? onSwitchToFlashcards : undefined}
        />
      )}
    </div>
  );
};

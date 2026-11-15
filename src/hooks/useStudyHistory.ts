import { useState, useCallback, useEffect, useMemo } from 'react';
import { StudySet, QuizAttempt, FlashcardSession, RevisionItem } from '../types/study';
import {
  getSavedStudySets,
  saveStudySet,
  deleteStudySet,
  getQuizAttempts,
  getFlashcardSessions,
  getRevisionQueue,
  removeQuestionFromRevision,
  clearRevisionQueue,
} from '../utils/storage';

export function useStudyHistory() {
  const [studySets, setStudySets] = useState<StudySet[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [flashcardSessions, setFlashcardSessions] = useState<FlashcardSession[]>([]);
  const [revisionQueue, setRevisionQueue] = useState<RevisionItem[]>([]);

  const refreshAll = useCallback(() => {
    setStudySets(getSavedStudySets());
    setQuizAttempts(getQuizAttempts());
    setFlashcardSessions(getFlashcardSessions());
    setRevisionQueue(getRevisionQueue());
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Actions
  const handleSaveStudySet = useCallback((set: StudySet) => {
    saveStudySet(set);
    refreshAll();
  }, [refreshAll]);

  const handleDeleteStudySet = useCallback((id: string) => {
    deleteStudySet(id);
    refreshAll();
  }, [refreshAll]);

  const handleRemoveRevisionItem = useCallback((id: string) => {
    removeQuestionFromRevision(id);
    refreshAll();
  }, [refreshAll]);

  const handleClearRevisionQueue = useCallback(() => {
    clearRevisionQueue();
    refreshAll();
  }, [refreshAll]);

  // Computed metrics for Performance Dashboard
  const metrics = useMemo(() => {
    const totalQuizzes = quizAttempts.length;
    const totalFlashcardSessions = flashcardSessions.length;
    const totalSessions = totalQuizzes + totalFlashcardSessions;

    // Total flashcards reviewed count
    const totalCardsReviewed = flashcardSessions.reduce(
      (sum, s) => sum + (s.totalCards || 0),
      0
    );

    // Total questions attempted across quizzes
    const totalQuizQuestionsAnswered = quizAttempts.reduce(
      (sum, a) => sum + (a.totalQuestions || 0),
      0
    );

    // Average accuracy
    const avgAccuracy =
      totalQuizzes > 0
        ? Math.round(
            quizAttempts.reduce((sum, a) => sum + a.accuracy, 0) / totalQuizzes
          )
        : 0;

    // Questions requiring revision count
    const questionsNeedingRevision = revisionQueue.length;

    // Accuracy history for performance chart (last 10 attempts in chronological order)
    const accuracyTrend = [...quizAttempts]
      .reverse()
      .slice(-10)
      .map((attempt, idx) => ({
        index: idx + 1,
        title: attempt.studySetTitle,
        accuracy: attempt.accuracy,
        date: new Date(attempt.date).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        }),
      }));

    // Combined recent activity feed sorted by date descending
    const recentActivity = [
      ...quizAttempts.map((q) => ({
        id: q.id,
        type: 'quiz' as const,
        title: q.studySetTitle,
        subtitle: `Scored ${q.accuracy}% (${q.correctAnswers}/${q.totalQuestions}) • Took ${Math.round(q.timeSpentSeconds)}s`,
        date: q.date,
        accuracy: q.accuracy,
      })),
      ...flashcardSessions.map((f) => ({
        id: f.id,
        type: 'flashcard' as const,
        title: f.studySetTitle,
        subtitle: `Reviewed ${f.totalCards} cards • ${f.knownCount} known, ${f.revisionCount} need revision`,
        date: f.date,
        accuracy: f.totalCards > 0 ? Math.round((f.knownCount / f.totalCards) * 100) : 100,
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);

    return {
      totalSessions,
      totalCardsReviewed,
      totalQuizzes,
      totalQuizQuestionsAnswered,
      avgAccuracy,
      questionsNeedingRevision,
      accuracyTrend,
      recentActivity,
    };
  }, [quizAttempts, flashcardSessions, revisionQueue]);

  return {
    studySets,
    quizAttempts,
    flashcardSessions,
    revisionQueue,
    metrics,
    refreshAll,
    saveStudySet: handleSaveStudySet,
    deleteStudySet: handleDeleteStudySet,
    removeRevisionItem: handleRemoveRevisionItem,
    clearRevisionQueue: handleClearRevisionQueue,
  };
}

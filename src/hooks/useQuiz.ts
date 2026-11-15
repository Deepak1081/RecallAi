import { useState, useCallback, useEffect, useRef } from 'react';
import { QuizQuestionItem, QuizAttempt } from '../types/study';
import { saveQuizAttempt, addQuestionsToRevision, removeQuestionFromRevision } from '../utils/storage';

interface UseQuizProps {
  questions: QuizQuestionItem[];
  studySetId: string;
  studySetTitle: string;
  isRevisionMode?: boolean;
}

export function useQuiz({ questions, studySetId, studySetTitle, isRevisionMode = false }: UseQuizProps) {
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestionItem[]>(questions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [isFinished, setIsFinished] = useState(false);

  // Timer tracking
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const timerRef = useRef<number | null>(null);

  // Sync if questions prop changes
  useEffect(() => {
    setActiveQuestions(questions);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setUserAnswers({});
    setIsFinished(false);
    setSecondsElapsed(0);
  }, [questions]);

  // Start timer on quiz mount and stop on finish
  useEffect(() => {
    if (isFinished) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = window.setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isFinished]);

  const currentQuestion = activeQuestions[currentIndex] || null;

  const selectOption = useCallback((optionIndex: number) => {
    if (isSubmitted) return; // Cannot change option after submission
    setSelectedOption(optionIndex);
  }, [isSubmitted]);

  const submitAnswer = useCallback(() => {
    if (selectedOption === null || !currentQuestion || isSubmitted) return;

    setIsSubmitted(true);
    const updatedAnswers = {
      ...userAnswers,
      [currentQuestion.id]: selectedOption,
    };
    setUserAnswers(updatedAnswers);

    // If this question was answered correctly in revision mode, remove it from revision queue
    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    if (isRevisionMode && isCorrect) {
      removeQuestionFromRevision(currentQuestion.id);
    }
  }, [selectedOption, currentQuestion, isSubmitted, userAnswers, isRevisionMode]);

  const nextQuestion = useCallback(() => {
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      // Quiz completed!
      setIsFinished(true);
    }
  }, [currentIndex, activeQuestions.length]);

  // Compute final statistics
  const calculateResults = useCallback(() => {
    let correctCount = 0;
    const wrongQuestions: QuizQuestionItem[] = [];

    activeQuestions.forEach((q) => {
      const chosen = userAnswers[q.id];
      if (chosen === q.correctAnswer) {
        correctCount += 1;
      } else {
        wrongQuestions.push(q);
      }
    });

    const total = activeQuestions.length;
    const incorrect = total - correctCount;
    const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    return {
      total,
      correct: correctCount,
      incorrect,
      accuracy,
      timeSpentSeconds: secondsElapsed,
      wrongQuestions,
    };
  }, [activeQuestions, userAnswers, secondsElapsed]);

  // Save attempt and queue wrong answers to revision storage
  useEffect(() => {
    if (isFinished && activeQuestions.length > 0) {
      const results = calculateResults();

      const attempt: QuizAttempt = {
        id: `attempt-${Date.now()}`,
        studySetId,
        studySetTitle,
        date: new Date().toISOString(),
        totalQuestions: results.total,
        correctAnswers: results.correct,
        incorrectAnswers: results.incorrect,
        accuracy: results.accuracy,
        timeSpentSeconds: results.timeSpentSeconds,
        userAnswers,
        wrongQuestions: results.wrongQuestions,
      };

      saveQuizAttempt(attempt);

      // Automatically store wrong questions into the revision queue
      if (results.wrongQuestions.length > 0) {
        addQuestionsToRevision(
          results.wrongQuestions,
          studySetId,
          studySetTitle,
          userAnswers
        );
      }
    }
  }, [isFinished, activeQuestions.length, calculateResults, studySetId, studySetTitle, userAnswers]);

  // Retry ONLY incorrect questions
  const retryWrongAnswers = useCallback(() => {
    const results = calculateResults();
    if (results.wrongQuestions.length > 0) {
      setActiveQuestions(results.wrongQuestions);
      setCurrentIndex(0);
      setSelectedOption(null);
      setIsSubmitted(false);
      setUserAnswers({});
      setIsFinished(false);
      setSecondsElapsed(0);
    }
  }, [calculateResults]);

  // Retake the entire original quiz
  const retakeFullQuiz = useCallback(() => {
    setActiveQuestions(questions);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setUserAnswers({});
    setIsFinished(false);
    setSecondsElapsed(0);
  }, [questions]);

  // Format seconds to mm:ss
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = activeQuestions.length > 0
    ? Math.round(((currentIndex + (isFinished ? 1 : 0)) / activeQuestions.length) * 100)
    : 0;

  return {
    currentQuestion,
    currentIndex,
    totalQuestions: activeQuestions.length,
    selectedOption,
    isSubmitted,
    isFinished,
    userAnswers,
    secondsElapsed,
    formattedTime: formatTime(secondsElapsed),
    progressPercentage,
    selectOption,
    submitAnswer,
    nextQuestion,
    retryWrongAnswers,
    retakeFullQuiz,
    results: isFinished ? calculateResults() : null,
  };
}

import { useState, useCallback, useEffect } from 'react';
import { FlashcardItem, FlashcardSession } from '../types/study';
import { saveFlashcardSession } from '../utils/storage';

interface UseFlashcardsProps {
  cards: FlashcardItem[];
  studySetId: string;
  studySetTitle: string;
}

export function useFlashcards({ cards, studySetId, studySetTitle }: UseFlashcardsProps) {
  const [deck, setDeck] = useState<FlashcardItem[]>(cards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCardIds, setKnownCardIds] = useState<Set<string>>(new Set());
  const [revisionCardIds, setRevisionCardIds] = useState<Set<string>>(new Set());
  const [isCompleted, setIsCompleted] = useState(false);

  // Sync if input cards change
  useEffect(() => {
    setDeck(cards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setKnownCardIds(new Set());
    setRevisionCardIds(new Set());
    setIsCompleted(false);
  }, [cards]);

  const currentCard = deck[currentIndex] || null;

  const flip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const nextCard = useCallback(() => {
    setIsFlipped(false);
    if (currentIndex < deck.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  }, [currentIndex, deck.length]);

  const prevCard = useCallback(() => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const markKnown = useCallback(() => {
    if (!currentCard) return;
    setKnownCardIds((prev) => {
      const next = new Set(prev);
      next.add(currentCard.id);
      return next;
    });
    setRevisionCardIds((prev) => {
      const next = new Set(prev);
      next.delete(currentCard.id);
      return next;
    });
    nextCard();
  }, [currentCard, nextCard]);

  const markNeedRevision = useCallback(() => {
    if (!currentCard) return;
    setRevisionCardIds((prev) => {
      const next = new Set(prev);
      next.add(currentCard.id);
      return next;
    });
    setKnownCardIds((prev) => {
      const next = new Set(prev);
      next.delete(currentCard.id);
      return next;
    });
    nextCard();
  }, [currentCard, nextCard]);

  const restartSession = useCallback(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setKnownCardIds(new Set());
    setRevisionCardIds(new Set());
    setIsCompleted(false);
  }, []);

  const reviewOnlyNeedRevision = useCallback(() => {
    const weakCards = deck.filter((c) => revisionCardIds.has(c.id));
    if (weakCards.length > 0) {
      setDeck(weakCards);
      setCurrentIndex(0);
      setIsFlipped(false);
      setKnownCardIds(new Set());
      setRevisionCardIds(new Set());
      setIsCompleted(false);
    }
  }, [deck, revisionCardIds]);

  const shuffleDeck = useCallback(() => {
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [deck]);

  // Save session when user finishes
  useEffect(() => {
    if (isCompleted && deck.length > 0) {
      const session: FlashcardSession = {
        id: `fc-session-${Date.now()}`,
        studySetId,
        studySetTitle,
        date: new Date().toISOString(),
        totalCards: deck.length,
        knownCardIds: Array.from(knownCardIds),
        revisionCardIds: Array.from(revisionCardIds),
        knownCount: knownCardIds.size,
        revisionCount: revisionCardIds.size,
      };
      saveFlashcardSession(session);
    }
  }, [isCompleted, deck.length, studySetId, studySetTitle, knownCardIds, revisionCardIds]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        flip();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        nextCard();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        prevCard();
      } else if (e.key === '1') {
        markNeedRevision();
      } else if (e.key === '2') {
        markKnown();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flip, nextCard, prevCard, markKnown, markNeedRevision]);

  const progressPercentage = deck.length > 0 ? Math.round(((currentIndex + (isCompleted ? 1 : 0)) / deck.length) * 100) : 0;
  const knownPercentage = deck.length > 0 ? Math.round((knownCardIds.size / deck.length) * 100) : 0;

  return {
    currentCard,
    currentIndex,
    totalCards: deck.length,
    isFlipped,
    isCompleted,
    knownCardIds,
    revisionCardIds,
    knownCount: knownCardIds.size,
    revisionCount: revisionCardIds.size,
    progressPercentage,
    knownPercentage,
    flip,
    nextCard,
    prevCard,
    markKnown,
    markNeedRevision,
    restartSession,
    reviewOnlyNeedRevision,
    shuffleDeck,
  };
}

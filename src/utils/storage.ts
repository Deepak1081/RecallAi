import { StudySet, QuizAttempt, FlashcardSession, RevisionItem, UserSettings, QuizQuestionItem } from '../types/study';

const KEYS = {
  STUDY_SETS: 'recallai_study_sets_v1',
  QUIZ_ATTEMPTS: 'recallai_quiz_attempts_v1',
  FLASHCARD_SESSIONS: 'recallai_flashcard_sessions_v1',
  REVISION_QUEUE: 'recallai_revision_queue_v1',
  SETTINGS: 'recallai_settings_v1',
};

// Default User Settings
export const DEFAULT_SETTINGS: UserSettings = {
  activeProvider: 'groq',
  groqApiKey: '',
  geminiApiKey: '',
  preferredGroqModel: 'llama-3.3-70b-versatile',
  preferredModel: 'gemini-2.5-flash',
  defaultDifficulty: 'medium',
  defaultCount: 5,
  soundEffects: true,
};

// Initial Seed Study Set (Operating Systems)
const INITIAL_STUDY_SETS: StudySet[] = [
  {
    id: 'seed-os-set',
    title: 'Operating Systems & Architecture',
    type: 'both',
    sourcePrompt: 'Operating Systems core principles: processes, threads, virtual memory, scheduling, and concurrency.',
    difficulty: 'medium',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    flashcards: [
      {
        id: 'seed-card-1',
        question: 'What is the primary difference between a process and a thread?',
        answer: 'A process is an isolated program execution unit with private address space. A thread is a lightweight unit of execution sharing memory with peer threads in the same process.',
        explanation: 'Processes provide strong protection at higher context-switch cost; threads provide low latency concurrency but risk shared-memory race conditions.'
      },
      {
        id: 'seed-card-2',
        question: 'What are the four necessary conditions for Deadlock?',
        answer: 'Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait (Coffman conditions).',
        explanation: 'Breaking any single condition prevents deadlock entirely.'
      },
      {
        id: 'seed-card-3',
        question: 'What is the role of the TLB (Translation Lookaside Buffer)?',
        answer: 'A high-speed MMU hardware cache that stores recent virtual-to-physical address mappings to minimize RAM page table lookups.',
        explanation: 'A TLB hit avoids multi-level page table walks in main memory.'
      },
      {
        id: 'seed-card-4',
        question: 'What causes Thrashing in an operating system?',
        answer: 'When the collective working sets of all processes exceed available physical RAM, causing the OS to spend more time paging than executing instructions.',
        explanation: 'Thrashing collapses CPU utilization due to constant page fault disk I/O.'
      }
    ],
    questions: [
      {
        id: 'seed-q-1',
        question: 'Which CPU scheduling algorithm guarantees complete freedom from starvation?',
        options: [
          'Round Robin (RR)',
          'Shortest Job First (SJF)',
          'Static Priority Scheduling',
          'Shortest Remaining Time First'
        ],
        correctAnswer: 0,
        explanation: 'Round Robin gives every active task a periodic time quantum in circular succession, guaranteeing progress.'
      },
      {
        id: 'seed-q-2',
        question: 'What information is preserved in a Process Control Block (PCB)?',
        options: [
          'Program counter, CPU registers, memory limits, and process state',
          'Only the process source code text',
          'The compiler binary symbol table',
          'Network DNS lookup caches'
        ],
        correctAnswer: 0,
        explanation: 'The PCB maintains the exact machine state needed to pause and resume the process during context switches.'
      },
      {
        id: 'seed-q-3',
        question: 'What is Belady\'s Anomaly in page replacement?',
        options: [
          'The phenomenon where increasing physical page frames increases page faults under FIFO',
          'A hardware race condition inside the CPU bus',
          'A memory leak caused by unclosed file descriptors',
          'A deadlock caused by circular wait in disk queues'
        ],
        correctAnswer: 0,
        explanation: 'Belady\'s Anomaly specifically occurs in FIFO because it is not a stack-based algorithm like LRU or OPT.'
      }
    ]
  }
];

function safeJsonParse<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.warn(`[storage] Error parsing key ${key}:`, e);
    return fallback;
  }
}

function safeJsonSave<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`[storage] Error saving key ${key}:`, e);
  }
}

// Study Sets
export function getSavedStudySets(): StudySet[] {
  const sets = safeJsonParse<StudySet[]>(KEYS.STUDY_SETS, []);
  if (sets.length === 0) {
    safeJsonSave(KEYS.STUDY_SETS, INITIAL_STUDY_SETS);
    return INITIAL_STUDY_SETS;
  }
  return sets;
}

export function saveStudySet(set: StudySet): void {
  const sets = getSavedStudySets();
  const index = sets.findIndex((s) => s.id === set.id);
  if (index >= 0) {
    sets[index] = { ...set, updatedAt: new Date().toISOString() };
  } else {
    sets.unshift(set);
  }
  safeJsonSave(KEYS.STUDY_SETS, sets);
}

export function deleteStudySet(id: string): void {
  const sets = getSavedStudySets().filter((s) => s.id !== id);
  safeJsonSave(KEYS.STUDY_SETS, sets);
}

export function getStudySetById(id: string): StudySet | undefined {
  return getSavedStudySets().find((s) => s.id === id);
}

// Quiz Attempts
export function getQuizAttempts(): QuizAttempt[] {
  return safeJsonParse<QuizAttempt[]>(KEYS.QUIZ_ATTEMPTS, []);
}

export function saveQuizAttempt(attempt: QuizAttempt): void {
  const attempts = getQuizAttempts();
  attempts.unshift(attempt);
  if (attempts.length > 100) attempts.length = 100;
  safeJsonSave(KEYS.QUIZ_ATTEMPTS, attempts);
}

// Flashcard Sessions
export function getFlashcardSessions(): FlashcardSession[] {
  return safeJsonParse<FlashcardSession[]>(KEYS.FLASHCARD_SESSIONS, []);
}

export function saveFlashcardSession(session: FlashcardSession): void {
  const sessions = getFlashcardSessions();
  sessions.unshift(session);
  if (sessions.length > 100) sessions.length = 100;
  safeJsonSave(KEYS.FLASHCARD_SESSIONS, sessions);
}

// Revision Queue (Incorrectly answered questions)
export function getRevisionQueue(): RevisionItem[] {
  return safeJsonParse<RevisionItem[]>(KEYS.REVISION_QUEUE, []);
}

export function addQuestionsToRevision(
  questions: QuizQuestionItem[],
  sourceStudySetId: string,
  sourceTitle: string,
  userAnswers?: Record<string, number>
): void {
  if (!questions || questions.length === 0) return;
  const queue = getRevisionQueue();

  questions.forEach((q) => {
    const existingIndex = queue.findIndex((item) => item.question.id === q.id || item.question.question === q.question);
    if (existingIndex >= 0) {
      queue[existingIndex].attemptCount += 1;
      queue[existingIndex].lastSelectedAnswer = userAnswers ? userAnswers[q.id] : undefined;
    } else {
      queue.unshift({
        id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        question: q,
        sourceStudySetId,
        sourceTitle,
        dateAdded: new Date().toISOString(),
        attemptCount: 1,
        lastSelectedAnswer: userAnswers ? userAnswers[q.id] : undefined,
      });
    }
  });

  safeJsonSave(KEYS.REVISION_QUEUE, queue);
}

export function removeQuestionFromRevision(questionId: string): void {
  const queue = getRevisionQueue().filter(
    (item) => item.question.id !== questionId && item.id !== questionId
  );
  safeJsonSave(KEYS.REVISION_QUEUE, queue);
}

export function clearRevisionQueue(): void {
  safeJsonSave(KEYS.REVISION_QUEUE, []);
}

// User Settings
export function getUserSettings(): UserSettings {
  return safeJsonParse<UserSettings>(KEYS.SETTINGS, DEFAULT_SETTINGS);
}

export function saveUserSettings(settings: Partial<UserSettings>): UserSettings {
  const current = getUserSettings();
  const updated = { ...current, ...settings };
  safeJsonSave(KEYS.SETTINGS, updated);
  return updated;
}

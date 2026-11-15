export type ContentType = 'flashcards' | 'quiz' | 'both';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type AiProvider = 'groq' | 'gemini';

export interface FlashcardItem {
  id: string;
  question: string;
  answer: string;
  explanation: string;
}

export interface QuizQuestionItem {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // 0-based index
  explanation: string;
}

export interface StudySet {
  id: string;
  title: string;
  type: ContentType;
  sourcePrompt: string;
  difficulty: DifficultyLevel;
  createdAt: string;
  updatedAt?: string;
  flashcards?: FlashcardItem[];
  questions?: QuizQuestionItem[];
}

export interface QuizAttempt {
  id: string;
  studySetId: string;
  studySetTitle: string;
  date: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number; // percentage (0 - 100)
  timeSpentSeconds: number;
  userAnswers: Record<string, number>; // questionId -> selectedIndex
  wrongQuestions: QuizQuestionItem[];
}

export interface FlashcardSession {
  id: string;
  studySetId: string;
  studySetTitle: string;
  date: string;
  totalCards: number;
  knownCardIds: string[];
  revisionCardIds: string[];
  knownCount: number;
  revisionCount: number;
}

export interface RevisionItem {
  id: string;
  question: QuizQuestionItem;
  sourceStudySetId: string;
  sourceTitle: string;
  dateAdded: string;
  attemptCount: number;
  lastSelectedAnswer?: number;
}

export interface GenerationParams {
  content: string;
  contentType: ContentType;
  difficulty: DifficultyLevel;
  count: number;
  provider?: AiProvider;
}

export interface GenerationResponse {
  title: string;
  type: ContentType;
  flashcards?: FlashcardItem[];
  questions?: QuizQuestionItem[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  source?: 'groq' | 'gemini' | 'curated_sample' | 'curated_sample_fallback';
  notice?: string;
  error?: {
    code?: string;
    message: string;
    details?: any;
  };
}

export interface UserSettings {
  activeProvider: AiProvider;
  groqApiKey: string;
  geminiApiKey: string;
  preferredGroqModel: string;
  preferredModel: string;
  defaultDifficulty: DifficultyLevel;
  defaultCount: number;
  soundEffects: boolean;
}

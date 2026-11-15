import { z } from 'zod';

// Flashcard single item schema
export const FlashcardItemSchema = z.object({
  id: z.string().optional().default(() => `card-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`),
  question: z.string().min(3, "Question must be at least 3 characters long"),
  answer: z.string().min(1, "Answer cannot be empty"),
  explanation: z.string().optional().default(""),
});

// Quiz question single item schema
export const QuizQuestionItemSchema = z.object({
  id: z.string().optional().default(() => `q-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`),
  question: z.string().min(5, "Question must be at least 5 characters long"),
  options: z.array(z.string().min(1, "Option cannot be empty")).min(2, "Must have at least 2 options").max(6, "Cannot exceed 6 options"),
  correctAnswer: z.number().int().min(0),
  explanation: z.string().optional().default(""),
}).refine(
  (data) => data.correctAnswer >= 0 && data.correctAnswer < data.options.length,
  {
    message: "correctAnswer must be a valid index in the options array",
    path: ["correctAnswer"],
  }
);

// Flashcards only schema
export const FlashcardsResponseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.literal("flashcards"),
  flashcards: z.array(FlashcardItemSchema).min(1, "Must generate at least 1 flashcard"),
});

// Quiz only schema
export const QuizResponseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.literal("quiz"),
  questions: z.array(QuizQuestionItemSchema).min(1, "Must generate at least 1 quiz question"),
});

// Both flashcards and quiz schema
export const BothResponseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.literal("both"),
  flashcards: z.array(FlashcardItemSchema).min(1, "Must generate at least 1 flashcard"),
  questions: z.array(QuizQuestionItemSchema).min(1, "Must generate at least 1 quiz question"),
});

// Combined schema based on type
export const StudyContentSchema = z.discriminatedUnion("type", [
  FlashcardsResponseSchema,
  QuizResponseSchema,
  BothResponseSchema,
]);

// Request payload schema for generation
export const GenerateRequestSchema = z.object({
  content: z.string().min(3, "Please provide topic or notes of at least 3 characters").max(20000, "Content cannot exceed 20,000 characters"),
  contentType: z.enum(["flashcards", "quiz", "both"]),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  count: z.number().int().min(1).max(30).default(5),
});

import { z } from 'zod';
import { GenerationResponse } from '../types/study';

// Single Flashcard Schema
export const FlashcardItemSchema = z.object({
  id: z.string().default(() => `card-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`),
  question: z.string().min(1, 'Question cannot be empty'),
  answer: z.string().min(1, 'Answer cannot be empty'),
  explanation: z.string().optional().default(''),
});

// Single Quiz Question Schema
export const QuizQuestionItemSchema = z.object({
  id: z.string().default(() => `q-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`),
  question: z.string().min(1, 'Question cannot be empty'),
  options: z.array(z.string().min(1, 'Option cannot be empty')).min(2, 'At least 2 options required'),
  correctAnswer: z.number().int().min(0),
  explanation: z.string().optional().default(''),
}).refine(
  (data) => data.correctAnswer >= 0 && data.correctAnswer < data.options.length,
  {
    message: 'correctAnswer must be a valid index in options',
    path: ['correctAnswer'],
  }
);

// Flashcards response schema
export const FlashcardsResponseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  type: z.literal('flashcards'),
  flashcards: z.array(FlashcardItemSchema).min(1, 'At least one flashcard required'),
});

// Quiz response schema
export const QuizResponseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  type: z.literal('quiz'),
  questions: z.array(QuizQuestionItemSchema).min(1, 'At least one question required'),
});

// Both response schema
export const BothResponseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  type: z.literal('both'),
  flashcards: z.array(FlashcardItemSchema).min(1, 'At least one flashcard required'),
  questions: z.array(QuizQuestionItemSchema).min(1, 'At least one question required'),
});

export const StudyContentSchema = z.discriminatedUnion('type', [
  FlashcardsResponseSchema,
  QuizResponseSchema,
  BothResponseSchema,
]);

/**
 * Validate incoming response data on the client side
 */
export function validateStudyResponse(data: unknown): {
  success: boolean;
  data?: GenerationResponse;
  error?: string;
} {
  try {
    const parsed = StudyContentSchema.parse(data);
    return {
      success: true,
      data: parsed as GenerationResponse,
    };
  } catch (err) {
    if (err instanceof z.ZodError) {
      const issueDetails = err.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
      return {
        success: false,
        error: `Invalid study content structure received: ${issueDetails}`,
      };
    }
    return {
      success: false,
      error: 'Malformed study content: could not validate schema.',
    };
  }
}

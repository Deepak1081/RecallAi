import { GoogleGenerativeAI } from '@google/generative-ai';
import { StudyContentSchema } from '../schemas/study.schema.js';

/**
 * Clean and parse raw JSON text returned from the AI model
 * @param {string} rawText 
 * @returns {any}
 */
export function cleanAndParseJson(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('AI returned an empty or invalid response string.');
  }

  let cleaned = rawText.trim();

  // Strip Markdown code fence blocks (```json ... ``` or ``` ...)
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '');
    cleaned = cleaned.replace(/\n?```\s*$/, '');
  }

  // Find the first '{' and last '}' to handle any accidental conversational preamble or suffix
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error('No valid JSON object structure found in AI response.');
  }

  cleaned = cleaned.substring(firstBrace, lastBrace + 1);

  try {
    return JSON.parse(cleaned);
  } catch (parseError) {
    // Attempt minor recovery: fix trailing commas in objects or arrays
    const sanitized = cleaned
      .replace(/,\s*([}\]])/g, '$1')
      .replace(/[\u201C\u201D]/g, '"'); // normalize smart quotes
    try {
      return JSON.parse(sanitized);
    } catch {
      throw new Error(`Failed to parse AI response as JSON: ${parseError.message}`);
    }
  }
}

/**
 * Build system prompt and user prompt based on request parameters
 */
function buildPrompt({ content, contentType, difficulty, count }) {
  const difficultyGuidance = {
    easy: "Focus on fundamental concepts, key definitions, and straightforward facts. Explanations should be simple and direct.",
    medium: "Cover core principles, mechanisms, relationships, and practical scenarios. Explanations should explain 'why' and 'how'.",
    hard: "Focus on deep architectural nuances, edge cases, trade-offs, and critical analysis. Questions should challenge mastery.",
  }[difficulty] || "Focus on key principles and clear understanding.";

  const formatSpecs = [];

  if (contentType === 'flashcards' || contentType === 'both') {
    formatSpecs.push(`
- For flashcards:
  - Generate exactly ${count} high-quality flashcards.
  - "question": A clear, engaging, thought-provoking question or term to test understanding.
  - "answer": A comprehensive yet concise definition or answer.
  - "explanation": An enriching context, analogy, or key takeaway that reinforces retention.
  - "id": A unique string like "card-1", "card-2", etc.
`);
  }

  if (contentType === 'quiz' || contentType === 'both') {
    formatSpecs.push(`
- For quiz:
  - Generate exactly ${count} multiple-choice questions.
  - "question": An insightful question testing real comprehension (not trivial trivia).
  - "options": An array of EXACTLY 4 distinct, plausible options. Only ONE option must be clearly correct; the others should be realistic distractors.
  - "correctAnswer": The 0-based integer index of the correct option in "options" (must be 0, 1, 2, or 3).
  - "explanation": A thorough explanation explaining why the correct answer is right and why key distractors are incorrect.
  - "id": A unique string like "q-1", "q-2", etc.
`);
  }

  return `
You are RecallAI, an expert educational AI tutor and curriculum engineer.
Your task is to analyze the user's educational topic or study notes and generate structured, interactive learning material.

USER TOPIC / STUDY NOTES:
"""
${content}
"""

CONFIGURATION:
- Target Content Type: ${contentType}
- Target Difficulty: ${difficulty} (${difficultyGuidance})
- Target Quantity: ${count} items

REQUIREMENTS:
1. Output MUST be valid, well-formed JSON matching the required schema.
2. Do NOT output markdown ticks, preamble, or commentary outside the JSON.
3. Every field must be populated with substantive educational content.
${formatSpecs.join('\n')}

EXPECTED JSON FORMAT:
${
  contentType === 'flashcards'
    ? `{
  "title": "<A concise, descriptive title for this topic>",
  "type": "flashcards",
  "flashcards": [
    {
      "id": "card-1",
      "question": "<Question or concept>",
      "answer": "<Core answer or definition>",
      "explanation": "<Educational explanation or context>"
    }
  ]
}`
    : contentType === 'quiz'
    ? `{
  "title": "<A concise, descriptive title for this quiz>",
  "type": "quiz",
  "questions": [
    {
      "id": "q1",
      "question": "<Multiple-choice question>",
      "options": [
        "<Option A>",
        "<Option B>",
        "<Option C>",
        "<Option D>"
      ],
      "correctAnswer": 0,
      "explanation": "<Explanation of why option 0 is correct>"
    }
  ]
}`
    : `{
  "title": "<A concise, descriptive title for this study set>",
  "type": "both",
  "flashcards": [
    {
      "id": "card-1",
      "question": "<Question or concept>",
      "answer": "<Core answer or definition>",
      "explanation": "<Educational explanation or context>"
    }
  ],
  "questions": [
    {
      "id": "q1",
      "question": "<Multiple-choice question>",
      "options": [
        "<Option A>",
        "<Option B>",
        "<Option C>",
        "<Option D>"
      ],
      "correctAnswer": 0,
      "explanation": "<Explanation of why this option is correct>"
    }
  ]
}`
}

Generate the JSON now.
`.trim();
}

/**
 * Generate study content using Google Gemini API
 */
export async function generateStudyContent({ content, contentType, difficulty, count, userApiKey = null }) {
  const apiKey = userApiKey || process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.trim() === '') {
    const error = new Error('GEMINI_API_KEY is not configured. Please set your Gemini API key in backend/.env or enter it in Settings.');
    error.statusCode = 401;
    error.code = 'MISSING_API_KEY';
    throw error;
  }

  const genAI = new GoogleGenerativeAI(apiKey.trim());

  // Try modern models with fallback
  const modelsToTry = [
    process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
  ];

  let rawText = '';
  let lastError = null;

  const prompt = buildPrompt({ content, contentType, difficulty, count });

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.4,
          maxOutputTokens: 8192,
        },
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      rawText = response.text();

      if (rawText && rawText.trim().length > 0) {
        break; // Successfully got text
      }
    } catch (err) {
      lastError = err;
      console.warn(`[GeminiService] Attempt with model ${modelName} failed:`, err.message);
      // If error is invalid API key or 401/403, don't retry other models
      if (err.message?.includes('API_KEY_INVALID') || err.message?.includes('401') || err.message?.includes('403')) {
        const error = new Error('Invalid Gemini API Key provided. Please verify your API key in Google AI Studio.');
        error.statusCode = 401;
        error.code = 'INVALID_API_KEY';
        throw error;
      }
    }
  }

  if (!rawText || rawText.trim().length === 0) {
    const error = new Error(lastError ? `Gemini API error: ${lastError.message}` : 'Gemini returned an empty response.');
    error.statusCode = 502;
    error.code = 'EMPTY_AI_RESPONSE';
    throw error;
  }

  // Parse raw JSON
  const parsedData = cleanAndParseJson(rawText);

  // Normalize data if necessary before schema validation
  if (!parsedData.type) {
    parsedData.type = contentType;
  }
  if (!parsedData.title) {
    parsedData.title = typeof content === 'string' && content.length < 50 ? content : 'Generated Study Set';
  }

  // Ensure unique IDs
  if (Array.isArray(parsedData.flashcards)) {
    parsedData.flashcards = parsedData.flashcards.map((card, idx) => ({
      ...card,
      id: card.id || `card-${Date.now()}-${idx + 1}`,
      explanation: card.explanation || '',
    }));
  }

  if (Array.isArray(parsedData.questions)) {
    parsedData.questions = parsedData.questions.map((q, idx) => {
      // Ensure correctAnswer is a number
      let correctIdx = typeof q.correctAnswer === 'number' ? q.correctAnswer : 0;
      if (Array.isArray(q.options) && (correctIdx < 0 || correctIdx >= q.options.length)) {
        correctIdx = 0;
      }
      return {
        ...q,
        id: q.id || `q-${Date.now()}-${idx + 1}`,
        correctAnswer: correctIdx,
        explanation: q.explanation || '',
      };
    });
  }

  // Validate strictly against Zod Schema
  const validationResult = StudyContentSchema.safeParse(parsedData);
  if (!validationResult.success) {
    console.error('[GeminiService] Zod Validation Failed:', JSON.stringify(validationResult.error.format(), null, 2));
    const error = new Error(`AI generated response did not match required schema: ${validationResult.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')}`);
    error.statusCode = 502;
    error.code = 'INVALID_SCHEMA';
    error.details = validationResult.error.issues;
    throw error;
  }

  return validationResult.data;
}

/**
 * Diagnostic test to verify Gemini API connection
 */
export async function testGeminiConnection(userApiKey = null) {
  const apiKey = userApiKey || process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.trim() === '') {
    return {
      connected: false,
      message: 'GEMINI_API_KEY is not configured in backend/.env',
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey.trim());
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.5-flash' });
    const result = await model.generateContent('Say "OK" in one word.');
    const response = await result.response;
    const text = response.text();

    return {
      connected: true,
      message: 'Gemini API is successfully connected and responding.',
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      echo: text.trim(),
    };
  } catch (err) {
    return {
      connected: false,
      message: err.message,
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    };
  }
}

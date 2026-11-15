import Groq from 'groq-sdk';
import { StudyContentSchema } from '../schemas/study.schema.js';
import { cleanAndParseJson } from './gemini.service.js';

// Prioritized list of active Groq models
const GROQ_CANDIDATE_MODELS = [
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'qwen/qwen3.8-27b',
  'llama-3.1-8b-instant',
  'llama-3.3-70b-versatile',
  'llama-3.1-70b-versatile',
  'mixtral-8x7b-32768',
];

/**
 * Build prompt for Groq model
 */
function buildGroqPrompt({ content, contentType, difficulty, count }) {
  const difficultyGuidance = {
    easy: "Focus on fundamental definitions, core terminology, and foundational facts. Explanations should be simple and direct.",
    medium: "Cover mechanisms, how things operate under the hood, and practical scenarios. Explanations should explain 'why' and 'how'.",
    hard: "Focus on advanced trade-offs, edge cases, failure modes, and performance optimization. Questions should test genuine mastery.",
  }[difficulty] || "Focus on core principles and clear educational understanding.";

  const formatSpecs = [];

  if (contentType === 'flashcards' || contentType === 'both') {
    formatSpecs.push(`
- For flashcards:
  - Generate exactly ${count} high-yield flashcards.
  - "question": An engaging question or term that tests understanding.
  - "answer": A comprehensive yet crisp explanation or definition.
  - "explanation": An enriching context or analogy that deepens long-term retention.
  - "id": A unique string like "card-1", "card-2", etc.
`);
  }

  if (contentType === 'quiz' || contentType === 'both') {
    formatSpecs.push(`
- For quiz:
  - Generate exactly ${count} multiple-choice questions.
  - "question": A conceptual question testing comprehension.
  - "options": An array of EXACTLY 4 distinct, plausible options. Only ONE option must be clearly correct; the others should be realistic distractors.
  - "correctAnswer": The 0-based integer index of the correct option (0, 1, 2, or 3).
  - "explanation": A thorough explanation explaining why the correct answer is right and why key distractors are incorrect.
  - "id": A unique string like "q-1", "q-2", etc.
`);
  }

  return `
USER STUDY TOPIC / NOTES:
"""
${content}
"""

TARGET SPECIFICATION:
- Content Type: ${contentType}
- Difficulty: ${difficulty} (${difficultyGuidance})
- Quantity: ${count} items

REQUIREMENTS:
1. You MUST respond with ONLY a valid, parseable JSON object matching the requested schema.
2. Do NOT add any preamble, markdown formatting or text outside the JSON.
${formatSpecs.join('\n')}

EXPECTED JSON SCHEMA:
${
  contentType === 'flashcards'
    ? `{
  "title": "<Concise descriptive title>",
  "type": "flashcards",
  "flashcards": [
    {
      "id": "card-1",
      "question": "<Question or concept>",
      "answer": "<Core answer>",
      "explanation": "<Educational explanation>"
    }
  ]
}`
    : contentType === 'quiz'
    ? `{
  "title": "<Concise quiz title>",
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
  "title": "<Concise study set title>",
  "type": "both",
  "flashcards": [
    {
      "id": "card-1",
      "question": "<Question or concept>",
      "answer": "<Core answer>",
      "explanation": "<Educational explanation>"
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
`.trim();
}

/**
 * Generate study content using Groq API with automatic model fallback
 */
export async function generateStudyContentWithGroq({ content, contentType, difficulty, count, userApiKey = null }) {
  const apiKey = userApiKey || process.env.GROQ_API_KEY;

  if (!apiKey || apiKey === 'your_groq_api_key_here' || apiKey.trim() === '') {
    const error = new Error('GROQ_API_KEY is not configured. Please set your Groq API key in backend/.env or enter it in Settings.');
    error.statusCode = 401;
    error.code = 'MISSING_API_KEY';
    throw error;
  }

  const groq = new Groq({ apiKey: apiKey.trim() });
  const prompt = buildGroqPrompt({ content, contentType, difficulty, count });

  // Dynamically resolve models available or use prioritized candidate list
  let uniqueModels = [
    process.env.GROQ_MODEL,
    ...GROQ_CANDIDATE_MODELS,
  ].filter(Boolean);

  // Filter out duplicates
  uniqueModels = [...new Set(uniqueModels)];

  let rawText = '';
  let lastError = null;

  for (const modelName of uniqueModels) {
    try {
      console.log(`[GroqService] Attempting generation with model: ${modelName}`);
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are RecallAI, an expert educational curriculum tutor and assessment engineer. You generate rigorous, high-yield flashcards and multiple-choice quizzes formatted as strict JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: modelName,
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      rawText = completion.choices[0]?.message?.content || '';
      if (rawText && rawText.trim().length > 0) {
        console.log(`[GroqService] Successfully generated content using model: ${modelName}`);
        break;
      }
    } catch (err) {
      lastError = err;
      console.warn(`[GroqService] Model ${modelName} failed:`, err.message);

      // If invalid API key, do not retry other models
      if (err.status === 401 || err.message?.includes('invalid_api_key') || err.message?.includes('401')) {
        const error = new Error('Invalid Groq API Key. Please verify your API key in console.groq.com/keys.');
        error.statusCode = 401;
        error.code = 'INVALID_API_KEY';
        throw error;
      }

      // If rate limited, throw immediately
      if (err.status === 429) {
        const error = new Error('Groq rate limit exceeded. Please wait a moment before trying again.');
        error.statusCode = 429;
        error.code = 'RATE_LIMIT_EXCEEDED';
        throw error;
      }

      // If model not found or decommissioned, continue to next model in loop
      if (
        err.status === 404 ||
        err.status === 400 ||
        err.message?.includes('model_not_found') ||
        err.message?.includes('does not exist') ||
        err.message?.includes('decommissioned')
      ) {
        continue;
      }
    }
  }

  if (!rawText || rawText.trim().length === 0) {
    const errorMsg = lastError ? lastError.message : 'Groq returned an empty response.';
    const error = new Error(`Groq generation failed across all available models: ${errorMsg}`);
    error.statusCode = lastError?.status || 502;
    error.code = 'GROQ_GENERATION_FAILED';
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
    console.error('[GroqService] Zod Validation Failed:', JSON.stringify(validationResult.error.format(), null, 2));
    const error = new Error(`AI generated response did not match required schema: ${validationResult.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')}`);
    error.statusCode = 502;
    error.code = 'INVALID_SCHEMA';
    error.details = validationResult.error.issues;
    throw error;
  }

  return validationResult.data;
}

/**
 * Diagnostic test for Groq API Key with automatic model fallback
 */
export async function testGroqConnection(userApiKey = null) {
  const apiKey = userApiKey || process.env.GROQ_API_KEY;

  if (!apiKey || apiKey === 'your_groq_api_key_here' || apiKey.trim() === '') {
    return {
      connected: false,
      message: 'GROQ_API_KEY is not configured in backend/.env',
      model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
      provider: 'groq',
    };
  }

  const groq = new Groq({ apiKey: apiKey.trim() });
  const modelsToTry = [
    process.env.GROQ_MODEL,
    ...GROQ_CANDIDATE_MODELS,
  ].filter(Boolean);
  const uniqueModels = [...new Set(modelsToTry)];

  let lastError = null;

  for (const modelName of uniqueModels) {
    try {
      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: 'Say "OK" in one word.' }],
        model: modelName,
        max_tokens: 10,
      });
      const echo = completion.choices[0]?.message?.content || '';

      return {
        connected: true,
        message: `Connected successfully to Groq using model: ${modelName}`,
        model: modelName,
        provider: 'groq',
        echo: echo.trim(),
      };
    } catch (err) {
      lastError = err;
      if (err.status === 401 || err.message?.includes('invalid_api_key')) {
        return {
          connected: false,
          message: 'Invalid Groq API Key. Please verify your key at console.groq.com/keys.',
          model: modelName,
          provider: 'groq',
        };
      }
      if (
        err.status === 404 ||
        err.status === 400 ||
        err.message?.includes('model_not_found') ||
        err.message?.includes('does not exist') ||
        err.message?.includes('decommissioned')
      ) {
        continue; // Try next model
      }
    }
  }

  return {
    connected: false,
    message: lastError ? lastError.message : 'Connection test failed',
    model: 'openai/gpt-oss-120b',
    provider: 'groq',
  };
}

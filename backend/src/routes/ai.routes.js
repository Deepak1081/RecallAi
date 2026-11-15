import express from 'express';
import { GenerateRequestSchema } from '../schemas/study.schema.js';
import { generateStudyContent, testGeminiConnection } from '../services/gemini.service.js';
import { generateStudyContentWithGroq, testGroqConnection } from '../services/groq.service.js';
import { SAMPLE_STUDY_SETS } from '../data/sampleStudySets.js';

const router = express.Router();

/**
 * Determine the active AI provider
 */
function getActiveProvider(req) {
  const headerProvider = req.headers['x-ai-provider'];
  if (headerProvider === 'groq' || headerProvider === 'gemini') {
    return headerProvider;
  }

  const customKey = req.headers['x-groq-api-key'] || req.headers['x-gemini-api-key'] || req.headers['x-api-key'] || req.body?.apiKey;
  if (customKey) {
    if (customKey.startsWith('gsk_')) return 'groq';
    if (customKey.startsWith('AIza')) return 'gemini';
  }

  if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here' && process.env.GROQ_API_KEY.trim().length > 0) {
    return 'groq';
  }

  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here' && process.env.GEMINI_API_KEY.trim().length > 0) {
    return 'gemini';
  }

  return process.env.AI_PROVIDER || 'groq';
}

/**
 * GET /api/ai/health
 * Health check & configuration status for Groq and Gemini
 */
router.get('/health', async (req, res) => {
  const isGroqConfigured = Boolean(
    process.env.GROQ_API_KEY &&
    process.env.GROQ_API_KEY !== 'your_groq_api_key_here' &&
    process.env.GROQ_API_KEY.trim().length > 0
  );

  const isGeminiConfigured = Boolean(
    process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here' &&
    process.env.GEMINI_API_KEY.trim().length > 0
  );

  const activeProvider = isGroqConfigured ? 'groq' : isGeminiConfigured ? 'gemini' : (process.env.AI_PROVIDER || 'groq');

  res.json({
    status: 'ok',
    service: 'RecallAI Backend',
    activeProvider,
    groq: {
      configured: isGroqConfigured,
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    },
    gemini: {
      configured: isGeminiConfigured,
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * POST /api/ai/test-key
 * Test API key validity for Groq or Gemini
 */
router.post('/test-key', async (req, res) => {
  const key = req.body.apiKey || req.headers['x-api-key'] || req.headers['x-groq-api-key'] || req.headers['x-gemini-api-key'];
  const provider = req.body.provider || (key && key.startsWith('gsk_') ? 'groq' : (key && key.startsWith('AIza') ? 'gemini' : getActiveProvider(req)));

  if (provider === 'groq') {
    const result = await testGroqConnection(key);
    return res.json(result);
  } else {
    const result = await testGeminiConnection(key);
    return res.json({ ...result, provider: 'gemini' });
  }
});

/**
 * GET /api/ai/samples
 * List available suggested sample topics
 */
router.get('/samples', (req, res) => {
  const topics = Object.keys(SAMPLE_STUDY_SETS);
  res.json({ topics });
});

/**
 * POST /api/ai/sample
 * Fetch verified curated sample set for instant demonstration
 */
router.post('/sample', (req, res) => {
  const { topic, contentType = 'both' } = req.body;
  const sample = SAMPLE_STUDY_SETS[topic];

  if (!sample) {
    return res.status(404).json({
      success: false,
      error: { message: `No sample available for topic: ${topic}` },
    });
  }

  let data;
  if (contentType === 'flashcards') {
    data = sample.flashcards;
  } else if (contentType === 'quiz') {
    data = sample.quiz;
  } else {
    data = {
      title: `${topic} – Comprehensive Study Set`,
      type: 'both',
      flashcards: sample.flashcards.flashcards,
      questions: sample.quiz.questions,
    };
  }

  return res.json({
    success: true,
    data,
    source: 'curated_sample',
  });
});

/**
 * POST /api/ai/generate
 * Primary AI generation endpoint supporting Groq and Gemini
 */
router.post('/generate', async (req, res, next) => {
  try {
    // 1. Validate request body with Zod
    const validation = GenerateRequestSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request parameters.',
          details: validation.error.issues,
        },
      });
    }

    const { content, contentType, difficulty, count } = validation.data;

    // Check user provided key from headers or body
    const userGroqKey = req.headers['x-groq-api-key'];
    const userGeminiKey = req.headers['x-gemini-api-key'];
    const genericKey = req.headers['x-api-key'] || req.body.apiKey;

    let userKeyToUse = genericKey;
    let provider = req.headers['x-ai-provider'] || req.body.provider;

    if (userGroqKey) {
      userKeyToUse = userGroqKey;
      provider = 'groq';
    } else if (userGeminiKey) {
      userKeyToUse = userGeminiKey;
      provider = 'gemini';
    } else if (genericKey) {
      if (genericKey.startsWith('gsk_')) provider = 'groq';
      else if (genericKey.startsWith('AIza')) provider = 'gemini';
    }

    if (!provider) {
      provider = getActiveProvider(req);
    }

    const hasGroqKey = Boolean(
      (provider === 'groq' && userKeyToUse && userKeyToUse.trim().length > 0) ||
      (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here' && process.env.GROQ_API_KEY.trim().length > 0)
    );

    const hasGeminiKey = Boolean(
      (provider === 'gemini' && userKeyToUse && userKeyToUse.trim().length > 0) ||
      (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here' && process.env.GEMINI_API_KEY.trim().length > 0)
    );

    const hasAnyKey = hasGroqKey || hasGeminiKey;

    // If no API key configured, check if requested topic matches our high-quality sample sets
    if (!hasAnyKey) {
      const trimmedTopic = content.trim();
      const matchedSampleKey = Object.keys(SAMPLE_STUDY_SETS).find(
        (t) => t.toLowerCase() === trimmedTopic.toLowerCase()
      );

      if (matchedSampleKey) {
        const sample = SAMPLE_STUDY_SETS[matchedSampleKey];
        let data;
        if (contentType === 'flashcards') {
          data = sample.flashcards;
        } else if (contentType === 'quiz') {
          data = sample.quiz;
        } else {
          data = {
            title: `${matchedSampleKey} – Comprehensive Study Set`,
            type: 'both',
            flashcards: sample.flashcards.flashcards,
            questions: sample.quiz.questions,
          };
        }
        return res.json({
          success: true,
          data,
          source: 'curated_sample_fallback',
          notice: 'Generated using pre-verified curated curriculum because GROQ_API_KEY / GEMINI_API_KEY is not yet configured in backend/.env.',
        });
      }

      // If no matching sample topic and no key, return clear guidance
      return res.status(401).json({
        success: false,
        error: {
          code: 'MISSING_API_KEY',
          message: 'API key is not configured. Please add your GROQ_API_KEY (or GEMINI_API_KEY) to backend/.env, or enter your key in the Settings page. You can also test with one of the 5 suggested topics (e.g. Operating Systems, Database Management Systems, Machine Learning) for instant curriculum verification.',
        },
      });
    }

    // Call the designated provider
    if (provider === 'groq' && hasGroqKey) {
      console.log(`[AI Route] Generating with Groq (${difficulty}, count: ${count}) for topic: "${content.substring(0, 60)}..."`);
      const studyContent = await generateStudyContentWithGroq({
        content,
        contentType,
        difficulty,
        count,
        userApiKey: userKeyToUse ? userKeyToUse.trim() : null,
      });

      return res.json({
        success: true,
        data: studyContent,
        source: 'groq',
      });
    } else {
      console.log(`[AI Route] Generating with Gemini (${difficulty}, count: ${count}) for topic: "${content.substring(0, 60)}..."`);
      const studyContent = await generateStudyContent({
        content,
        contentType,
        difficulty,
        count,
        userApiKey: userKeyToUse ? userKeyToUse.trim() : null,
      });

      return res.json({
        success: true,
        data: studyContent,
        source: 'gemini',
      });
    }
  } catch (error) {
    console.error('[AI Route Error]:', error);
    next(error);
  }
});

export default router;

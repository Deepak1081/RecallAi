import { GenerationParams, GenerationResponse, ApiResponse, AiProvider } from '../types/study';
import { validateStudyResponse } from '../utils/validation';
import { getUserSettings } from '../utils/storage';

const API_BASE_URL = '/api/ai';

export class ApiError extends Error {
  code?: string;
  statusCode?: number;
  details?: any;

  constructor(message: string, statusCode?: number, code?: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

/**
 * Generate Study Content using the backend AI service (Groq or Gemini)
 * Supports AbortSignal for race condition prevention
 */
export async function generateStudyContent(
  params: GenerationParams,
  options?: { signal?: AbortSignal; apiKey?: string; provider?: AiProvider }
): Promise<{ data: GenerationResponse; source?: string; notice?: string }> {
  const settings = getUserSettings();
  const provider = options?.provider || params.provider || settings.activeProvider || 'groq';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-ai-provider': provider,
  };

  const groqKey = provider === 'groq' ? (options?.apiKey || settings.groqApiKey) : '';
  const geminiKey = provider === 'gemini' ? (options?.apiKey || settings.geminiApiKey) : '';

  if (groqKey && groqKey.trim()) {
    headers['x-groq-api-key'] = groqKey.trim();
  }
  if (geminiKey && geminiKey.trim()) {
    headers['x-gemini-api-key'] = geminiKey.trim();
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/generate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        content: params.content,
        contentType: params.contentType,
        difficulty: params.difficulty,
        count: params.count,
        provider,
      }),
      signal: options?.signal,
    });
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new ApiError('Request was superseded by a newer generation request.', 0, 'ABORTED');
    }
    throw new ApiError(
      'Could not connect to RecallAI backend server. Please verify the Express backend is running on port 5000.',
      0,
      'NETWORK_ERROR'
    );
  }

  // Parse JSON response body
  let body: ApiResponse<GenerationResponse>;
  try {
    body = await response.json();
  } catch (parseErr) {
    throw new ApiError(
      'Backend returned an unparseable response. Expected JSON.',
      response.status,
      'INVALID_JSON'
    );
  }

  // Check HTTP failure status codes
  if (!response.ok || !body.success) {
    const errorMsg = body?.error?.message || `Server responded with status ${response.status}`;
    const errorCode = body?.error?.code || (response.status === 401 ? 'MISSING_API_KEY' : 'SERVER_ERROR');
    throw new ApiError(errorMsg, response.status, errorCode, body?.error?.details);
  }

  if (!body.data) {
    throw new ApiError('AI generated an empty response payload.', 502, 'EMPTY_AI_RESPONSE');
  }

  // Frontend Zod schema validation
  const validation = validateStudyResponse(body.data);
  if (!validation.success || !validation.data) {
    throw new ApiError(
      validation.error || 'AI output did not match the expected educational schema.',
      502,
      'SCHEMA_VALIDATION_FAILED'
    );
  }

  return {
    data: validation.data,
    source: body.source,
    notice: body.notice,
  };
}

/**
 * Fetch a curated sample study set for instant demonstration
 */
export async function fetchCuratedSample(
  topic: string,
  contentType: 'flashcards' | 'quiz' | 'both' = 'both',
  options?: { signal?: AbortSignal }
): Promise<{ data: GenerationResponse; source: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/sample`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, contentType }),
      signal: options?.signal,
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson?.error?.message || 'Failed to load sample set.');
    }

    const json = await res.json();
    return {
      data: json.data,
      source: 'curated_sample',
    };
  } catch (err: any) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError(err.message || 'Sample loading failed.', 500, 'SAMPLE_FETCH_ERROR');
  }
}

/**
 * Check backend health and AI configuration status
 */
export async function getBackendHealth(): Promise<{
  status: string;
  activeProvider: string;
  groq: { configured: boolean; model: string };
  gemini: { configured: boolean; model: string };
  timestamp: string;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) throw new Error('Health check returned non-200');
    return await res.json();
  } catch (err: any) {
    return {
      status: 'offline',
      activeProvider: 'groq',
      groq: { configured: false, model: 'llama-3.3-70b-versatile' },
      gemini: { configured: false, model: 'gemini-2.5-flash' },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Test an API key (Groq or Gemini)
 */
export async function testApiKey(apiKey: string, provider: AiProvider = 'groq'): Promise<{
  connected: boolean;
  message: string;
  model: string;
  provider: string;
  echo?: string;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/test-key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey, provider }),
    });
    return await res.json();
  } catch (err: any) {
    return {
      connected: false,
      message: err.message || 'Connection test failed',
      model: provider === 'groq' ? 'llama-3.3-70b-versatile' : 'gemini-2.5-flash',
      provider,
    };
  }
}

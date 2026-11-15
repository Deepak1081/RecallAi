import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import aiRoutes from './routes/ai.routes.js';

// Load environment variables from backend/.env or root .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config(); // fallback to current working directory .env

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-gemini-api-key'],
}));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Request logger for development
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${req.method}] ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Root API info endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'RecallAI API',
    version: '1.0.0',
    description: 'AI-Powered Study Assistant Backend with Gemini API',
    endpoints: {
      health: 'GET /api/ai/health',
      generate: 'POST /api/ai/generate',
      samples: 'GET /api/ai/samples',
      sampleTopic: 'POST /api/ai/sample',
      testKey: 'POST /api/ai/test-key',
    },
  });
});

// Mount AI Routes
app.use('/api/ai', aiRoutes);

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Endpoint ${req.method} ${req.originalUrl} not found.`,
    },
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[Global Error Handler]:', err);

  const statusCode = err.statusCode || err.status || 500;
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';
  const errorMessage = err.message || 'An unexpected error occurred while processing your request.';

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: errorMessage,
      details: err.details || null,
    },
  });
});

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 RecallAI Backend Server is running on:`);
  console.log(`👉 http://localhost:${PORT}`);
  console.log(`👉 AI Routes: http://localhost:${PORT}/api/ai`);
  console.log(`👉 Gemini API Key configured: ${Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here')}`);
  console.log(`===============================================`);
});

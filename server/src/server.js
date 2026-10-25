import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { ENV } from './config/env.js';
import { connectDB, getDBStatus } from './config/db.js';
import caseRoutes from './routes/caseRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security & Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes.' },
});

app.use(limiter);
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '1mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  const dbStatus = getDBStatus();
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'AI Mystery Room Backend',
    database: dbStatus,
    geminiConfigured: Boolean(ENV.GEMINI_API_KEY && ENV.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY'),
  });
});

// Case & Leaderboard API Routes
app.use('/api', caseRoutes);

// In production, serve the built frontend assets
const clientDistPath = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) {
      // If client is not yet built, return a friendly JSON
      res.status(200).json({
        app: 'AI Mystery Room API Server',
        status: 'running',
        note: 'Frontend client is running on Vite dev server or needs to be built with npm run build',
      });
    }
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err);

  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors,
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Start Server
async function startServer() {
  await connectDB();
  app.listen(ENV.PORT, () => {
    console.log(`\n🕵️ [AI Mystery Room Server] Running at: http://localhost:${ENV.PORT}`);
    console.log(`   Health Check: http://localhost:${ENV.PORT}/api/health`);
    console.log(`   Database Status: ${getDBStatus().state}`);
    console.log(`   Gemini Configured: ${Boolean(ENV.GEMINI_API_KEY && ENV.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY')}\n`);
  });
}

startServer();

export default app;

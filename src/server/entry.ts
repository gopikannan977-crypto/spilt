import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { apiRouter } from './routes';
import { cache } from './redis';
import { realtimeHub } from './events';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Cloud Run / container sets PORT=8080 which is reserved by Nginx reverse proxy.
// Nginx forwards external requests to localhost:3000.
// Therefore this Node server must listen on port 3000.
const PORT = process.env.APP_PORT
  ? parseInt(process.env.APP_PORT, 10)
  : process.env.PORT && process.env.PORT !== '8080'
    ? parseInt(process.env.PORT, 10)
    : 3000;

// Security & Parsing Middlewares
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Security headers
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Health check endpoints for Cloud Run & monitoring
const healthHandler = (_req: express.Request, res: express.Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: 'in-memory-active',
      cache: cache.getStats(),
      realtime: {
        activeClients: realtimeHub.getClientCount(),
        status: 'ready',
      },
    },
  });
};

app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// Mount API routes
app.use('/api', apiRouter);

// Centralized error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('API Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'An unexpected error occurred',
    },
  });
});

// Mount Vite in dev mode or static files in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  // Find dist directory across multiple potential locations
  const rootDir = process.cwd();
  const candidatePaths = [
    path.resolve(rootDir, 'dist'),
    path.resolve(__dirname, 'dist'),
    path.resolve(__dirname, '..', 'dist'),
    path.resolve(__dirname, '..', '..', 'dist'),
  ];
  const distPath = candidatePaths.find((p) => fs.existsSync(p)) || candidatePaths[0];

  if (!isProduction) {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: {
          middlewareMode: true,
          hmr: process.env.DISABLE_HMR !== 'true',
        },
        appType: 'spa',
      });

      app.use(vite.middlewares);
    } catch (e) {
      console.warn('Vite dev server failed to start, falling back to static files:', e);
      if (fs.existsSync(distPath)) {
        app.use(express.static(distPath));
        app.get('*', (_req, res) => {
          res.sendFile(path.join(distPath, 'index.html'));
        });
      }
    }
  } else {
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    } else {
      console.warn('Production dist directory not found at', distPath);
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SplitSphere full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup failed:', err);
  process.exit(1);
});

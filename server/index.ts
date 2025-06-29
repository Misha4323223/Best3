import express, { type Request, Response, NextFunction } from "express";
// Этот импорт вызывает ошибку из-за неверного форматирования в deepspeek-provider.js
// Отключаем прямой импорт проблемного файла
process.env.SKIP_DEEPSPEEK_ORIGINAL = 'true';
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import cors from 'cors';

// Инициализируем векторизатор-менеджер (lazy loading)
let vectorizerManager: any = null;
try {
  const { createRequire } = require('module');
  const customRequire = createRequire(import.meta.url);
  vectorizerManager = customRequire('./vectorizer-manager');
  log('Vectorizer Manager initialized');
} catch (error) {
  log('Vectorizer Manager initialization deferred');
}

const app = express();
app.use(cors()); // Разрешаем CORS для всех маршрутов
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Статическая раздача загруженных файлов
app.use('/uploads', express.static('uploads'));
app.use('/public', express.static('public'));
app.use('/output', express.static('output'));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Подключаем маршруты
  const routes = express.Router();
  const smartChatRoutes = express.Router();
  const checkpointRoutes = express.Router();
  const streamingRoutes = express.Router();
  const pythonProviderRoutes = express.Router();
  const searchRoutes = express.Router();
  const imageRoute = express.Router();
  const embroideryRoutes = express.Router();
  const svgGeneratorRoutes = express.Router();
  const vectorizerRoutes = express.Router();
  const deepspeekRoutes = express.Router();
  const directAIRoutes = express.Router();

  app.use('/api', routes);
  app.use('/api/chat', smartChatRoutes);
  app.use('/api/checkpoint', checkpointRoutes);
  app.use('/api/streaming', streamingRoutes);
  app.use('/api/python', pythonProviderRoutes);
  app.use('/api/search', searchRoutes);
  app.use('/api/image', imageRoute);
  app.use('/api/embroidery', embroideryRoutes);
  app.use('/api/svg', svgGeneratorRoutes);
  app.use('/api/vectorizer', vectorizerRoutes);
  app.use('/api/deepspeek', deepspeekRoutes);
  app.use('/api/direct-ai', directAIRoutes);
  
  // Динамический импорт SEO роутов для совместимости с ES модулями
  const { default: seoRoutes } = await import('./seo-analyzer-routes.js');
  app.use('/api/seo', seoRoutes);

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Используем переменную окружения PORT если она доступна, иначе 5000
  // Это критично для правильной работы в окружении Replit
  const PORT = process.env.PORT || 5000;
  server.listen({
    port: PORT,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${PORT}`);
  });
})();
import express from 'express';
import session from 'express-session';
import { config } from './config/env';
import { sessionConfig } from './config/session';
import { requestLogger } from '@/shared/middleware/logger';
import { errorHandler, notFoundHandler } from '@/shared/middleware/error-handler';
import { logInfo } from '@/shared/lib/logger';
import { createHealthResponse } from '@/shared/lib/api-response';
import { authRoutes } from '@/features/auth/api';
import { userRoutes } from '@/features/user-management/api';

// Импорт типов сессии
import '@/shared/types/session';

// Создание Express приложения
export const createApp = () => {
  const app = express();

  // Middleware для парсинга JSON
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Сессии
  app.use(session(sessionConfig));

  // Логирование запросов
  app.use(requestLogger);

  // Здоровье сервиса
  app.get('/health', (_req, res) => {
    res.json(createHealthResponse());
  });

  // Роуты
  app.use('/auth', authRoutes);
  app.use('/users', userRoutes);

  // Обработка 404
  app.use(notFoundHandler);

  // Обработка ошибок
  app.use(errorHandler);

  return app;
};

// Запуск сервера
export const startServer = () => {
  const app = createApp();

  const server = app.listen(config.port, () => {
    logInfo(`Сервер запущен на порту ${config.port}`);
    logInfo(`Окружение: ${config.nodeEnv}`);
    logInfo(`URL: http://localhost:${config.port}`);
  });

  // Graceful shutdown
  const shutdown = () => {
    logInfo('Получен сигнал завершения, останавливаем сервер...');
    server.close(() => {
      logInfo('Сервер остановлен');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  return server;
};

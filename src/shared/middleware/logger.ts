import { Request, Response, NextFunction } from 'express';
import { logInfo } from '../lib/logger';
import '../types/session';

// Middleware для логирования HTTP запросов
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  // Логируем после отправки ответа
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const { method, originalUrl, ip } = req;
    const { statusCode } = res;

    logInfo(`${method} ${originalUrl} ${statusCode} - ${duration}ms`, {
      method,
      url: originalUrl,
      statusCode,
      duration,
      ip,
      userId: req.session?.userId,
    });
  });

  next();
};

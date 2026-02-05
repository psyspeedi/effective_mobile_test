import { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/errors';
import { logError } from '../lib/logger';
import '../types/session';

// Middleware для обработки ошибок
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Определяем статус и сообщение
  let statusCode = 500;
  let message = 'Внутренняя ошибка сервера';
  let isOperational = false;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  }

  // Логируем ошибку
  logError(
    `Error ${statusCode}: ${message}`,
    err,
    {
      path: req.path,
      method: req.method,
      ip: req.ip,
      userId: req.session?.userId,
    }
  );

  // Отправляем ответ клиенту
  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && !isOperational
      ? { stack: err.stack }
      : {}),
  });
};

// Middleware для обработки 404
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: `Маршрут ${req.method} ${req.path} не найден`,
  });
};

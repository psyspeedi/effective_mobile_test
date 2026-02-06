import { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/errors';
import { logError } from '../lib/logger';
import { createErrorResponse } from '../lib/api-response';
import { HttpStatus } from '@shared/types';
import '../types/session';

// Middleware для обработки ошибок
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Определяем статус и сообщение
  let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
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
  res.status(statusCode).json(
    createErrorResponse(
      message,
      process.env.NODE_ENV === 'development' && !isOperational
        ? err.stack
        : undefined
    )
  );
};

// Middleware для обработки 404
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(HttpStatus.NOT_FOUND).json(
    createErrorResponse(`Маршрут ${req.method} ${req.path} не найден`)
  );
};

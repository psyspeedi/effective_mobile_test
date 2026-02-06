import { HttpStatus } from '@/shared/types/api-response';

// Базовый класс ошибки приложения
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}

// 400 Bad Request
export class BadRequestError extends AppError {
  constructor(message = 'Неверный запрос') {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

// 401 Unauthorized
export class UnauthorizedError extends AppError {
  constructor(message = 'Требуется авторизация') {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

// 403 Forbidden
export class ForbiddenError extends AppError {
  constructor(message = 'Доступ запрещен') {
    super(message, HttpStatus.FORBIDDEN);
  }
}

// 404 Not Found
export class NotFoundError extends AppError {
  constructor(message = 'Ресурс не найден') {
    super(message, HttpStatus.NOT_FOUND);
  }
}

// 409 Conflict
export class ConflictError extends AppError {
  constructor(message = 'Конфликт данных') {
    super(message, HttpStatus.CONFLICT);
  }
}

// 422 Unprocessable Entity
export class ValidationError extends AppError {
  constructor(message = 'Ошибка валидации') {
    super(message, HttpStatus.UNPROCESSABLE_ENTITY);
  }
}

// 500 Internal Server Error
export class InternalServerError extends AppError {
  constructor(message = 'Внутренняя ошибка сервера') {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, false);
  }
}

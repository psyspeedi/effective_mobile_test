import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AppError } from '@/shared/lib/errors';
import { HttpStatus } from '@/shared/types/api-response';
import '@/shared/types/session';

/**
 * Middleware для проверки аутентификации
 * Проверяет наличие userId в сессии
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    throw new AppError('Требуется аутентификация', HttpStatus.UNAUTHORIZED);
  }
  next();
}

/**
 * Middleware для проверки роли пользователя
 * Требует наличия определенной роли
 */
export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.session?.userId) {
      throw new AppError('Требуется аутентификация', HttpStatus.UNAUTHORIZED);
    }

    if (!req.session?.role) {
      throw new AppError('Роль пользователя не определена', HttpStatus.FORBIDDEN);
    }

    if (!roles.includes(req.session.role)) {
      throw new AppError('Недостаточно прав доступа', HttpStatus.FORBIDDEN);
    }

    next();
  };
}

/**
 * Middleware для проверки роли ADMIN
 */
export const requireAdmin = requireRole(Role.ADMIN);

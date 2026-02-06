import { Router, Request, Response, NextFunction } from 'express';
import { registerUser, loginUser, getUserById } from '../model/auth-service';
import { requireAuth } from './auth-middleware';
import { AppError } from '@/shared/lib/errors';
import { createSuccessResponse, createSuccessMessage } from '@/shared/lib/api-response';
import { HttpStatus } from '@/shared/types/api-response';
import { validateBody } from '@/shared/middleware/validation';
import { registerSchema, loginSchema } from '@/shared/lib/validation/schemas';
import type { RegisterInput, LoginInput } from '@/shared/lib/validation/schemas';
import '@/shared/types/session';

const router = Router();

/**
 * POST /auth/register
 * Регистрация нового пользователя
 */
router.post(
  '/register',
  validateBody(registerSchema),
  async (req: Request<unknown, unknown, RegisterInput>, res: Response) => {
    const { fullName, birthDate, email, password } = req.body;

    // birthDate уже Date благодаря transform в схеме
    const result = await registerUser({ fullName, birthDate, email, password });

    // Сохранение в сессии
    req.session.userId = result.user.id;
    req.session.role = result.user.role;

    res.status(HttpStatus.CREATED).json(createSuccessResponse({ user: result.user }));
  }
);

/**
 * POST /auth/login
 * Вход пользователя
 */
router.post(
  '/login',
  validateBody(loginSchema),
  async (req: Request<unknown, unknown, LoginInput>, res: Response) => {
    const { email, password } = req.body;

    // Вход
    const result = await loginUser({ email, password });

    // Сохранение в сессии
    req.session.userId = result.user.id;
    req.session.role = result.user.role;

    res.json(createSuccessResponse({ user: result.user }));
  }
);

/**
 * POST /auth/logout
 * Выход пользователя
 */
router.post('/logout', requireAuth, (req: Request, res: Response, next: NextFunction) => {
  req.session.destroy((err) => {
    if (err) {
      next(new AppError('Ошибка при выходе из системы', HttpStatus.INTERNAL_SERVER_ERROR));
      return;
    }

    res.json(createSuccessMessage('Выход выполнен успешно'));
  });
});

/**
 * GET /auth/me
 * Получение информации о текущем пользователе
 */
router.get('/me', requireAuth, async (req: Request, res: Response) => {
  const userId = req.session.userId;

  if (!userId) {
    throw new AppError('Пользователь не авторизован', HttpStatus.UNAUTHORIZED);
  }

  const user = await getUserById(userId);

  if (!user) {
    throw new AppError('Пользователь не найден', HttpStatus.NOT_FOUND);
  }

  res.json(createSuccessResponse({ user }));
});

export default router;

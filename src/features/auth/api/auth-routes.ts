import { Router, Request, Response, NextFunction } from 'express';
import { registerUser, loginUser, getUserById } from '../model/auth-service';
import { requireAuth } from './auth-middleware';
import { AppError } from '@/shared/lib/errors';
import { createSuccessResponse, createSuccessMessage } from '@/shared/lib/api-response';
import { HttpStatus } from '@/shared/types/api-response';
import '@/shared/types/session';

const router = Router();

// Типы для request body
interface RegisterBody {
  fullName: string;
  birthDate: string;
  email: string;
  password: string;
}

interface LoginBody {
  email: string;
  password: string;
}

/**
 * POST /auth/register
 * Регистрация нового пользователя
 */
router.post('/register', async (req: Request<unknown, unknown, RegisterBody>, res: Response) => {
  const { fullName, birthDate, email, password } = req.body;

  // Валидация входных данных
  if (!fullName || !birthDate || !email || !password) {
    throw new AppError('Необходимо указать fullName, birthDate, email и password', HttpStatus.BAD_REQUEST);
  }

  if (password.length < 6) {
    throw new AppError('Пароль должен содержать минимум 6 символов', HttpStatus.BAD_REQUEST);
  }

  // Преобразование даты
  const birthDateObj = new Date(birthDate);
  if (isNaN(birthDateObj.getTime())) {
    throw new AppError('Неверный формат даты рождения', HttpStatus.BAD_REQUEST);
  }

  // Регистрация
  const result = await registerUser({ fullName, birthDate: birthDateObj, email, password });

  // Сохранение в сессии
  req.session.userId = result.user.id;
  req.session.role = result.user.role;

  res.status(HttpStatus.CREATED).json(createSuccessResponse({ user: result.user }));
});

/**
 * POST /auth/login
 * Вход пользователя
 */
router.post('/login', async (req: Request<unknown, unknown, LoginBody>, res: Response) => {
  const { email, password } = req.body;

  // Валидация входных данных
  if (!email || !password) {
    throw new AppError('Необходимо указать email и password', HttpStatus.BAD_REQUEST);
  }

  // Вход
  const result = await loginUser({ email, password });

  // Сохранение в сессии
  req.session.userId = result.user.id;
  req.session.role = result.user.role;

  res.json(createSuccessResponse({ user: result.user }));
});

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

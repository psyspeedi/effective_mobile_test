import { Router, Request, Response, NextFunction } from 'express';
import { registerUser, loginUser, getUserById } from '../model/auth-service';
import { requireAuth } from './auth-middleware';
import { AppError } from '@/shared/lib/errors';
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
    throw new AppError('Необходимо указать fullName, birthDate, email и password', 400);
  }

  if (password.length < 6) {
    throw new AppError('Пароль должен содержать минимум 6 символов', 400);
  }

  // Преобразование даты
  const birthDateObj = new Date(birthDate);
  if (isNaN(birthDateObj.getTime())) {
    throw new AppError('Неверный формат даты рождения', 400);
  }

  // Регистрация
  const result = await registerUser({ fullName, birthDate: birthDateObj, email, password });

  // Сохранение в сессии
  req.session.userId = result.user.id;
  req.session.role = result.user.role;

  res.status(201).json({
    status: 'success',
    data: { user: result.user }
  });
});

/**
 * POST /auth/login
 * Вход пользователя
 */
router.post('/login', async (req: Request<unknown, unknown, LoginBody>, res: Response) => {
  const { email, password } = req.body;

  // Валидация входных данных
  if (!email || !password) {
    throw new AppError('Необходимо указать email и password', 400);
  }

  // Вход
  const result = await loginUser({ email, password });

  // Сохранение в сессии
  req.session.userId = result.user.id;
  req.session.role = result.user.role;

  res.json({
    status: 'success',
    data: { user: result.user }
  });
});

/**
 * POST /auth/logout
 * Выход пользователя
 */
router.post('/logout', requireAuth, (req: Request, res: Response, next: NextFunction) => {
  req.session.destroy((err) => {
    if (err) {
      next(new AppError('Ошибка при выходе из системы', 500));
      return;
    }

    res.json({
      status: 'success',
      message: 'Выход выполнен успешно'
    });
  });
});

/**
 * GET /auth/me
 * Получение информации о текущем пользователе
 */
router.get('/me', requireAuth, async (req: Request, res: Response) => {
  const userId = req.session.userId;

  if (!userId) {
    throw new AppError('Пользователь не авторизован', 401);
  }

  const user = await getUserById(userId);

  if (!user) {
    throw new AppError('Пользователь не найден', 404);
  }

  res.json({
    status: 'success',
    data: { user }
  });
});

export default router;

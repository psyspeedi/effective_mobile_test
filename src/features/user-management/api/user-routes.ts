import { Router, Request, Response } from 'express';
import { getAllUsers, getUserById, blockUser, unblockUser } from '../model/user-service';
import { requireAuth, requireAdmin } from '@/features/auth/api';
import { NotFoundError, ForbiddenError } from '@/shared/lib/errors';
import '@/shared/types/session';

const router = Router();

/**
 * GET /users
 * Получить список всех пользователей (только для администраторов)
 */
router.get('/', requireAdmin, async (_req: Request, res: Response) => {
  const users = await getAllUsers();
  res.status(200).json({
    status: 'success',
    data: { users },
  });
});

/**
 * GET /users/:id
 * Получить пользователя по ID
 */
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  const userId = req.params.id as string;
  const user = await getUserById(userId);

  if (!user) {
    throw new NotFoundError('Пользователь не найден');
  }

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

/**
 * PATCH /users/:id/block
 * Заблокировать пользователя (админ - любого, пользователь - только себя)
 */
router.patch('/:id/block', requireAuth, async (req: Request, res: Response) => {
  const userId = req.params.id as string;
  const currentUserId = req.session.userId;
  const currentUserRole = req.session.role;

  // Если не админ и пытается изменить чужой аккаунт
  if (currentUserRole !== 'ADMIN' && userId !== currentUserId) {
    throw new ForbiddenError('Вы можете изменять только свой аккаунт');
  }

  const user = await blockUser(userId);

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

/**
 * PATCH /users/:id/unblock
 * Разблокировать пользователя (админ - любого, пользователь - только себя)
 */
router.patch('/:id/unblock', requireAuth, async (req: Request, res: Response) => {
  const userId = req.params.id as string;
  const currentUserId = req.session.userId;
  const currentUserRole = req.session.role;

  // Если не админ и пытается изменить чужой аккаунт
  if (currentUserRole !== 'ADMIN' && userId !== currentUserId) {
    throw new ForbiddenError('Вы можете изменять только свой аккаунт');
  }

  const user = await unblockUser(userId);

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

export default router;

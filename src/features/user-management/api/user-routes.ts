import { Router, Request, Response } from 'express';
import { Role } from '@prisma/client';
import { getAllUsers, getUserById, blockUser, unblockUser } from '../model/user-service';
import { requireAuth, requireAdmin } from '@/features/auth/api';
import { NotFoundError, ForbiddenError } from '@/shared/lib/errors';
import { createSuccessResponse } from '@/shared/lib/api-response';
import { HttpStatus } from '@/shared/types/api-response';
import { validateParams } from '@/shared/middleware/validation';
import { userIdParamSchema, type UserIdParam } from '@/shared/lib/validation/schemas';
import '@/shared/types/session';

const router = Router();

/**
 * GET /users
 * Получить список всех пользователей (только для администраторов)
 */
router.get('/', requireAdmin, async (_req: Request, res: Response) => {
  const users = await getAllUsers();
  res.status(HttpStatus.OK).json(createSuccessResponse({ users }));
});

/**
 * GET /users/:id
 * Получить пользователя по ID (админ - любого, пользователь - только себя)
 */
router.get(
  '/:id',
  requireAuth,
  validateParams(userIdParamSchema),
  async (req: Request<UserIdParam>, res: Response) => {
    const userId = req.params.id;

    const currentUserId = req.session.userId;
    const currentUserRole = req.session.role;

    // Если не админ и пытается получить данные другого пользователя
    if (currentUserRole !== Role.ADMIN && userId !== currentUserId) {
      throw new ForbiddenError('Вы можете просматривать только свой профиль');
    }

    const user = await getUserById(userId);

    if (!user) {
      throw new NotFoundError('Пользователь не найден');
    }

    res.status(HttpStatus.OK).json(createSuccessResponse({ user }));
  }
);

/**
 * PATCH /users/:id/block
 * Заблокировать пользователя (админ - любого, пользователь - только себя)
 */
router.patch(
  '/:id/block',
  requireAuth,
  validateParams(userIdParamSchema),
  async (req: Request<UserIdParam>, res: Response) => {
    const userId = req.params.id;

    const currentUserId = req.session.userId;
    const currentUserRole = req.session.role;

    // Если не админ и пытается изменить чужой аккаунт
    if (currentUserRole !== Role.ADMIN && userId !== currentUserId) {
      throw new ForbiddenError('Вы можете изменять только свой аккаунт');
    }

    const user = await blockUser(userId);

    res.status(HttpStatus.OK).json(createSuccessResponse({ user }));
  }
);

/**
 * PATCH /users/:id/unblock
 * Разблокировать пользователя (админ - любого, пользователь - только себя)
 */
router.patch(
  '/:id/unblock',
  requireAuth,
  validateParams(userIdParamSchema),
  async (req: Request<UserIdParam>, res: Response) => {
    const userId = req.params.id;

    const currentUserId = req.session.userId;
    const currentUserRole = req.session.role;

    // Если не админ и пытается изменить чужой аккаунт
    if (currentUserRole !== Role.ADMIN && userId !== currentUserId) {
      throw new ForbiddenError('Вы можете изменять только свой аккаунт');
    }

    const user = await unblockUser(userId);

    res.status(HttpStatus.OK).json(createSuccessResponse({ user }));
  }
);

export default router;

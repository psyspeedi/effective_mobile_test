import { PrismaClient, User } from '@prisma/client';
import { NotFoundError } from '@/shared/lib/errors';

const prisma = new PrismaClient();

/**
 * Получить список всех пользователей
 */
export async function getAllUsers(): Promise<Omit<User, 'password'>[]> {
  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  return users.map(user => {
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
}

/**
 * Получить пользователя по ID
 */
export async function getUserById(userId: string): Promise<Omit<User, 'password'> | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return null;
  }

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Заблокировать пользователя
 */
export async function blockUser(userId: string): Promise<Omit<User, 'password'>> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('Пользователь не найден');
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { isActive: false },
  });

  const { password: _, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
}

/**
 * Разблокировать пользователя
 */
export async function unblockUser(userId: string): Promise<Omit<User, 'password'>> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('Пользователь не найден');
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { isActive: true },
  });

  const { password: _, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
}

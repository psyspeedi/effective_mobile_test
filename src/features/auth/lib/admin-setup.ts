import { PrismaClient, Role, type User } from '@prisma/client';
import { hashPassword } from './password.js';

/**
 * Параметры для создания администратора
 */
export interface AdminSetupParams {
  email: string;
  password: string;
  fullName: string;
  birthDate: string; // Формат: YYYY-MM-DD
}

/**
 * Результат создания администратора
 */
export interface AdminSetupResult {
  user: User;
  created: boolean; // true если создан новый, false если обновлен существующий
}

/**
 * Создает или обновляет дефолтного администратора
 * Идемпотентная операция - можно запускать многократно
 *
 * @param prisma PrismaClient instance
 * @param params Параметры администратора
 * @returns Результат создания/обновления
 */
export async function createDefaultAdmin(
  prisma: PrismaClient,
  params: AdminSetupParams,
): Promise<AdminSetupResult> {
  const { email, password, fullName, birthDate } = params;

  // Хешируем пароль
  const hashedPassword = await hashPassword(password);

  // Проверяем существует ли пользователь
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  // Используем upsert для идемпотентности
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      fullName,
      birthDate: new Date(birthDate),
      role: Role.ADMIN,
      isActive: true,
    },
    create: {
      email,
      password: hashedPassword,
      fullName,
      birthDate: new Date(birthDate),
      role: Role.ADMIN,
      isActive: true,
    },
  });

  return {
    user,
    created: !existingUser,
  };
}

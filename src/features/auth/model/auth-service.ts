import { PrismaClient, User, Role } from '@prisma/client';
import { hashPassword, verifyPassword } from '../lib/password';
import { AppError } from '@/shared/lib/errors';
import { HttpStatus } from '@/shared/types/api-response';

const prisma = new PrismaClient();

export interface RegisterInput {
  fullName: string;
  birthDate: Date;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  user: Omit<User, 'password'>;
}

/**
 * Регистрация нового пользователя
 */
export async function registerUser(input: RegisterInput): Promise<AuthResult> {
  const { fullName, birthDate, email, password } = input;

  // Проверка на существующего пользователя
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new AppError('Пользователь с таким email уже существует', HttpStatus.BAD_REQUEST);
  }

  // Хеширование пароля
  const hashedPassword = await hashPassword(password);

  // Создание пользователя
  const user = await prisma.user.create({
    data: {
      fullName,
      birthDate,
      email,
      password: hashedPassword,
      role: Role.USER,
    }
  });

  // Убираем пароль из результата
  const { password: _, ...userWithoutPassword } = user;

  return { user: userWithoutPassword };
}

/**
 * Вход пользователя
 */
export async function loginUser(input: LoginInput): Promise<AuthResult> {
  const { email, password } = input;

  // Поиск пользователя
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new AppError('Неверный email или пароль', HttpStatus.UNAUTHORIZED);
  }

  // Проверка активности
  if (!user.isActive) {
    throw new AppError('Пользователь неактивен', HttpStatus.FORBIDDEN);
  }

  // Проверка пароля
  const isPasswordValid = await verifyPassword(password, user.password);

  if (!isPasswordValid) {
    throw new AppError('Неверный email или пароль', HttpStatus.UNAUTHORIZED);
  }

  // Убираем пароль из результата
  const { password: _, ...userWithoutPassword } = user;

  return { user: userWithoutPassword };
}

/**
 * Получение пользователя по ID
 */
export async function getUserById(userId: string): Promise<Omit<User, 'password'> | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    return null;
  }

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

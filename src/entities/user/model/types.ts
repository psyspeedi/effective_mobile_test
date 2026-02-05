import { User, Role } from '@prisma/client';

export { User, Role };

// Тип пользователя без пароля (для API ответов)
export type UserWithoutPassword = Omit<User, 'password'>;

// Тип для создания пользователя
export type CreateUserInput = {
  fullName: string;
  birthDate: Date;
  email: string;
  password: string;
  role?: Role;
  isActive?: boolean;
};

// Тип для обновления пользователя
export type UpdateUserInput = Partial<{
  fullName: string;
  birthDate: Date;
  email: string;
  password: string;
  role: Role;
  isActive: boolean;
}>;

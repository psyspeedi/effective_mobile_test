import { z } from 'zod';
import { emailSchema, passwordSchema, fullNameSchema, birthDateSchema, uuidSchema } from './index';

export const registerSchema = z.object({
  fullName: fullNameSchema,
  email: emailSchema,
  password: passwordSchema,
  birthDate: birthDateSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const userIdParamSchema = z.object({
  id: uuidSchema,
});

// Типы автоматически выводятся из схем
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UserIdParam = z.infer<typeof userIdParamSchema>;

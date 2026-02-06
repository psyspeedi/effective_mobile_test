import { z } from 'zod';
import { validateBirthDate } from '../date-utils';

export const emailSchema = z
  .email({ error: 'Неверный формат email' })
  .trim()
  .min(1, { error: 'Email обязателен' })
  .max(255, { error: 'Email слишком длинный (максимум 255 символов)' });

export const passwordSchema = z
  .string()
  .min(6, { error: 'Пароль должен содержать минимум 6 символов' })
  .max(128, { error: 'Пароль слишком длинный (максимум 128 символов)' });

export const fullNameSchema = z
  .string()
  .trim()
  .min(2, { error: 'Полное имя должно содержать минимум 2 символа' })
  .max(200, { error: 'Полное имя слишком длинное (максимум 200 символов)' });

export const birthDateSchema = z
  .string()
  .or(z.date())
  .transform((val) => {
    // Если Date, конвертируем в ISO строку для единообразия
    const dateString = val instanceof Date
      ? val.toISOString().split('T')[0]
      : val;

    // Используем date-fns для строгой валидации
    const result = validateBirthDate(dateString);

    if (!result.valid) {
      throw new Error(result.error);
    }

    return result.date!;
  });

export const uuidSchema = z.uuid({ error: 'ID имеет неверный формат' });

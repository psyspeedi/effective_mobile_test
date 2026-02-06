import { parseISO, isValid, isBefore, isAfter, subYears, startOfToday } from 'date-fns';

export const DATE_CONSTANTS = {
  MIN_BIRTH_YEAR: 1900,
  MIN_AGE: 13,
} as const;

/**
 * Парсит ISO строку и проверяет валидность
 * @returns Date или null если невалидна
 */
export function parseAndValidateDate(dateString: string): Date | null {
  const date = parseISO(dateString);
  return isValid(date) ? date : null;
}

/**
 * Проверяет, что дата не в будущем
 */
export function isNotInFuture(date: Date): boolean {
  return isBefore(date, new Date()) || date.getTime() === new Date().getTime();
}

/**
 * Проверяет, что дата не раньше минимального года
 */
export function isAfterMinYear(date: Date): boolean {
  const minDate = new Date(DATE_CONSTANTS.MIN_BIRTH_YEAR, 0, 1);
  return isAfter(date, minDate) || date.getTime() === minDate.getTime();
}

/**
 * Проверяет минимальный возраст
 */
export function hasMinimumAge(birthDate: Date): boolean {
  const minAgeDate = subYears(startOfToday(), DATE_CONSTANTS.MIN_AGE);
  return isBefore(birthDate, minAgeDate) || birthDate.getTime() === minAgeDate.getTime();
}

/**
 * Комплексная валидация даты рождения
 */
export interface BirthDateValidationResult {
  valid: boolean;
  date?: Date;
  error?: string;
}

export function validateBirthDate(dateString: string): BirthDateValidationResult {
  const date = parseAndValidateDate(dateString);
  if (!date) {
    return {
      valid: false,
      error: 'Неверный формат даты рождения или несуществующая дата',
    };
  }

  if (!isNotInFuture(date)) {
    return { valid: false, error: 'Дата рождения не может быть в будущем' };
  }

  if (!isAfterMinYear(date)) {
    return {
      valid: false,
      error: `Дата рождения не может быть раньше ${DATE_CONSTANTS.MIN_BIRTH_YEAR} года`,
    };
  }

  if (!hasMinimumAge(date)) {
    return { valid: false, error: `Минимальный возраст: ${DATE_CONSTANTS.MIN_AGE} лет` };
  }

  return { valid: true, date };
}

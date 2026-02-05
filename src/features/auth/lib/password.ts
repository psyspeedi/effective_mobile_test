import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * Хеширует пароль с использованием bcrypt
 * @param password Пароль в открытом виде
 * @returns Хешированный пароль
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Проверяет соответствие пароля хешу
 * @param password Пароль в открытом виде
 * @param hash Хешированный пароль
 * @returns true если пароль совпадает, иначе false
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

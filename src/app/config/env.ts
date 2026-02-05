import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';

// Загрузка переменных окружения с поддержкой интерполяции
const myEnv = dotenv.config();
dotenvExpand.expand(myEnv);

// Валидация обязательных переменных
const requiredEnvVars = ['DATABASE_URL', 'SESSION_SECRET'] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Отсутствует обязательная переменная окружения: ${envVar}`);
  }
}

// Экспорт конфигурации
export const config = {
  // Сервер
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // База данных
  databaseUrl: process.env.DATABASE_URL as string,

  // Сессии
  sessionSecret: process.env.SESSION_SECRET as string,
  sessionMaxAge: parseInt(process.env.SESSION_MAX_AGE || '86400000', 10), // 24 часа по умолчанию

  // Режимы
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
} as const;

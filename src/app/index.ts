import { startServer } from './server';
import { logError } from '@/shared/lib/logger';

// Обработка необработанных ошибок
process.on('uncaughtException', (error: Error) => {
  logError('Необработанное исключение', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown) => {
  logError('Необработанное отклонение Promise', reason as Error);
  process.exit(1);
});

// Запуск сервера
startServer();

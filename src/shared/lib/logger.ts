import winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Формат логов
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${String(timestamp)} [${level}]: ${String(stack || message)}`;
});

// Создание logger
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    // Консоль
    new winston.transports.Console({
      format: combine(
        colorize(),
        logFormat
      ),
    }),
    // Файлы для production
    ...(process.env.NODE_ENV === 'production'
      ? [
          new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
          new winston.transports.File({ filename: 'logs/combined.log' }),
        ]
      : []),
  ],
});

// Helper функции
export const logInfo = (message: string, meta?: object) => {
  logger.info(message, meta);
};

export const logError = (message: string, error?: unknown, meta?: object) => {
  if (error instanceof Error) {
    logger.error(message, { ...meta, error: error.message, stack: error.stack });
  } else {
    logger.error(message, { ...meta, error });
  }
};

export const logDebug = (message: string, meta?: object) => {
  logger.debug(message, meta);
};

export const logWarn = (message: string, meta?: object) => {
  logger.warn(message, meta);
};

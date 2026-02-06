import {
  ApiResponseStatus,
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiHealthResponse,
} from '@/shared/types/api-response';

/**
 * Создает успешный ответ с данными
 */
export const createSuccessResponse = <T>(data: T): ApiSuccessResponse<T> => ({
  status: ApiResponseStatus.SUCCESS,
  data,
});

/**
 * Создает успешный ответ с сообщением
 */
export const createSuccessMessage = (message: string): ApiSuccessResponse => ({
  status: ApiResponseStatus.SUCCESS,
  message,
});

/**
 * Создает ответ с ошибкой
 */
export const createErrorResponse = (
  message: string,
  includeStack?: string
): ApiErrorResponse => ({
  status: ApiResponseStatus.ERROR,
  message,
  ...(includeStack ? { stack: includeStack } : {}),
});

/**
 * Создает health-check ответ
 */
export const createHealthResponse = (): ApiHealthResponse => ({
  status: ApiResponseStatus.OK,
  timestamp: new Date().toISOString(),
});

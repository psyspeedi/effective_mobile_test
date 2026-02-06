/**
 * HTTP статус коды
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
}

/**
 * Статусы API ответов
 */
export enum ApiResponseStatus {
  SUCCESS = 'success',
  ERROR = 'error',
  OK = 'ok',
}

/**
 * Успешный ответ с данными или сообщением
 */
export interface ApiSuccessResponse<T = unknown> {
  status: ApiResponseStatus.SUCCESS;
  data?: T;
  message?: string;
}

/**
 * Ответ с ошибкой
 */
export interface ApiErrorResponse {
  status: ApiResponseStatus.ERROR;
  message: string;
  stack?: string;
}

/**
 * Health-check ответ
 */
export interface ApiHealthResponse {
  status: ApiResponseStatus.OK;
  timestamp: string;
}

/**
 * Универсальный тип API ответа
 */
export type ApiResponse<T = unknown> =
  | ApiSuccessResponse<T>
  | ApiErrorResponse
  | ApiHealthResponse;

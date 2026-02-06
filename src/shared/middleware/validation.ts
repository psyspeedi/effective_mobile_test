import { Request, NextFunction } from 'express';
import { z } from 'zod';
import { ValidationError } from '@/shared/lib/errors';

type RequestSource = 'body' | 'query' | 'params';

export const validate = <T extends z.ZodTypeAny>(
  schema: T,
  source: RequestSource = 'body'
) => {
  return async (req: Request, _res: unknown, next: NextFunction): Promise<void> => {
    try {
      req[source] = await schema.parseAsync(req[source]);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.issues[0];
        next(new ValidationError(firstError.message));
      } else {
        next(error);
      }
    }
  };
};

export const validateBody = <T extends z.ZodTypeAny>(schema: T) =>
  validate(schema, 'body');

export const validateParams = <T extends z.ZodTypeAny>(schema: T) =>
  validate(schema, 'params');

export const validateQuery = <T extends z.ZodTypeAny>(schema: T) =>
  validate(schema, 'query');

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ValidationError } from '../utils/errors';

export const validateRequest =
  (schema: z.ZodSchema, source: 'body' | 'query' | 'params' = 'body') =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dataToValidate = req[source];
      const result = await schema.parseAsync(dataToValidate);
      req[source] = result;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          errors[path] = err.message;
        });
        throw new ValidationError('Validation failed', errors);
      }
      throw error;
    }
  };

export const validateRequestBody = (schema: z.ZodSchema) =>
  validateRequest(schema, 'body');

export const validateRequestQuery = (schema: z.ZodSchema) =>
  validateRequest(schema, 'query');

export const validateRequestParams = (schema: z.ZodSchema) =>
  validateRequest(schema, 'params');

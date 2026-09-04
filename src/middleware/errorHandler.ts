import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error('Request error', {
    path: req.path,
    method: req.method,
    error: error.message,
    stack: error.stack,
  });

  // Handle AppError (operational errors)
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      error: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
    return;
  }

  // Handle Zod validation errors
  if (error instanceof SyntaxError && 'body' in error) {
    res.status(400).json({
      success: false,
      error: 'Invalid request body',
    });
    return;
  }

  // Handle MongoDB validation errors
  if (error.name === 'MongooseValidationError') {
    const messages = Object.values(error as any).map((err: any) => err.message);
    res.status(400).json({
      success: false,
      error: 'Validation error',
      details: messages,
    });
    return;
  }

  // Handle MongoDB duplicate key errors
  if (error.name === 'MongooseError' && (error as any).code === 11000) {
    const field = Object.keys((error as any).keyPattern)[0];
    res.status(409).json({
      success: false,
      error: `${field} already exists`,
    });
    return;
  }

  // Handle unknown errors
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && {
      message: error.message,
      stack: error.stack,
    }),
  });
};

// Async error handler wrapper
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Validation error handler
export const validationErrorHandler = (errors: Record<string, string>) => {
  return (req: Request, res: Response) => {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors,
    });
  };
};

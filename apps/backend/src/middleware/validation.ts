import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../errors/index';

export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return next(
          new ValidationError(
            'Schema validation constraints failed',
            err.errors.map((e) => ({
              field: e.path.join('.'),
              message: e.message,
            }))
          )
        );
      }
      next(err);
    }
  };
}

export default validateBody;

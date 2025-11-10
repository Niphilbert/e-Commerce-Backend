import { AnyZodObject, ZodError, ZodEffects, ZodTypeAny } from 'zod';
import { NextFunction, Request, Response } from 'express';
import { fail } from '../utils/responses';

type Schema = AnyZodObject | ZodEffects<AnyZodObject> | ZodTypeAny;

export function validateBody(schema: Schema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (e) {
      const ze = e as ZodError;
      const errors = ze.issues.map(i => `${i.path.join('.')}: ${i.message}`);
      res.status(400).json(fail('Validation error', errors));
    }
  };
}




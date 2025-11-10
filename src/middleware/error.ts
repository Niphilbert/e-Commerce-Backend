import { NextFunction, Request, Response } from 'express';
import { fail } from '../utils/responses';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const errors = Array.isArray(err.errors) ? err.errors : undefined;
  res.status(status).json(fail(message, errors ?? null, null));
}




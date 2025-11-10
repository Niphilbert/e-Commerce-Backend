import { NextFunction, Request, Response } from 'express';
import { verifyJwt } from '../utils/jwt';
import { fail } from '../utils/responses';

export type AuthUser = {
  userId: string;
  username: string;
  role: 'USER' | 'ADMIN';
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json(fail('Unauthorized'));
  }
  const token = header.slice('Bearer '.length);
  try {
    const payload = verifyJwt<AuthUser>(token);
    req.user = payload;
    return next();
  } catch {
    return res.status(401).json(fail('Invalid token'));
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json(fail('Unauthorized'));
  if (req.user.role !== 'ADMIN') return res.status(403).json(fail('Forbidden'));
  return next();
}




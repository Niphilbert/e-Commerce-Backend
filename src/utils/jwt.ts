import jwt from 'jsonwebtoken';
import { env } from '../config/env';

type JwtPayload = {
  userId: string;
  username: string;
  role: 'USER' | 'ADMIN';
};

export function signJwt(payload: JwtPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn, algorithm: 'HS256' });
}

export function verifyJwt<T = JwtPayload>(token: string): T {
  return jwt.verify(token, env.jwtSecret) as T;
}




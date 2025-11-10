import type { StringValue } from 'ms';
import jwt, { type SignOptions, type Secret } from 'jsonwebtoken';
import { env } from '../config/env';

type JwtPayload = {
  userId: string;
  username: string;
  role: 'USER' | 'ADMIN';
};

export function signJwt(payload: JwtPayload): string {
  const options: SignOptions = { expiresIn: env.jwtExpiresIn as StringValue, algorithm: 'HS256' };
  return jwt.sign(payload, env.jwtSecret as Secret, options);
}

export function verifyJwt<T = JwtPayload>(token: string): T {
  return jwt.verify(token, env.jwtSecret as Secret) as T;
}




import { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser } from '../services/auth.service';
import { created, ok } from '../utils/responses';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, email, password } = req.body as { username: string; email: string; password: string; };
    const user = await registerUser(username, email, password);
    res.status(201).json(created('User registered successfully', { id: user.id, username: user.username, email: user.email, role: user.role }));
  } catch (e) {
    next(e);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body as { email: string; password: string; };
    const result = await loginUser(email, password);
    res.status(200).json(ok('Login successful', { token: result.token, user: result.user }));
  } catch (e) {
    next(e);
  }
}




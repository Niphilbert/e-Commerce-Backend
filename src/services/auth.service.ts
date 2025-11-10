import { prisma } from '../prisma/client';
import { hashPassword, comparePassword } from '../utils/password';
import { signJwt } from '../utils/jwt';

export async function registerUser(username: string, email: string, password: string) {
  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    const err: any = new Error('Email already exists');
    err.status = 400;
    throw err;
  }
  const existingUsername = await prisma.user.findUnique({ where: { username } });
  if (existingUsername) {
    const err: any = new Error('Username already exists');
    err.status = 400;
    throw err;
  }
  const hashed = await hashPassword(password);
  const user = await prisma.user.create({
    data: { username, email, password: hashed, role: 'USER' }
  });
  return { id: user.id, username: user.username, email: user.email, role: user.role };
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const err: any = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }
  const valid = await comparePassword(password, user.password);
  if (!valid) {
    const err: any = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }
  const token = signJwt({ userId: user.id, username: user.username, role: user.role as 'USER' | 'ADMIN' });
  return { token, user: { id: user.id, username: user.username, email: user.email, role: user.role } };
}




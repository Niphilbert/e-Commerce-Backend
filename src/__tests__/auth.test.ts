import request from 'supertest';
import { app } from '../app';
import { prismaMock, resetPrismaMock } from '../../test/mocks/prisma';

jest.mock('../prisma/client', () => require('../../test/mocks/prisma').prismaMockModule);

jest.mock('../utils/password', () => ({
  hashPassword: jest.fn(async (plain: string) => `hashed-${plain}`),
  comparePassword: jest.fn(async (plain: string, hash: string) => hash === `hashed-${plain}`)
}));

const { hashPassword, comparePassword } = jest.requireMock('../utils/password') as {
  hashPassword: jest.Mock;
  comparePassword: jest.Mock;
};

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetPrismaMock();
  });

  describe('POST /api/auth/register', () => {
    it('registers a new user', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null);
      prismaMock.user.findUnique.mockResolvedValueOnce(null);
      prismaMock.user.create.mockResolvedValueOnce({
        id: 'user-1',
        username: 'jdoe',
        email: 'jdoe@example.com',
        role: 'USER',
        password: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'jdoe', email: 'jdoe@example.com', password: 'Password123!' });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        success: true,
        message: 'User registered successfully',
        object: {
          id: 'user-1',
          username: 'jdoe',
          email: 'jdoe@example.com',
          role: 'USER'
        }
      });
      expect(hashPassword).toHaveBeenCalledWith('Password123!');
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          username: 'jdoe',
          email: 'jdoe@example.com',
          password: expect.stringMatching(/^hashed-/),
          role: 'USER'
        }
      });
    });

    it('rejects duplicate email', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({
        id: 'user-existing',
        username: 'existing',
        email: 'jdoe@example.com',
        password: 'hashed',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'jdoe', email: 'jdoe@example.com', password: 'Password123!' });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Email already exists'
      });
      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/auth/login', () => {
    it('logins successfully and returns token', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({
        id: 'user-1',
        username: 'jdoe',
        email: 'jdoe@example.com',
        password: 'hashed-Password123!',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      (comparePassword as jest.Mock).mockResolvedValueOnce(true);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'jdoe@example.com', password: 'Password123!' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.object.token).toBeDefined();
      expect(response.body.object.user).toMatchObject({
        id: 'user-1',
        username: 'jdoe',
        email: 'jdoe@example.com',
        role: 'USER'
      });
    });

    it('rejects invalid credentials', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'unknown@example.com', password: 'Password123!' });

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Invalid credentials'
      });
    });
  });
});



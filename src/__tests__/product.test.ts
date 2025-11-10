import request from 'supertest';
import { app } from '../app';
import { signJwt } from '../utils/jwt';
import { prismaMock, resetPrismaMock } from '../../test/mocks/prisma';

jest.mock('../prisma/client', () => require('../../test/mocks/prisma').prismaMockModule);

describe('Product Routes', () => {
  const baseProduct = {
    id: 'prod-1',
    name: 'Laptop',
    description: 'High-end laptop',
    price: 1999.99,
    stock: 10,
    category: 'Electronics',
    creatorId: 'admin-1',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-02T00:00:00.000Z')
  };

  let adminToken: string;
  let userToken: string;

  beforeAll(() => {
    adminToken = signJwt({ userId: 'admin-1', username: 'admin', role: 'ADMIN' });
    userToken = signJwt({ userId: 'user-1', username: 'user', role: 'USER' });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    resetPrismaMock();
  });

  describe('GET /api/products', () => {
    it('returns paginated list of products', async () => {
      prismaMock.product.findMany.mockResolvedValueOnce([baseProduct]);
      prismaMock.product.count.mockResolvedValueOnce(1);

      const response = await request(app).get('/api/products?page=2&limit=5&search=Laptop');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        message: 'Products fetched',
        object: [
          {
            id: 'prod-1',
            name: 'Laptop'
          }
        ],
        pageNumber: 2,
        pageSize: 5,
        totalSize: 1
      });

      expect(prismaMock.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { name: { contains: 'Laptop', mode: 'insensitive' } },
          skip: 5,
          take: 5
        })
      );

      expect(prismaMock.product.count).toHaveBeenCalledWith({
        where: { name: { contains: 'Laptop', mode: 'insensitive' } }
      });
    });
  });

  describe('GET /api/products/:id', () => {
    it('returns a product by id', async () => {
      prismaMock.product.findUnique.mockResolvedValueOnce(baseProduct);

      const response = await request(app).get('/api/products/prod-1');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        message: 'Product fetched',
        object: {
          id: 'prod-1',
          name: 'Laptop'
        }
      });
    });
  });

  describe('POST /api/products', () => {
    it('requires authentication', async () => {
      const response = await request(app).post('/api/products').send({
        name: 'Laptop',
        description: 'High-end laptop',
        price: 1999.99,
        stock: 10,
        category: 'Electronics'
      });

      expect(response.status).toBe(401);
    });

    it('requires admin role', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Laptop',
          description: 'High-end laptop',
          price: 1999.99,
          stock: 10,
          category: 'Electronics'
        });

      expect(response.status).toBe(403);
    });

    it('creates a product when admin', async () => {
      prismaMock.product.create.mockResolvedValueOnce(baseProduct);

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Laptop',
          description: 'High-end laptop',
          price: 1999.99,
          stock: 10,
          category: 'Electronics'
        });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        success: true,
        message: 'Product created',
        object: {
          id: 'prod-1',
          name: 'Laptop',
          stock: 10
        }
      });
      expect(prismaMock.product.create).toHaveBeenCalledWith({
        data: {
          name: 'Laptop',
          description: 'High-end laptop',
          price: expect.anything(),
          stock: 10,
          category: 'Electronics',
          creatorId: 'admin-1'
        }
      });
    });
  });

  describe('PUT /api/products/:id', () => {
    it('updates a product when admin', async () => {
      prismaMock.product.findUnique.mockResolvedValueOnce(baseProduct);
      prismaMock.product.update.mockResolvedValueOnce({ ...baseProduct, stock: 5 });

      const response = await request(app)
        .put('/api/products/prod-1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ stock: 5 });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        message: 'Product updated',
        object: {
          id: 'prod-1',
          stock: 5
        }
      });
      expect(prismaMock.product.update).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        data: { stock: 5 }
      });
    });

    it('returns 404 when product missing', async () => {
      prismaMock.product.findUnique.mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/products/prod-missing')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ stock: 5 });

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Product not found'
      });
      expect(prismaMock.product.update).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('deletes a product when admin', async () => {
      prismaMock.product.findUnique.mockResolvedValueOnce(baseProduct);
      prismaMock.product.delete.mockResolvedValueOnce(undefined);

      const response = await request(app)
        .delete('/api/products/prod-1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        message: 'Product deleted successfully'
      });
      expect(prismaMock.product.delete).toHaveBeenCalledWith({ where: { id: 'prod-1' } });
    });
  });
});



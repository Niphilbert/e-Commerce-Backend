import request from 'supertest';
import { Prisma } from '@prisma/client';
import { app } from '../app';
import { signJwt } from '../utils/jwt';
import { prismaMock, resetPrismaMock } from '../../test/mocks/prisma';

jest.mock('../prisma/client', () => require('../../test/mocks/prisma').prismaMockModule);

describe('Order Routes', () => {
  const productId = '11111111-1111-1111-1111-111111111111';
  let userToken: string;

  beforeAll(() => {
    userToken = signJwt({ userId: 'user-1', username: 'john', role: 'USER' });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    resetPrismaMock();
  });

  describe('POST /api/orders', () => {
    it('requires authentication', async () => {
      const response = await request(app).post('/api/orders').send([{ productId, quantity: 1 }]);
      expect(response.status).toBe(401);
    });

    it('places an order with valid items', async () => {
      const orderRecord = {
        id: 'order-1',
        userId: 'user-1',
        description: null,
        totalPrice: new Prisma.Decimal('399.98'),
        status: 'pending',
        createdAt: new Date('2024-02-01T00:00:00.000Z'),
        updatedAt: new Date('2024-02-01T00:00:00.000Z')
      };

      const orderWithItems = {
        ...orderRecord,
        items: [
          {
            id: 'item-1',
            orderId: 'order-1',
            productId,
            quantity: 2,
            unitPrice: new Prisma.Decimal('199.99')
          }
        ]
      };

      const txProduct = {
        findMany: jest.fn().mockResolvedValue([
          {
            id: productId,
            name: 'Laptop',
            price: new Prisma.Decimal('199.99'),
            stock: 5
          }
        ]),
        update: jest.fn().mockResolvedValue(undefined)
      };

      const txOrder = {
        create: jest.fn().mockResolvedValue(orderRecord),
        findUnique: jest.fn().mockResolvedValue(orderWithItems)
      };

      const txOrderItem = {
        create: jest.fn().mockResolvedValue(undefined)
      };

      prismaMock.$transaction.mockImplementation(async (callback: (tx: any) => any) =>
        callback({
          product: txProduct,
          order: txOrder,
          orderItem: txOrderItem
        } as any)
      );

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send([{ productId, quantity: 2 }]);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        success: true,
        message: 'Order placed',
        object: {
          id: 'order-1',
          items: [
            {
              productId,
              quantity: 2
            }
          ]
        }
      });

      expect(txProduct.findMany).toHaveBeenCalledWith({ where: { id: { in: [productId] } } });
      expect(txOrder.create).toHaveBeenCalledTimes(1);
      expect(txOrderItem.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            orderId: 'order-1',
            productId,
            quantity: 2
          })
        })
      );
      expect(txProduct.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: { stock: { decrement: 2 } }
      });
    });

    it('fails when product is missing', async () => {
      prismaMock.$transaction.mockImplementation(async (callback: (tx: any) => any) => {
        const txProduct = {
          findMany: jest.fn().mockResolvedValue([]),
          update: jest.fn()
        };
        const txOrder = {
          create: jest.fn(),
          findUnique: jest.fn()
        };
        const txOrderItem = {
          create: jest.fn()
        };
        return callback({
          product: txProduct,
          order: txOrder,
          orderItem: txOrderItem
        } as any);
      });

      const missingId = '22222222-2222-2222-2222-222222222222';

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send([{ productId: missingId, quantity: 1 }]);

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        success: false,
        message: `Product(s) not found: ${missingId}`
      });
    });
  });

  describe('GET /api/orders', () => {
    it('requires authentication', async () => {
      const response = await request(app).get('/api/orders');
      expect(response.status).toBe(401);
    });

    it('lists orders for the authenticated user', async () => {
      prismaMock.order.findMany.mockResolvedValueOnce([
        {
          id: 'order-1',
          userId: 'user-1',
          description: null,
          totalPrice: new Prisma.Decimal('199.99'),
          status: 'pending',
          createdAt: new Date('2024-02-01T00:00:00.000Z'),
          updatedAt: new Date('2024-02-01T00:00:00.000Z'),
          items: [
            {
              id: 'item-1',
              orderId: 'order-1',
              productId,
              quantity: 1,
              unitPrice: new Prisma.Decimal('199.99')
            }
          ]
        }
      ]);

      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        message: 'Orders fetched',
        object: [
          {
            id: 'order-1',
            userId: 'user-1',
            items: [
              {
                productId,
                quantity: 1
              }
            ]
          }
        ]
      });
      expect(prismaMock.order.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
        include: { items: true }
      });
    });
  });
});


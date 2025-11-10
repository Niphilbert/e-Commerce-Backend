const prismaMock = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn()
  },
  product: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn()
  },
  order: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn()
  },
  orderItem: {
    create: jest.fn()
  },
  $transaction: jest.fn()
} as Record<string, any>;

export { prismaMock };

export function resetPrismaMock() {
  const reset = (obj: Record<string, any>) => {
    Object.values(obj).forEach(value => {
      if (typeof value === 'function' && 'mockReset' in value) {
        (value as jest.Mock).mockReset();
      } else if (value && typeof value === 'object') {
        reset(value as Record<string, any>);
      }
    });
  };
  reset(prismaMock as Record<string, any>);
}

export const prismaMockModule = { prisma: prismaMock };

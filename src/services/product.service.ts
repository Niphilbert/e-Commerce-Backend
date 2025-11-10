import { Prisma, Product } from '@prisma/client';
import { prisma } from '../prisma/client';
import { cacheDel, cacheGet, cacheSet } from '../utils/cache';

export async function createProduct(data: {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  creatorId?: string;
}): Promise<Product> {
  const product = await prisma.product.create({
    data: {
      name: data.name,
      description: data.description,
      price: new Prisma.Decimal(data.price),
      stock: data.stock,
      category: data.category,
      creatorId: data.creatorId
    }
  });
  await cacheDel('products:list:*'); // wildcard invalidation is not supported; left as a no-op in our cache util
  return product;
}

export async function updateProduct(id: string, data: Partial<{ name: string; description: string; price: number; stock: number; category: string; }>): Promise<Product> {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    const err: any = new Error('Product not found');
    err.status = 404;
    throw err;
  }
  const product = await prisma.product.update({
    where: { id },
    data: {
      name: data.name ?? undefined,
      description: data.description ?? undefined,
      price: data.price !== undefined ? new Prisma.Decimal(data.price) : undefined,
      stock: data.stock ?? undefined,
      category: data.category ?? undefined
    }
  });
  await cacheDel('products:list:*');
  return product;
}

export async function deleteProduct(id: string): Promise<void> {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    const err: any = new Error('Product not found');
    err.status = 404;
    throw err;
  }
  await prisma.product.delete({ where: { id } });
  await cacheDel('products:list:*');
}

export async function getProduct(id: string): Promise<Product> {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    const err: any = new Error('Product not found');
    err.status = 404;
    throw err;
  }
  return product;
}

export async function listProducts(params: { search?: string; skip: number; take: number; }): Promise<{ items: Product[]; total: number; }> {
  const { search, skip, take } = params;
  const where: Prisma.ProductWhereInput = search && search.trim().length > 0
    ? { name: { contains: search, mode: 'insensitive' } }
    : {};
  const cacheKey = `products:list:${JSON.stringify({ search, skip, take })}`;
  const cached = await cacheGet<{ items: Product[]; total: number; }>(cacheKey);
  if (cached) return cached;
  const [items, total] = await Promise.all([
    prisma.product.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
    prisma.product.count({ where })
  ]);
  await cacheSet(cacheKey, { items, total }, 30);
  return { items, total };
}




import { Prisma } from '@prisma/client';
import { prisma } from '../prisma/client';

type OrderItemInput = { productId: string; quantity: number; };

export async function placeOrder(userId: string, items: OrderItemInput[]) {
  return prisma.$transaction(async tx => {
    // Fetch products
    const productIds = items.map(i => i.productId);
    const products = await tx.product.findMany({ where: { id: { in: productIds } } });
    if (products.length !== items.length) {
      const missingIds = productIds.filter(id => !products.find(p => p.id === id));
      const err: any = new Error(`Product(s) not found: ${missingIds.join(', ')}`);
      err.status = 404;
      throw err;
    }
    // Stock check
    for (const item of items) {
      const prod = products.find(p => p.id === item.productId)!;
      if (prod.stock < item.quantity) {
        const err: any = new Error(`Insufficient stock for ${prod.name}`);
        err.status = 400;
        throw err;
      }
    }
    // Compute total
    let total = new Prisma.Decimal(0);
    for (const item of items) {
      const prod = products.find(p => p.id === item.productId)!;
      const line = new Prisma.Decimal(prod.price).mul(item.quantity);
      total = total.add(line);
    }
    // Create order
    const order = await tx.order.create({
      data: {
        userId,
        description: null,
        totalPrice: total,
        status: 'pending'
      }
    });
    // Create items and decrement stock
    for (const item of items) {
      const prod = products.find(p => p.id === item.productId)!;
      await tx.orderItem.create({
        data: {
          orderId: order.id,
          productId: prod.id,
          quantity: item.quantity,
          unitPrice: prod.price
        }
      });
      await tx.product.update({
        where: { id: prod.id },
        data: { stock: { decrement: item.quantity } }
      });
    }
    const full = await tx.order.findUnique({
      where: { id: order.id },
      include: { items: true }
    });
    return full!;
  });
}

export async function listMyOrders(userId: string) {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      items: true
    }
  });
  return orders;
}




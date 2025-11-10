import { Request, Response, NextFunction } from 'express';
import { created, ok } from '../utils/responses';
import { placeOrder, listMyOrders } from '../services/order.service';

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const items = req.body as { productId: string; quantity: number; }[];
    const order = await placeOrder(req.user!.userId, items);
    res.status(201).json(created('Order placed', order));
  } catch (e) {
    next(e);
  }
}

export async function listMine(req: Request, res: Response, next: NextFunction) {
  try {
    const orders = await listMyOrders(req.user!.userId);
    res.status(200).json(ok('Orders fetched', orders));
  } catch (e) {
    next(e);
  }
}




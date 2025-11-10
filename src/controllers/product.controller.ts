import { Request, Response, NextFunction } from 'express';
import { created, ok } from '../utils/responses';
import { createProduct, deleteProduct, getProduct, listProducts, updateProduct } from '../services/product.service';
import { getPagination } from '../utils/pagination';

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body as { name: string; description: string; price: number; stock: number; category: string; };
    const product = await createProduct({ ...body, creatorId: req.user?.userId });
    res.status(201).json(created('Product created', product));
  } catch (e) {
    next(e);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const body = req.body as Partial<{ name: string; description: string; price: number; stock: number; category: string; }>;
    const product = await updateProduct(id, body);
    res.status(200).json(ok('Product updated', product));
  } catch (e) {
    next(e);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await deleteProduct(id);
    res.status(200).json(ok('Product deleted successfully', null));
  } catch (e) {
    next(e);
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const { pageNumber, pageSize, skip, take } = getPagination(req.query as any);
    const search = (req.query.search as string | undefined) ?? undefined;
    const { items, total } = await listProducts({ search, skip, take });
    res.status(200).json({
      success: true,
      message: 'Products fetched',
      object: items,
      pageNumber,
      pageSize,
      totalSize: total,
      errors: null
    });
  } catch (e) {
    next(e);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const product = await getProduct(id);
    res.status(200).json(ok('Product fetched', product));
  } catch (e) {
    next(e);
  }
}




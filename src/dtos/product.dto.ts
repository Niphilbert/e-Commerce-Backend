import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(10),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
  category: z.string().min(1)
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().min(10).optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().nonnegative().optional(),
  category: z.string().min(1).optional()
}).refine(data => Object.keys(data).length > 0, { message: 'At least one field is required' });

export type UpdateProductInput = z.infer<typeof updateProductSchema>;




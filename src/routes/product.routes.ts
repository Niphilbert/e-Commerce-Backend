import { Router } from 'express';
import * as controller from '../controllers/product.controller';
import { validateBody } from '../middleware/validate';
import { createProductSchema, updateProductSchema } from '../dtos/product.dto';
import { requireAdmin, requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', controller.list);
router.get('/:id', controller.getById);

router.post('/', requireAuth, requireAdmin, validateBody(createProductSchema), controller.create);
router.put('/:id', requireAuth, requireAdmin, validateBody(updateProductSchema), controller.update);
router.delete('/:id', requireAuth, requireAdmin, controller.remove);

export default router;




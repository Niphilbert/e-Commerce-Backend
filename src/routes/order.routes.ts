import { Router } from 'express';
import * as controller from '../controllers/order.controller';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { createOrderSchema } from '../dtos/order.dto';

const router = Router();

router.post('/', requireAuth, validateBody(createOrderSchema), controller.create);
router.get('/', requireAuth, controller.listMine);

export default router;




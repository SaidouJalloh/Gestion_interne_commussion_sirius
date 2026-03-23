import { Router } from 'express';
import { usersController } from './users.controller';
import { validate } from '../../middlewares/validate';
import { createUserSchema, updateUserSchema } from './users.validation';
import { optionalTenantMiddleware } from '../../middlewares/tenant.middleware';

const router = Router();

// Uses optional tenant middleware to parse organization header
router.use(optionalTenantMiddleware);

router.post(
  '/',
  validate(createUserSchema),
  usersController.createUser.bind(usersController)
);

router.get(
  '/',
  usersController.getUsers.bind(usersController)
);

router.put(
  '/:id',
  validate(updateUserSchema),
  usersController.updateUser.bind(usersController)
);

// We'll use DELETE for deactivation (instead of a full delete as requested).
router.delete(
  '/:id',
  usersController.deactivateUser.bind(usersController)
);

export default router;

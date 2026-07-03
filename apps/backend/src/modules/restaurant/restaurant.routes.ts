import { Router } from 'express';
import restaurantController from './restaurant.controller';
import { requireAuth, requireRoles } from '../../middleware/auth';
import { validateBody } from '../../middleware/validation';
import { createRestaurantSchema } from '@rms/validation';
import { UserRole } from '../../constants/index';

const restaurantRouter = Router();

restaurantRouter.use(requireAuth);

restaurantRouter.get('/', restaurantController.getProfile);

restaurantRouter.put(
  '/',
  requireRoles([UserRole.OWNER, UserRole.ADMINISTRATOR]),
  validateBody(createRestaurantSchema),
  restaurantController.updateProfile
);

export default restaurantRouter;

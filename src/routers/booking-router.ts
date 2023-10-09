import { Router } from 'express';
import { getBooking, postBooking, updateBooking } from '@/controllers/booking-controller';
import { authenticateToken, validateBody, validateParams } from '@/middlewares';
import { bookingBodySchema, bookingParamsSchema } from '@/schemas/booking-schemas';

const bookingRouter = Router();

bookingRouter
  .all('/*', authenticateToken)
  .get('/', getBooking)
  .post('/', validateBody(bookingBodySchema), postBooking)
  .put('/:bookingId', validateBody(bookingBodySchema), validateParams(bookingParamsSchema), updateBooking);

export { bookingRouter };

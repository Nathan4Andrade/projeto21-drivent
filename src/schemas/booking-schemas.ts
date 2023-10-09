import Joi from 'joi';
import { BookingBody, BookingParam } from '@/repositories';

export const bookingBodySchema = Joi.object<BookingBody>({
  roomId: Joi.number().required(),
});

export const bookingParamsSchema = Joi.object<BookingParam>({
  bookingId: Joi.number().required(),
});

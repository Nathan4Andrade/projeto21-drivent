import Joi from 'joi';
import { TicketTypeId } from '@/protocols';

export const createTicketSchema = Joi.object<TicketTypeId>({
  ticketTypeId: Joi.number().integer().required(),
});

import { Router } from 'express';
import { authenticateToken, validateBody } from '@/middlewares';
import { getTicketTypes, getTickets, postTickets } from '@/controllers/tickets-controller';
import { createTicketSchema } from '@/schemas/tickets-schemas';

const ticketsRouter = Router();

ticketsRouter
  .all('/*', authenticateToken)
  .get('/types', getTicketTypes)
  .get('/', getTickets)
  .post('/', validateBody(createTicketSchema), postTickets);

export { ticketsRouter };

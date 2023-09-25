import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import { TicketTypeId } from '@/protocols';
import { ticketService } from '@/services/tickets-service';

export async function getTicketTypes(req: AuthenticatedRequest, res: Response) {
  const ticketTypes = await ticketService.getTicketTypes();

  return res.status(httpStatus.OK).send(ticketTypes);
}

export async function getTickets(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  const ticketTypes = await ticketService.getTickets(userId);

  return res.status(httpStatus.OK).send(ticketTypes);
}

export async function postTickets(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { ticketTypeId } = req.body as TicketTypeId;

  const ticket = await ticketService.postTickets(userId, ticketTypeId);

  return res.status(httpStatus.CREATED).send(ticket);
}

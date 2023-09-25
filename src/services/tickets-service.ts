import { Enrollment, TicketStatus, TicketType } from '@prisma/client';
import { notFoundError } from '@/errors';
import { TicketResponse, ticketRepository } from '@/repositories/tickets-repository';

async function getTicketTypes(): Promise<TicketType[]> {
  return await ticketRepository.findMany();
}

async function getTickets(id: number): Promise<TicketResponse> {
  const ticket = await ticketRepository.findFirst(id);

  if (!ticket) throw notFoundError();

  return ticket;
}

async function postTickets(userId: number, ticketTypeId: number): Promise<TicketResponse> {
  const enrollment: Enrollment = await ticketRepository.findEnrollment(userId);

  if (!enrollment) throw notFoundError();

  const ticketData = {
    status: TicketStatus.RESERVED,
    ticketTypeId: ticketTypeId,
    enrollmentId: enrollment.id,
  };

  const ticket = await ticketRepository.create(ticketData);

  if (!ticket) throw notFoundError();

  return ticket;
}

export const ticketService = {
  getTicketTypes,
  getTickets,
  postTickets,
};

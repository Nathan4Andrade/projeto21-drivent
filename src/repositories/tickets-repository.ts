import { TicketStatus } from '@prisma/client';
import { prisma } from '@/config';
import { CreateTicketParams } from '@/protocols';

async function findTicketTypes() {
  const result = await prisma.ticketType.findMany();
  return result;
}

async function findTicketByEnrollmentId(enrollmentId: number) {
  const result = await prisma.ticket.findUnique({
    where: { enrollmentId },
    include: { TicketType: true },
  });

  return result;
}

async function createTicket(ticket: CreateTicketParams) {
  const result = await prisma.ticket.create({
    data: ticket,
    include: { TicketType: true },
  });

  return result;
}

async function findTicketById(ticketId: number) {
  const result = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: { TicketType: true },
  });

  return result;
}

async function ticketProcessPayment(ticketId: number) {
  const result = prisma.ticket.update({
    where: {
      id: ticketId,
    },
    data: {
      status: TicketStatus.PAID,
    },
  });

  return result;
}

async function create(ticketId: number, enrollmentId: number) {
  const ticket = await prisma.ticket.create({
    data: {
      enrollmentId: enrollmentId,
      ticketTypeId: ticketId,
      status: TicketStatus.RESERVED,
    },
  });
  const tickedType = await prisma.ticketType.findFirst({
    where: {
      id: ticketId,
    },
  });

  const result = {
    id: ticket.id,
    status: ticket.status.toString(),
    ticketTypeId: ticket.ticketTypeId,
    enrollmentId: ticket.enrollmentId,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    TicketType: tickedType,
  };

  return result;
}

async function getTicket(userId: number) {
  const ticket = await prisma.ticket.findFirst({
    where: {
      Enrollment: {
        userId: userId,
      },
    },
    include: {
      TicketType: true,
    },
  });
  return ticket;
}

export const ticketsRepository = {
  findTicketTypes,
  findTicketByEnrollmentId,
  createTicket,
  findTicketById,
  ticketProcessPayment,
  getTicket,
  create,
};

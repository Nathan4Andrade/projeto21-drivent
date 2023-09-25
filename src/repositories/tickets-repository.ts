import { Enrollment, Ticket, TicketType } from '@prisma/client';
import { prisma } from '@/config';

export type TicketResponse = Ticket & {
  TicketType: TicketType;
};

export type CreateTicket = Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>;

async function findMany(): Promise<TicketType[]> {
  return await prisma.ticketType.findMany();
}

async function findFirst(userId: number): Promise<TicketResponse | null> {
  return await prisma.ticket.findFirst({
    where: {
      Enrollment: { userId },
    },
    include: {
      TicketType: true,
    },
  });
}

async function findEnrollment(userId: number): Promise<Enrollment> {
  return await prisma.enrollment.findUnique({
    where: { userId },
  });
}

async function findTicketType(id: number): Promise<TicketType> {
  return await prisma.ticketType.findUnique({
    where: { id },
  });
}

async function create(data: CreateTicket): Promise<TicketResponse> {
  const createdTicket = await prisma.ticket.create({
    data: data,
  });
  const ticketType = await findTicketType(data.ticketTypeId);

  const result = {
    ...createdTicket,
    TicketType: ticketType,
  };
  return result as TicketResponse;
}

export const ticketRepository = {
  findMany,
  findFirst,
  create,
  findEnrollment,
  findTicketType,
};

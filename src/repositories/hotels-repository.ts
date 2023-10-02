import { Hotel } from '@prisma/client';
import { prisma } from '@/config';

async function findHotels(): Promise<{ hotels: Hotel[]; count: number }> {
  const result = await prisma.hotel.findMany();
  const count = await prisma.hotel.count();
  return { hotels: result, count };
}

async function findHotelById(id: number) {
  const result = await prisma.hotel.findUnique({
    where: { id },
    include: { Rooms: true },
  });
  return result;
}

export const hotelsRepository = {
  findHotels,
  findHotelById,
};

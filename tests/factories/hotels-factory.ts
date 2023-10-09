import faker from '@faker-js/faker';
import { Hotel, Room } from '@prisma/client';
import { prisma } from '@/config';

export async function createRoom(hotelId: number, params: Partial<Room> = {}) {
  const capacity = params.capacity >= 0 ? params.capacity : faker.datatype.number({ max: 200 });

  return await prisma.room.create({
    data: {
      name: params.name || faker.company.companySuffix(),
      capacity,
      hotelId,
    },
  });
}

export async function createHotel(params: Partial<Hotel> = {}) {
  return await prisma.hotel.create({
    data: {
      name: params.name || faker.company.companyName(),
      image: params.image || faker.image.business(),
    },
  });
}

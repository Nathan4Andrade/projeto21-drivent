import faker from '@faker-js/faker';
import { prisma } from '@/config';

export async function createHotel(name?: string, image?: string) {
  return prisma.hotel.create({
    data: {
      name: name || faker.name.findName(),
      image: image || faker.image.city(),
    },
  });
}

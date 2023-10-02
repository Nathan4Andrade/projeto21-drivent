import { invalidDataError, notFoundError, paymentError } from '@/errors';
import { enrollmentRepository, ticketsRepository } from '@/repositories';
import { hotelsRepository } from '@/repositories/hotels-repository';

async function findHotels(userId: number) {
  const enrollment = await enrollmentRepository.findByUserId(userId);
  if (!enrollment) throw notFoundError();
  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  const hotelsInfo = await hotelsRepository.findHotels();

  if (!ticket) throw notFoundError();

  if (ticket.status === 'RESERVED' || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel)
    throw paymentError();

  if (hotelsInfo.count === 0) throw notFoundError();

  return hotelsInfo.hotels;
}

async function findHotel(userId: number, id: string) {
  const hotelId = Number(id);
  const enrollment = await enrollmentRepository.findByUserId(userId);
  if (isNaN(hotelId)) throw invalidDataError('hotelId must be a number');
  if (!enrollment) throw notFoundError();
  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  const hotel = await hotelsRepository.findHotelById(hotelId);

  if (!ticket) throw notFoundError();

  if (ticket.status === 'RESERVED' || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel)
    throw paymentError();

  if (!hotel) throw notFoundError();

  return hotel;
}

export const hotelsService = {
  findHotels,
  findHotel,
};

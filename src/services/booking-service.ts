import { notFoundError } from '@/errors';
import { forbiddenError } from '@/errors/forbidden-error';
import { enrollmentRepository, ticketsRepository } from '@/repositories';
import { bookingRepository } from '@/repositories/booking-repository';

async function getBookings(userId: number) {
  const bookingRoom = await bookingRepository.getBookingByUserId(userId);

  if (!bookingRoom) throw notFoundError();
  return bookingRoom;
}

async function createBooking(roomId: number, userId: number) {
  const room = await bookingRepository.roomExists(roomId);

  if (!room) throw notFoundError();
  if (room.Booking.length >= room.capacity) throw forbiddenError();

  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);

  if (!enrollment) throw forbiddenError();

  const ticket = await ticketsRepository.getTicket(userId);

  if (!ticket) throw forbiddenError();
  if (!ticket.TicketType) throw forbiddenError();
  if (ticket.TicketType.includesHotel == false) throw forbiddenError();
  if (ticket.TicketType.isRemote) throw forbiddenError();
  if (ticket.status !== 'PAID') throw forbiddenError();

  const result = await bookingRepository.create(userId, roomId);
  const response = { bookingId: result.id };

  return response;
}

async function updateByBooking(userId: number, bookingId: number, roomId: number) {
  const booking = await bookingRepository.getBookingByUserId(userId);
  if (!booking) throw forbiddenError();
  if (booking.id !== bookingId) throw forbiddenError();

  const room = await bookingRepository.roomExists(roomId);
  if (!room) throw notFoundError();
  if (room.Booking.length >= room.capacity) throw forbiddenError();

  const updatedBooking = await bookingRepository.updateByBookingId(bookingId, roomId);
  return { bookingId: updatedBooking.id };
}

export const bookingService = {
  getBookings,
  createBooking,
  updateByBooking,
};

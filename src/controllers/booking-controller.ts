import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import { bookingService } from '@/services/booking-service';
import { BookingBody } from '@/repositories';

export async function getBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  const bookingRoom = await bookingService.getBookings(userId);
  return res.status(httpStatus.OK).send(bookingRoom);
}

export async function postBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.body as BookingBody;

  const bookingId = await bookingService.createBooking(roomId, userId);
  res.status(httpStatus.OK).send(bookingId);
}

export async function updateBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.body;
  const { bookingId } = req.params;
  const updatedBookingId = await bookingService.updateByBooking(userId, Number(bookingId), Number(roomId));
  return res.status(httpStatus.OK).send(updatedBookingId);
}

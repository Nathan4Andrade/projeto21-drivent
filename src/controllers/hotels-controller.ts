import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import { hotelsService } from '@/services/hotels-service';

export async function getHotels(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const hotels = await hotelsService.findHotels(userId);
  res.status(httpStatus.OK).send(hotels);
}

export async function getHotelById(req: AuthenticatedRequest, res: Response) {
  const { hotelId } = req.params;
  const { userId } = req;
  const hotel = await hotelsService.findHotel(userId, hotelId);
  res.status(httpStatus.OK).send(hotel);
}

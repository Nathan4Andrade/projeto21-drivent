import { Router } from 'express';
import { getHotelById, getHotels } from '@/controllers/hotels-controller';
import { authenticateToken } from '@/middlewares';

const hotelsRouter = Router();

hotelsRouter.all('/*', authenticateToken).get('/', getHotels).get('/:hotelId', getHotelById);

export { hotelsRouter };

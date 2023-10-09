import { bookingRepository } from '@/repositories';
import { bookingService } from '@/services';

describe('GET /booking', () => {
  it('should throw return the booking when the user have one', async () => {
    const bookingData = { Booking: { id: 1, Room: {} } };
    jest.spyOn(bookingRepository, 'getBookingByUserId').mockImplementationOnce((): any => {
      return bookingData;
    });
    const promise = bookingService.getBookings(1);
    expect(promise).resolves.toEqual(bookingData);
  });

  it('should throw an error when the user does not have a booking', async () => {
    jest.spyOn(bookingRepository, 'getBookingByUserId').mockImplementationOnce((): any => {
      return null;
    });
    const promise = bookingService.getBookings(1);
    expect(promise).rejects.toEqual({
      name: 'NotFoundError',
      message: 'No result for this search!',
    });
  });
});

describe('POST /booking', () => {
  it('should throw an error when room does not exist', async () => {
    jest.spyOn(bookingRepository, 'roomExists').mockImplementationOnce((): any => {
      return null;
    });

    const promise = bookingService.createBooking(1, 1);
    expect(promise).rejects.toEqual({
      name: 'NotFoundError',
      message: 'No result for this search!',
    });
  });
});

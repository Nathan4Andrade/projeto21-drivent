import faker from '@faker-js/faker';
import httpStatus from 'http-status';
import * as jwt from 'jsonwebtoken';
import supertest from 'supertest';
import { TicketStatus } from '@prisma/client';
import {
  createUser,
  createTicketType,
  createEnrollmentWithAddress,
  createTicket,
  createHotel,
  createRoom,
  createBooking,
} from '../factories';
import { cleanDb, generateValidToken } from '../helpers';
import { prisma } from '@/config';
import app, { init } from '@/app';

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe('GET /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/booking');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 404 if user has no booking yet', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should respond with status 200 with booking and room data', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const room = await createRoom(hotel.id);
      const booking = await createBooking(user.id, room.id);

      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual({
        id: booking.id,
        Room: {
          id: room.id,
          name: room.name,
          capacity: room.capacity,
          hotelId: room.hotelId,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      });
    });
  });
});

describe('POST /booking', () => {
  const body = { roomId: 1 };

  it('should respond with status 401 if no token is given', async () => {
    const response = await server.post('/booking').send(body);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 400 if roomId is not present', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it('should respond with status 403 when user doesnt have enrollment', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 when user doesnt have ticket', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 when user hasnt paid ticket', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 when ticket doesnt include hotel', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it('should respond with status 404 if room is not found', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should respond with status 403 if user already has booking of requested room', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const room = await createRoom(hotel.id);
      await createBooking(user.id, room.id);

      const body = { roomId: room.id };
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 if room capacity is exceeded', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const room = await createRoom(hotel.id, { capacity: 0 });

      const body = { roomId: room.id };
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it('should respond with status 200 and returns bookingId', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const room = await createRoom(hotel.id);

      const body = { roomId: room.id };
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

      const booking = await prisma.booking.findUnique({
        where: { id: response.body.bookingId },
      });

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual(
        expect.objectContaining({
          bookingId: booking.id,
        }),
      );
    });
  });
});

describe('PUT /booking/:bookingId', () => {
  const bookingId = 1;
  const body = { roomId: 1 };

  it('should respond with status 401 if no token is given', async () => {
    const response = await server.put(`/booking/${bookingId}`).send(body);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.put(`/booking/${bookingId}`).set('Authorization', `Bearer ${token}`).send(body);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.put(`/booking/${bookingId}`).set('Authorization', `Bearer ${token}`).send(body);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 400 if roomId is not present', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.put(`/booking/${bookingId}`).set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it('should respond with status 400 if bookingId is invalid', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server
        .put(`/booking/${faker.word.noun()}`)
        .set('Authorization', `Bearer ${token}`)
        .send(body);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it('should respond with status 404 if room is not found', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.put(`/booking/${bookingId}`).set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should respond with status 403 if booking is not found', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoom(hotel.id);

      const body = { roomId: room.id };
      const response = await server.put(`/booking/${bookingId}`).set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 if booking is not from user', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoom(hotel.id);
      const randomUser = await createUser();
      const randomRoom = await createRoom(hotel.id);
      const booking = await createBooking(randomUser.id, randomRoom.id);

      const body = { roomId: room.id };
      const response = await server.put(`/booking/${booking.id}`).set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 if the requested room is from the same booking room', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoom(hotel.id);
      const booking = await createBooking(user.id, room.id);

      const body = { roomId: room.id };
      const response = await server.put(`/booking/${booking.id}`).set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 if new room capacity is exceeded', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoom(hotel.id, { capacity: 0 });
      const randomRoom = await createRoom(hotel.id);
      const booking = await createBooking(user.id, randomRoom.id);

      const body = { roomId: room.id };
      const response = await server.put(`/booking/${booking.id}`).set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it('should respond with status 200 and returns bookingId', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoom(hotel.id);
      const randomRoom = await createRoom(hotel.id);
      const booking = await createBooking(user.id, randomRoom.id);

      const body = { roomId: room.id };
      const response = await server.put(`/booking/${booking.id}`).set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual(
        expect.objectContaining({
          bookingId: expect.any(Number),
        }),
      );
    });
  });
});

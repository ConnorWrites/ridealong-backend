import { prisma } from "../lib/prisma";

export async function createRide(
  driverId: string,
  origin: string,
  destination: string,
  departureTime: Date,
  availableSeats: number
) {
  if (!origin || !destination) {
    throw new Error("origin and destination are required");
  }
  if (isNaN(departureTime.getTime())) {
    throw new Error("departureTime must be a valid date");
  }
  if (departureTime.getTime() < Date.now()) {
    throw new Error("departureTime must be in the future");
  }
  if (typeof availableSeats !== "number" || availableSeats < 1 || availableSeats > 10) {
    throw new Error("availableSeats must be a number between 1 and 10");
  }

  const existingRide = await prisma.ride.findFirst({
    where: {
      driverId,
      departureTime: {
        gte: new Date(departureTime.getTime() - 60 * 60 * 1000), // 1 hour before
        lte: new Date(departureTime.getTime() + 60 * 60 * 1000), // 1 hour after
      },
    },
  });

  if (existingRide) {
    throw new Error("Driver already has a ride scheduled around this time");
  }

  return prisma.ride.create({
    data: { origin, destination, departureTime, driverId, availableSeats },
  });
}

export async function listRides(filters: { origin?: string; destination?: string }) {
  return prisma.ride.findMany({
    where: {
      origin: filters.origin ? { contains: filters.origin, mode: "insensitive" } : undefined,
      destination: filters.destination
        ? { contains: filters.destination, mode: "insensitive" }
        : undefined,
      departureTime: { gte: new Date() },
    },
    include: {
      driver: { select: { id: true, name: true, email: true } },
      requests: { select: { id: true, status: true, userId: true, createdAt: true } },
    },
    orderBy: { departureTime: "asc" },
  });
}

export async function getRideById(rideId: string) {
  const ride = await prisma.ride.findUnique({
    where: { id: rideId },
    include: {
      driver: { select: { id: true, name: true, email: true } },
      requests: { select: { id: true, status: true, userId: true, createdAt: true } },
    },
  });

  if (!ride) throw new Error("Ride not found");
  return ride;
}

export async function listMyRides(userId: string) {
  return prisma.ride.findMany({
    where: { driverId: userId },
    include: {
      requests: { select: { id: true, status: true, userId: true, createdAt: true, rideId: true } },
    },
    orderBy: { departureTime: "asc" },
  });
}

export async function deleteRide(rideId: string, driverId: string) {
  const ride = await prisma.ride.findUnique({ where: { id: rideId } });

  if (!ride) throw new Error("Ride not found");
  if (ride.driverId !== driverId) throw new Error("Only the driver can delete this ride");

  await prisma.rideRequest.deleteMany({ where: { rideId } });
  await prisma.ride.delete({ where: { id: rideId } });
}

export async function updateRide(
  rideId: string,
  driverId: string,
  data: { origin?: string; destination?: string; departureTime?: Date; availableSeats?: number }
) {
  const ride = await prisma.ride.findUnique({ where: { id: rideId } });

  if (!ride) throw new Error("Ride not found");
  if (ride.driverId !== driverId) throw new Error("Only the driver can edit this ride");

  if (data.departureTime && data.departureTime.getTime() < Date.now()) {
    throw new Error("Departure time must be in the future");
  }

  return prisma.ride.update({
    where: { id: rideId },
    data: {
      origin: data.origin ?? ride.origin,
      destination: data.destination ?? ride.destination,
      departureTime: data.departureTime ?? ride.departureTime,
      availableSeats: data.availableSeats ?? ride.availableSeats,
    },
  });
}
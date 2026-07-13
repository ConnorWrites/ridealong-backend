import { prisma } from "../lib/prisma";

export async function createRide( driverId: string, origin: string, destination: string, departureTime: Date, availableSeats: number) {
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
    throw new Error("Available seats must be a number between 1 and 10");
  }
  return prisma.ride.create({
    data: {
      origin,
      destination,
      departureTime,
      availableSeats,
      bookedSeats: 0,
      driverId,
    },
  });
}

export async function listRides(filters: { origin?: string; destination?: string }) {
  return prisma.ride.findMany({
    where: {
      origin: filters.origin ? { contains: filters.origin, mode: "insensitive" } : undefined,
      destination: filters.destination ? { contains: filters.destination, mode: "insensitive" } : undefined,
      departureTime: { gte: new Date() },
    },
    include: {
      driver: { select: { id: true, name: true, email: true } },
      requests: { select: { id: true, status: true, userId: true } },
    },
    orderBy: { departureTime: "asc" },
});
}

export async function getRideById(rideId: string) {
  const ride = await prisma.ride.findUnique({
    where: { id: rideId },
    include: { driver: { select: { id: true, name: true, email: true } },
    requests: { select: { id: true, status: true, userId: true } },
    },
  });

  if (!ride) {
    throw new Error("Ride not found");
  }
  return ride;
}

export async function listMyRides(userId: string) {
  return prisma.ride.findMany({
    where: { driverId: userId },
    include: { requests: { select: { id: true, status: true, userId: true } } },
    orderBy: { departureTime: "asc" },
  });
}
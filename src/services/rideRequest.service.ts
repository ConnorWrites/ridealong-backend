import { prisma } from "../lib/prisma";

export async function requestRide(userId: string, rideId: string, seatsRequested: number) {
  const ride = await prisma.ride.findUnique({
    where: { id: rideId },
    include: { requests: true },
  });

  if (!ride) {
    throw new Error("Ride not found");
  }

  if (ride.driverId === userId) {
    throw new Error("Driver cannot request own ride");
  }

  if (seatsRequested < 1) {
    throw new Error(`Must request at least one seat`);
  }

  const seatsRemaining = ride.availableSeats - ride.bookedSeats;

  if (seatsRequested > seatsRemaining) {
    throw new Error(`Not enough seats available. Only ${seatsRemaining} left.`);
  }

  const existingRequest = ride.requests.find((r) => r.userId === userId);

  if (existingRequest) {
    throw new Error("Ride already requested by this user");
  }

  return prisma.rideRequest.create({
    data: { userId, rideId, seatsRequested },
  });
}

export async function acceptRideRequest(requestId: string, driverId: string) {
  const request = await prisma.rideRequest.findUnique({
    where: { id: requestId },
    include: {
      ride: {
        include: { requests: true },
      },
    },
  });

  if (!request) {
    throw new Error("Ride request not found");
  }

  if (request.ride.driverId !== driverId) {
    throw new Error("Only the driver can accept requests");
  }

  if (request.status !== "PENDING") {
    throw new Error("Request already handled");
  }

const result = await prisma.$transaction(async (tx) => {
  const ride = await tx.ride.findUnique({
    where: { id: request.rideId },
  });

  if (!ride) {
    throw new Error("Ride not found");
  }

  const seatsRemaining = ride.availableSeats - ride.bookedSeats;

  if (request.seatsRequested > seatsRemaining) {
    throw new Error(
      `Only ${seatsRemaining} seat(s) remaining for this ride.`
    );
  }

  const accepted = await tx.rideRequest.update({
    where: { id: requestId },
    data: {
      status: "ACCEPTED",
    },
  });

  const updatedRide = await tx.ride.update({
    where: { id: ride.id },
    data: {
      bookedSeats: {
        increment: request.seatsRequested,
      },
    },
  });

  let autoRejectedCount = 0;

  if (updatedRide.bookedSeats >= updatedRide.availableSeats) {
    const rejected = await tx.rideRequest.updateMany({
      where: {
        rideId: ride.id,
        status: "PENDING",
      },
      data: {
        status: "REJECTED",
      },
    });

    autoRejectedCount = rejected.count;
  }

  return {
    accepted,
    autoRejectedCount,
  };
});

return result;
}

export async function rejectRideRequest(requestId: string, driverId: string) {
  const request = await prisma.rideRequest.findUnique({
    where: { id: requestId },
    include: { ride: true },
  });

  if (!request) {
    throw new Error("Ride request not found");
  }

  if (request.ride.driverId !== driverId) {
    throw new Error("Only the driver can reject requests");
  }

  if (request.status !== "PENDING") {
    throw new Error("Request already handled");
  }

  return prisma.rideRequest.update({
    where: { id: requestId },
    data: { status: "REJECTED" },
  });
}
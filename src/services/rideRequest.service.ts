import { prisma } from "../lib/prisma";

export async function requestRide(userId: string, rideId: string) {
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

  const existingRequest = ride.requests.find((r) => r.userId === userId);

  if (existingRequest) {
    throw new Error("Ride already requested by this user");
  }

  const acceptedRequest = ride.requests.find((r) => r.status === "ACCEPTED");

  if (acceptedRequest) {
    throw new Error("Ride already has an accepted passenger");
  }

  return prisma.rideRequest.create({
    data: { userId, rideId },
  });
}

export async function acceptRideRequest(requestId: string, driverId: string) {
  const request = await prisma.rideRequest.findUnique({
    where: { id: requestId },
    include: { ride: { include: { requests: true },},},
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

  return prisma.$transaction([ prisma.rideRequest.update({
      where: { id: requestId },
      data: { status: "ACCEPTED" },
    }),
    prisma.rideRequest.updateMany({
      where: { rideId: request.rideId, id: { not: requestId }, status: "PENDING" },
      data: { status: "REJECTED" },
    }),
  ]);
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
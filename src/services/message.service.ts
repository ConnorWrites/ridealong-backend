import { prisma } from "../lib/prisma";

async function getAuthorizedRequest(requestId: string, userId: string) {
  const request = await prisma.rideRequest.findUnique({
    where: { id: requestId },
    include: { ride: true },
  });

  if (!request) throw new Error("Ride request not found");

  const isPassenger = request.userId === userId;
  const isDriver = request.ride.driverId === userId;

  if (!isPassenger && !isDriver) {
    throw new Error("Not authorized to access this conversation");
  }

  if (request.status !== "ACCEPTED") {
    throw new Error("Messaging is only available once a request is accepted");
  }

  return request;
}

export async function sendMessage(requestId: string, senderId: string, content: string) {
  if (!content || !content.trim()) {
    throw new Error("Message cannot be empty");
  }
  if (content.length > 2000) {
    throw new Error("Message is too long");
  }

  await getAuthorizedRequest(requestId, senderId);

  return prisma.message.create({
    data: { content: content.trim(), senderId, rideRequestId: requestId },
    include: { sender: { select: { id: true, name: true, email: true } } },
  });
}

export async function listMessages(requestId: string, userId: string) {
  await getAuthorizedRequest(requestId, userId);

  return prisma.message.findMany({
    where: { rideRequestId: requestId },
    orderBy: { createdAt: "asc" },
    include: { sender: { select: { id: true, name: true, email: true } } },
  });
}


// src/testPrisma.ts
import { prisma } from "./lib/prisma";
import { signup } from "./services/auth.service";
import { createRide } from "./services/ride.service";
import { requestRide, acceptRideRequest } from "./services/rideRequest.service";

async function main() {
  const { user: driver } = await signup("driver@test.com", "secret123", "Dana Driver", "DRIVER");
  const { user: passenger } = await signup("passenger@test.com", "secret123", "Pat Passenger", "PASSENGER");

  const ride = await createRide(
    driver.id,
    "Campus",
    "City",
    new Date(Date.now() + 60 * 60 * 1000)
  );

  const request = await requestRide(passenger.id, ride.id);
  console.log("Ride request created:", request);

  const accepted = await acceptRideRequest(request.id, driver.id);
  console.log("Ride request accepted:", accepted);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
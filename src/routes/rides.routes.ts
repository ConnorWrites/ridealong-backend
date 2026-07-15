import { Router } from "express";
import { requireUser, requireRole } from "../middleware/auth";
import { createRide, listRides, getRideById, listMyRides, deleteRide, updateRide } from "../services/ride.service";

const router = Router();

function asString(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}
// List available upcoming rides filtered by origin/destination
router.get("/", requireUser, async (req, res) => {
  try {
    const { origin, destination } = req.query;
    const rides = await listRides({ 
      origin: typeof origin === "string" ? origin : undefined, 
      destination: typeof destination === "string" ? destination : undefined,
    });
    res.json(rides);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Rides the current user is driving
router.get("/mine", requireUser, async (req, res) => {
  try {
    const rides = await listMyRides(req.user!.id);
    res.json(rides);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/:rideId", requireUser, async (req, res) => {
  try {
    const rideId = asString(req.params.rideId);
    const ride = await getRideById(rideId);
    res.json(ride);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

// Only drivers can post a ride
router.post("/", requireUser, requireRole("DRIVER"), async (req, res) => {
  try {
    const { origin, destination, departureTime, availableSeats } = req.body;
if(typeof availableSeats !== "number" || availableSeats < 1 || availableSeats > 10) {
  return res.status(400).json({ error: "Available seats must be a number between 1 and 10" });
}
    const ride = await createRide(req.user!.id, origin, destination, new Date(departureTime), availableSeats);
    res.status(201).json(ride);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.patch("/:rideId", requireUser, requireRole("DRIVER"), async (req, res) => {
  try {
    const rideId = asString(req.params.rideId);
    const { origin, destination, departureTime, availableSeats } = req.body;
    const ride = await updateRide(rideId, req.user!.id, {
      origin,
      destination,
      departureTime: departureTime ? new Date(departureTime) : undefined,
      availableSeats: typeof availableSeats === "number" ? availableSeats : undefined ,
    });
    res.json(ride);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:rideId", requireUser, requireRole("DRIVER"), async (req, res) => {
  try {
    const rideId = asString(req.params.rideId);
    await deleteRide(rideId, req.user!.id);
    res.json({ message: "Ride deleted" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
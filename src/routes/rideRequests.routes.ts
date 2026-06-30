import { Router } from "express";
import { requireUser } from "../middleware/auth";
import { requestRide, acceptRideRequest, rejectRideRequest } from "../services/rideRequest.service";

const router = Router();

function asString(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

// POST /rides/:rideId/request
router.post("/:rideId/request", requireUser, async (req, res) => {
  try {
    const rideId = asString(req.params.rideId);
    const request = await requestRide(req.user!.id, rideId);
    res.status(201).json(request);
  } catch (err: any) { 
    res.status(400).json({ error: err.message });
  }
});

// POST /rides/requests/:requestId/accept
router.post("/requests/:requestId/accept", requireUser, async (req, res) => {
  try {
    const requestId = asString(req.params.requestId);
    const result = await acceptRideRequest(requestId, req.user!.id);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST /rides/requests/:requestId/reject
router.post("/requests/:requestId/reject", requireUser, async (req, res) => {
  try {
    const requestId = asString(req.params.requestId);
    const result = await rejectRideRequest(requestId, req.user!.id);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
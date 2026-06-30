import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import rideRoutes from "./routes/rides.routes";
import rideRequestRoutes from "./routes/rideRequests.routes";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRoutes);
app.use("/rides", rideRoutes);
app.use("/rides", rideRequestRoutes);

export default app;
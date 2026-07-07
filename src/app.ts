import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
import rideRoutes from "./routes/rides.routes";
import rideRequestRoutes from "./routes/rideRequests.routes";

const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "http://192.168.0.28:5173"], // Vite dev server
  credentials: true,               // Required to send/receive cookies cross-origin
}));
app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRoutes);
app.use("/rides", rideRoutes);
app.use("/rides", rideRequestRoutes);

export default app;
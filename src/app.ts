import "dotenv/config";
import express, { Request } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
import rideRoutes from "./routes/rides.routes";
import rideRequestRoutes from "./routes/rideRequests.routes";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://192.168.0.28:5173",
  "https://ridealong-frontend.onrender.com",
  process.env.FRONTEND_URL,
].filter((origin): origin is string => Boolean(origin));

app.use(cors({
  origin: allowedOrigins, // Vite dev server
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
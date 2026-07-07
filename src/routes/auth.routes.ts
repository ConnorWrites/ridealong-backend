import { Router } from "express";
import { signup, login, getMe } from "../services/auth.service";
import { requireUser } from "../middleware/auth";

const router = Router();

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

router.post("/signup", async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }
    if (role && role !== "DRIVER" && role !== "PASSENGER") {
      return res.status(400).json({ error: "role must be DRIVER or PASSENGER" });
    }

    const { token, user } = await signup(email, password, name, role);
    res.cookie("token", token, COOKIE_OPTIONS);
    res.status(201).json({ user });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const { token, user } = await login(email, password);
    res.cookie("token", token, COOKIE_OPTIONS);
    res.json({ user });
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
});

router.post("/logout", (_req, res) => {
  res.clearCookie("token", COOKIE_OPTIONS);
  res.json({ message: "Logged out" });
});

router.get("/me", requireUser, async (req, res) => {
  try {
    const user = await getMe(req.user!.id);
    res.json({ user });
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
});

export default router;
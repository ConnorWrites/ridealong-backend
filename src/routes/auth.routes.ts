import { Router } from "express";
import { signup, login } from "../services/auth.service";

const router = Router();

router.post("/signup", async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    if (role && role !== "DRIVER" && role !== "PASSENGER") {
      return res.status(400).json({ error: "role must be DRIVER or PASSENGER" });
    }

    const result = await signup(email, password, name, role);
    res.status(201).json(result);
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

    const result = await login(email, password);
    res.json(result);
  } catch (err: any) { res.status(401).json({ error: err.message });
  }
});

export default router;
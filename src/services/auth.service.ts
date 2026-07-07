import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import { signToken } from "../lib/jwt";

const SALT_ROUNDS = 12;

export async function signup(
  email: string,
  password: string,
  name: string | undefined,
  role: "DRIVER" | "PASSENGER" = "PASSENGER"
) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { email, password: passwordHash, name, role },
  });

  const token = signToken({ id: user.id, role: user.role });

  return {
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Invalid email or password");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error("Invalid email or password");

  const token = signToken({ id: user.id, role: user.role });

  return {
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true },
  });
  if (!user) throw new Error("User not found");
  return user;
}
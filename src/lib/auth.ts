import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { prisma } from "./prisma";

const APP_SECRET = process.env.APP_SECRET || "change-this-secret-in-production";

export function hashPassword(password: string): string {
  // Use 10 rounds instead of 12 for faster performance
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function createToken(user: { id: number; role: string; name: string }): string {
  return jwt.sign(
    { sub: user.id, role: user.role, name: user.name },
    APP_SECRET,
    { expiresIn: "24h" }
  );
}

export function decodeToken(token: string): { sub: number; role: string; name: string } | null {
  try {
    const payload = jwt.verify(token, APP_SECRET) as { sub: number; role: string; name: string };
    return payload;
  } catch {
    return null;
  }
}

// Cache user lookups to avoid repeated DB calls
const userCache = new Map<number, { user: any; expires: number }>();

export async function getCurrentUser(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  const payload = decodeToken(token);
  if (!payload) return null;

  const userId = Number(payload.sub);
  const cached = userCache.get(userId);
  if (cached && cached.expires > Date.now()) return cached.user;

  const user = await prisma.user.findFirst({
    where: { id: userId, is_active: true },
  });

  if (user) {
    userCache.set(userId, { user, expires: Date.now() + 60_000 }); // 1 min cache
  }

  return user;
}

export async function requireAuth(req: NextRequest, role?: string) {
  const user = await getCurrentUser(req);
  if (!user) {
    return { error: "Unauthorized", status: 401, user: null };
  }
  if (role && user.role !== role) {
    return { error: "Forbidden", status: 403, user: null };
  }
  return { error: null, status: 200, user };
}

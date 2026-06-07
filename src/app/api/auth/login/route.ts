import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const user = await prisma.user.findFirst({
      where: { email, is_active: true },
    });
    if (!user || !verifyPassword(password, user.password_hash)) {
      return NextResponse.json({ detail: "Invalid email or password" }, { status: 401 });
    }
    const token = createToken({ id: user.id, role: user.role, name: user.name });
    return NextResponse.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone },
    });
  } catch (e) {
    return NextResponse.json({ detail: "Server error" }, { status: 500 });
  }
}

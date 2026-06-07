import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { error, status, user } = await requireAuth(req);
  if (error) return NextResponse.json({ detail: error }, { status });
  return NextResponse.json({
    id: user!.id, name: user!.name, email: user!.email,
    role: user!.role, phone: user!.phone,
  });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest) {
  try {
    const specialties = await prisma.specialty.findMany();
    return NextResponse.json(
      specialties.map((s) => ({ id: s.id, name: s.name, description: s.description }))
    );
  } catch (e) {
    return NextResponse.json({ detail: "Server error" }, { status: 500 });
  }
}

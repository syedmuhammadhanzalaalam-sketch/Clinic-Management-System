import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { error, status } = await requireAuth(req, "admin");
  if (error) return NextResponse.json({ detail: error }, { status });

  try {
    const { doctor_id, day_of_week, start_time, end_time, slot_duration_minutes = 30 } = await req.json();

    await prisma.doctorAvailability.create({
      data: {
        doctor_id: Number(doctor_id),
        day_of_week: Number(day_of_week),
        start_time,
        end_time,
        slot_duration_minutes: Number(slot_duration_minutes),
      },
    });

    return NextResponse.json({ message: "Availability created" });
  } catch (e) {
    return NextResponse.json({ detail: "Server error" }, { status: 500 });
  }
}

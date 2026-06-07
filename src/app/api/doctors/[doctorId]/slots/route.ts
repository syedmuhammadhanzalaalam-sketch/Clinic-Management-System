import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function addMinutes(timeStr: string, minutes: number): string {
  const [h, m] = timeStr.split(":").map(Number);
  const totalMins = h * 60 + m + minutes;
  const newH = Math.floor(totalMins / 60) % 24;
  const newM = totalMins % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
}

function timeToMins(timeStr: string): number {
  const [h, m] = timeStr.slice(0, 5).split(":").map(Number);
  return h * 60 + m;
}

function getDayOfWeek(dateStr: string): number {
  // Parse directly to avoid timezone issues
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  const jsDay = d.getDay(); // 0=Sun
  return jsDay === 0 ? 7 : jsDay; // 1=Mon...7=Sun
}

export async function GET(
  req: NextRequest,
  { params }: { params: { doctorId: string } }
) {
  try {
    const doctorId = parseInt(params.doctorId);
    const appointmentDate = req.nextUrl.searchParams.get("appointment_date");
    if (!appointmentDate) {
      return NextResponse.json({ detail: "appointment_date is required" }, { status: 400 });
    }

    const isoWeekday = getDayOfWeek(appointmentDate);

    const availabilities = await prisma.doctorAvailability.findMany({
      where: { doctor_id: doctorId, day_of_week: isoWeekday, is_active: true },
    });

    const bookedAppointments = await prisma.appointment.findMany({
      where: {
        doctor_id: doctorId,
        appointment_date: appointmentDate,
        status: { notIn: ["cancelled", "no_show"] },
      },
    });

    const booked = new Set(bookedAppointments.map((a) => a.start_time.slice(0, 5)));

    const slots: string[] = [];
    for (const rule of availabilities) {
      let cursor = rule.start_time.slice(0, 5);
      const endTime = rule.end_time.slice(0, 5);
      const duration = rule.slot_duration_minutes;

      while (timeToMins(addMinutes(cursor, duration)) <= timeToMins(endTime)) {
        if (!booked.has(cursor)) slots.push(cursor);
        cursor = addMinutes(cursor, duration);
      }
    }

    return NextResponse.json(slots);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ detail: "Server error" }, { status: 500 });
  }
}

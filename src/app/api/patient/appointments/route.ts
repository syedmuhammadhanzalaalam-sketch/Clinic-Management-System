import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

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

export async function POST(req: NextRequest) {
  const { error, status, user } = await requireAuth(req, "patient");
  if (error) return NextResponse.json({ detail: error }, { status });

  try {
    const { doctor_id, appointment_date, start_time, reason_for_visit } = await req.json();

    const patient = await prisma.patient.findFirst({ where: { user_id: user!.id } });
    if (!patient) return NextResponse.json({ detail: "Patient profile not found" }, { status: 404 });

    // Check slot availability
    const d = new Date(appointment_date + "T00:00:00");
    const jsDay = d.getDay();
    const isoWeekday = jsDay === 0 ? 7 : jsDay;

    const availabilities = await prisma.doctorAvailability.findMany({
      where: { doctor_id, day_of_week: isoWeekday, is_active: true },
    });

    const bookedAppointments = await prisma.appointment.findMany({
      where: {
        doctor_id,
        appointment_date,
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

    if (!slots.includes(start_time)) {
      return NextResponse.json({ detail: "Slot is not available" }, { status: 400 });
    }

    // Calculate end time
    const rule = availabilities[0];
    const duration = rule?.slot_duration_minutes ?? 30;
    const end_time = addMinutes(start_time, duration);

    const appointment = await prisma.appointment.create({
      data: {
        patient_id: patient.id,
        doctor_id,
        appointment_date,
        start_time,
        end_time,
        status: "pending",
        reason_for_visit,
        created_by: user!.id,
      },
    });

    const doctor = await prisma.doctor.findFirst({ where: { id: doctor_id } });
    await prisma.payment.create({
      data: {
        appointment_id: appointment.id,
        patient_id: patient.id,
        doctor_id,
        amount: doctor?.consultation_fee ?? 0,
        payment_status: "pending",
      },
    });

    return NextResponse.json({ message: "Appointment created", appointment_id: appointment.id });
  } catch (e) {
    return NextResponse.json({ detail: "Server error" }, { status: 500 });
  }
}

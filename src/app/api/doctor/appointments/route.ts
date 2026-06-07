import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { error, status, user } = await requireAuth(req, "doctor");
  if (error) return NextResponse.json({ detail: error }, { status });

  try {
    const doctor = await prisma.doctor.findFirst({ where: { user_id: user!.id } });
    if (!doctor) return NextResponse.json({ detail: "Doctor profile not found" }, { status: 404 });

    const appointments = await prisma.appointment.findMany({
      where: { doctor_id: doctor.id },
      orderBy: { appointment_date: "desc" },
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
      },
    });

    return NextResponse.json(
      appointments.map((a) => ({
        id: a.id,
        patient_id: a.patient_id,
        patient_name: a.patient.user.name,
        doctor_id: a.doctor_id,
        doctor_name: a.doctor.user.name,
        appointment_date: a.appointment_date,
        start_time: a.start_time.slice(0, 5),
        end_time: a.end_time.slice(0, 5),
        status: a.status,
        reason_for_visit: a.reason_for_visit,
      }))
    );
  } catch (e) {
    return NextResponse.json({ detail: "Server error" }, { status: 500 });
  }
}

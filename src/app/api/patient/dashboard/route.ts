import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { error, status, user } = await requireAuth(req, "patient");
  if (error) return NextResponse.json({ detail: error }, { status });

  try {
    const patient = await prisma.patient.findFirst({ where: { user_id: user!.id } });
    if (!patient) return NextResponse.json({ detail: "Patient profile not found" }, { status: 404 });

    const appointments = await prisma.appointment.findMany({
      where: { patient_id: patient.id },
      orderBy: { appointment_date: "desc" },
      include: {
        doctor: { include: { user: true } },
        patient: { include: { user: true } },
      },
    });

    const reports = await prisma.labReport.findMany({
      where: { patient_id: patient.id },
      orderBy: { uploaded_at: "desc" },
    });

    return NextResponse.json({
      patient: {
        id: patient.id,
        name: user!.name,
        blood_group: patient.blood_group,
        gender: patient.gender,
      },
      appointments: appointments.map((a) => ({
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
      })),
      reports: reports.map((r) => ({
        id: r.id,
        report_name: r.report_name,
        report_type: r.report_type,
        file_url: r.file_url,
        uploaded_at: r.uploaded_at.toISOString(),
      })),
    });
  } catch (e) {
    return NextResponse.json({ detail: "Server error" }, { status: 500 });
  }
}

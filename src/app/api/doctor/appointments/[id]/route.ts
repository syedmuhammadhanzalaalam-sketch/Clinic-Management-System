import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error, status, user } = await requireAuth(req, "doctor");
  if (error) return NextResponse.json({ detail: error }, { status });

  try {
    const appointmentId = parseInt(params.id);
    const doctor = await prisma.doctor.findFirst({ where: { user_id: user!.id } });
    if (!doctor) return NextResponse.json({ detail: "Doctor profile not found" }, { status: 404 });

    const appointment = await prisma.appointment.findFirst({
      where: { id: appointmentId, doctor_id: doctor.id },
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
      },
    });

    if (!appointment) return NextResponse.json({ detail: "Appointment not found" }, { status: 404 });

    const patient = appointment.patient;
    const patientUser = appointment.patient.user;

    const history = await prisma.patientMedicalHistory.findMany({
      where: { patient_id: patient.id },
    });
    const allergies = await prisma.patientAllergy.findMany({
      where: { patient_id: patient.id },
    });
    const reports = await prisma.labReport.findMany({
      where: { patient_id: patient.id },
    });
    const assessments = await prisma.aiAssessment.findMany({
      where: { patient_id: patient.id },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({
      appointment: {
        id: appointment.id,
        patient_id: appointment.patient_id,
        patient_name: patientUser.name,
        doctor_id: appointment.doctor_id,
        doctor_name: appointment.doctor.user.name,
        appointment_date: appointment.appointment_date,
        start_time: appointment.start_time.slice(0, 5),
        end_time: appointment.end_time.slice(0, 5),
        status: appointment.status,
        reason_for_visit: appointment.reason_for_visit,
      },
      patient: {
        id: patient.id,
        name: patientUser.name,
        email: patientUser.email,
        phone: patientUser.phone,
        date_of_birth: patient.date_of_birth,
        gender: patient.gender,
        blood_group: patient.blood_group,
        address: patient.address,
      },
      history: history.map((h) => ({
        condition_name: h.condition_name,
        description: h.description,
        diagnosed_at: h.diagnosed_at,
        is_chronic: h.is_chronic,
      })),
      allergies: allergies.map((a) => ({
        allergy_name: a.allergy_name,
        severity: a.severity,
        notes: a.notes,
      })),
      reports: reports.map((r) => ({
        report_name: r.report_name,
        file_url: r.file_url,
        uploaded_at: r.uploaded_at.toISOString(),
      })),
      latest_assessment:
        assessments.length === 0
          ? null
          : {
              risk_level: assessments[0].risk_level,
              possible_diagnoses: assessments[0].possible_diagnoses,
              recommended_tests: assessments[0].recommended_tests,
              precautions: assessments[0].precautions,
              natural_remedies: assessments[0].natural_remedies,
              warnings: assessments[0].warnings,
            },
    });
  } catch (e) {
    return NextResponse.json({ detail: "Server error" }, { status: 500 });
  }
}

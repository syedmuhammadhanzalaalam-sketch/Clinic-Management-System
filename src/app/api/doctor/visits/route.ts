import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { generateAiAssessment } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const { error, status, user } = await requireAuth(req, "doctor");
  if (error) return NextResponse.json({ detail: error }, { status });

  try {
    const {
      appointment_id, symptoms, vitals = {},
      examination_notes, diagnosis, treatment_plan, follow_up_date,
    } = await req.json();

    const doctor = await prisma.doctor.findFirst({ where: { user_id: user!.id } });
    if (!doctor) return NextResponse.json({ detail: "Doctor profile not found" }, { status: 404 });

    const appointment = await prisma.appointment.findFirst({
      where: { id: appointment_id, doctor_id: doctor.id },
    });
    if (!appointment) return NextResponse.json({ detail: "Appointment not found" }, { status: 404 });

    const historyRows = await prisma.patientMedicalHistory.findMany({
      where: { patient_id: appointment.patient_id },
    });
    const history = historyRows.map((h) => ({ condition_name: h.condition_name, description: h.description ?? "" }));

    const assessment = await generateAiAssessment(symptoms, history, vitals);

    // Upsert visit
    const existingVisit = await prisma.visit.findFirst({ where: { appointment_id } });
    let visit;
    if (existingVisit) {
      visit = await prisma.visit.update({
        where: { id: existingVisit.id },
        data: { symptoms, vitals, examination_notes, diagnosis, treatment_plan, follow_up_date: follow_up_date || null },
      });
    } else {
      visit = await prisma.visit.create({
        data: {
          appointment_id,
          patient_id: appointment.patient_id,
          doctor_id: doctor.id,
          symptoms, vitals, examination_notes, diagnosis, treatment_plan,
          follow_up_date: follow_up_date || null,
        },
      });
    }

    await prisma.aiAssessment.create({
      data: {
        visit_id: visit.id,
        patient_id: appointment.patient_id,
        doctor_id: doctor.id,
        risk_level: assessment.risk_level,
        possible_diagnoses: assessment.possible_diagnoses,
        recommended_tests: assessment.recommended_tests,
        precautions: assessment.precautions,
        natural_remedies: assessment.natural_remedies,
        warnings: assessment.warnings,
        ai_model: "local-rule-engine",
        prompt_version: "v1",
      },
    });

    await prisma.appointment.update({
      where: { id: appointment_id },
      data: { status: "completed" },
    });

    return NextResponse.json({ message: "Visit saved", assessment });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ detail: "Server error" }, { status: 500 });
  }
}

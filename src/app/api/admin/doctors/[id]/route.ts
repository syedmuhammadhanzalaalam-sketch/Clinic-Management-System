import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error, status } = await requireAuth(req, "admin");
  if (error) return NextResponse.json({ detail: error }, { status });

  try {
    const doctorId = parseInt(params.id);

    const doctor = await prisma.doctor.findFirst({ where: { id: doctorId } });
    if (!doctor) return NextResponse.json({ detail: "Doctor not found" }, { status: 404 });

    // Delete in correct order to respect foreign key constraints
    await prisma.aiAssessment.deleteMany({ where: { doctor_id: doctorId } });
    await prisma.payment.deleteMany({ where: { doctor_id: doctorId } });
    await prisma.visit.deleteMany({ where: { doctor_id: doctorId } });
    await prisma.appointment.deleteMany({ where: { doctor_id: doctorId } });
    await prisma.doctorAvailability.deleteMany({ where: { doctor_id: doctorId } });
    await prisma.doctorSpecialty.deleteMany({ where: { doctor_id: doctorId } });
    await prisma.doctor.delete({ where: { id: doctorId } });
    await prisma.user.delete({ where: { id: doctor.user_id } });

    return NextResponse.json({ message: "Doctor removed successfully" });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ detail: "Server error" }, { status: 500 });
  }
}

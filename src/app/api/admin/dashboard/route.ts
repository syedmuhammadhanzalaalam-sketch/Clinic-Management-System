import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { error, status } = await requireAuth(req, "admin");
  if (error) return NextResponse.json({ detail: error }, { status });

  try {
    const [doctors, patients, appointments, revenueResult] = await Promise.all([
      prisma.doctor.count(),
      prisma.patient.count(),
      prisma.appointment.count(),
      prisma.payment.aggregate({
        where: { payment_status: "paid" },
        _sum: { amount: true },
      }),
    ]);

    return NextResponse.json({
      doctors,
      patients,
      appointments,
      revenue: parseFloat(String(revenueResult._sum.amount ?? 0)),
    });
  } catch (e) {
    return NextResponse.json({ detail: "Server error" }, { status: 500 });
  }
}

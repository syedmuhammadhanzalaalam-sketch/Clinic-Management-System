import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { error, status } = await requireAuth(req, "admin");
  if (error) return NextResponse.json({ detail: error }, { status });

  try {
    const [payments, paidSum, pendingSum] = await Promise.all([
      prisma.payment.findMany({ orderBy: { id: "desc" } }),
      prisma.payment.aggregate({ where: { payment_status: "paid" }, _sum: { amount: true } }),
      prisma.payment.aggregate({ where: { payment_status: "pending" }, _sum: { amount: true } }),
    ]);

    return NextResponse.json({
      total_paid: parseFloat(String(paidSum._sum.amount ?? 0)),
      total_pending: parseFloat(String(pendingSum._sum.amount ?? 0)),
      payments: payments.map((p) => ({
        id: p.id,
        appointment_id: p.appointment_id,
        amount: parseFloat(String(p.amount)),
        payment_method: p.payment_method,
        payment_status: p.payment_status,
        paid_at: p.paid_at ? p.paid_at.toISOString() : null,
      })),
    });
  } catch (e) {
    return NextResponse.json({ detail: "Server error" }, { status: 500 });
  }
}

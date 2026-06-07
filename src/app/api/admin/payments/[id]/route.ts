import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error, status } = await requireAuth(req, "admin");
  if (error) return NextResponse.json({ detail: error }, { status });

  try {
    const { payment_status } = await req.json();

    const payment = await prisma.payment.update({
      where: { id: parseInt(params.id) },
      data: {
        payment_status,
        paid_at: payment_status === "paid" ? new Date() : null,
      },
    });

    return NextResponse.json({ message: "Payment updated" });
  } catch (e) {
    return NextResponse.json({ detail: "Server error" }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name, email, password, phone,
      date_of_birth, gender, blood_group, address,
      emergency_contact_name, emergency_contact_phone,
    } = body;

    const existing = await prisma.user.findFirst({ where: { email } });
    if (existing) {
      return NextResponse.json({ detail: "Email already exists" }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: {
        name, email,
        password_hash: hashPassword(password),
        phone: phone || null,
        role: "patient",
      },
    });

    await prisma.patient.create({
      data: {
        user_id: user.id,
        date_of_birth: date_of_birth || "",
        gender: gender || "",
        blood_group: blood_group || null,
        address: address || null,
        emergency_contact_name: emergency_contact_name || null,
        emergency_contact_phone: emergency_contact_phone || null,
      },
    });

    return NextResponse.json({ message: "Patient registered" });
  } catch (e) {
    return NextResponse.json({ detail: "Server error" }, { status: 500 });
  }
}

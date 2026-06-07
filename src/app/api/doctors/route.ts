import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest) {
  try {
    const doctors = await prisma.doctor.findMany({
      include: {
        user: true,
        specialties: { include: { specialty: true } },
      },
    });

    const data = doctors.map((doctor) => ({
      id: doctor.id,
      name: doctor.user.name,
      email: doctor.user.email,
      phone: doctor.user.phone,
      qualification: doctor.qualification,
      bio: doctor.bio,
      consultation_fee: parseFloat(String(doctor.consultation_fee)),
      experience_years: doctor.experience_years,
      specialties: doctor.specialties.map((ds) => ds.specialty.name),
    }));

    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ detail: "Server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, hashPassword } from "@/lib/auth";

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

export async function POST(req: NextRequest) {
  const { error, status } = await requireAuth(req, "admin");
  if (error) return NextResponse.json({ detail: error }, { status });

  try {
    const body = await req.json();
    const {
      name, email, phone, password = "password",
      license_number, qualification, bio,
      consultation_fee, experience_years,
      specialty_ids = [], custom_specialties = [],
    } = body;

    const cleanedCustom = (custom_specialties as string[]).map((s: string) => s.trim()).filter(Boolean);

    if (!specialty_ids.length && !cleanedCustom.length) {
      return NextResponse.json({ detail: "Select at least one specialty or add a custom specialty" }, { status: 400 });
    }

    const account = await prisma.user.create({
      data: {
        name, email,
        password_hash: hashPassword(password),
        phone: phone || null,
        role: "doctor",
      },
    });

    const doctor = await prisma.doctor.create({
      data: {
        user_id: account.id,
        license_number,
        qualification,
        bio: bio || null,
        consultation_fee,
        experience_years,
      },
    });

    const allSpecialtyIds = new Set<number>(specialty_ids);

    for (const sname of cleanedCustom) {
      let specialty = await prisma.specialty.findFirst({ where: { name: sname } });
      if (!specialty) {
        specialty = await prisma.specialty.create({
          data: { name: sname, description: "Custom specialty added by admin." },
        });
      }
      allSpecialtyIds.add(specialty.id);
    }

    for (const specialtyId of allSpecialtyIds) {
      await prisma.doctorSpecialty.create({
        data: { doctor_id: doctor.id, specialty_id: specialtyId },
      });
    }

    return NextResponse.json({ message: "Doctor created", doctor_id: doctor.id });
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json({ detail: "Email already exists" }, { status: 400 });
    }
    return NextResponse.json({ detail: "Server error" }, { status: 500 });
  }
}
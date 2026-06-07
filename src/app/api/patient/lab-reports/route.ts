import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  const { error, status, user } = await requireAuth(req, "patient");
  if (error) return NextResponse.json({ detail: error }, { status });

  try {
    const formData = await req.formData();
    const report_name = formData.get("report_name") as string;
    const report_type = (formData.get("report_type") as string) || "";
    const notes = (formData.get("notes") as string) || "";
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ detail: "File is required" }, { status: 400 });

    const ext = path.extname(file.name).toLowerCase();
    if (![".pdf", ".jpg", ".jpeg", ".png"].includes(ext)) {
      return NextResponse.json({ detail: "Only PDF, JPG, and PNG reports are allowed" }, { status: 400 });
    }

    const patient = await prisma.patient.findFirst({ where: { user_id: user!.id } });
    if (!patient) return NextResponse.json({ detail: "Patient profile not found" }, { status: 404 });

    const filename = `patient_${patient.id}_${Date.now()}${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "lab_reports");
    await mkdir(uploadDir, { recursive: true });

    const bytes = await file.arrayBuffer();
    await writeFile(path.join(uploadDir, filename), Buffer.from(bytes));

    const file_url = `/uploads/lab_reports/${filename}`;

    const report = await prisma.labReport.create({
      data: {
        patient_id: patient.id,
        uploaded_by: user!.id,
        report_name,
        report_type,
        notes,
        file_url,
      },
    });

    return NextResponse.json({ message: "Report uploaded", file_url: report.file_url });
  } catch (e) {
    return NextResponse.json({ detail: "Server error" }, { status: 500 });
  }
}

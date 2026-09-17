import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendSMS } from "@/lib/telephony/africastalking";
import * as patientsRepo from "@/db/repository/patients";
import { requirePermission } from "@/lib/rbac/server";

const sendSchema = z.object({
  phoneNumber: z.string().min(7),
  message: z.string().min(1),
  patientId: z.coerce.number().int().optional(),
});

export async function POST(req: NextRequest) {
  const auth = await requirePermission("canViewAllPatients");
  if (!auth.ok) return auth.response;

  try {
    const { phoneNumber, message, patientId } = sendSchema.parse(await req.json());
    const patient = patientId
      ? await patientsRepo.getPatientById(patientId)
      : await patientsRepo.findPatientByPhone(phoneNumber);

    const result = await sendSMS(phoneNumber, message);

    return NextResponse.json({
      ...result,
      recipient: phoneNumber,
      patientName: patient?.fullName ?? "Unregistered Number",
      sentAt: new Date().toISOString(),
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid SMS payload", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to dispatch SMS" }, { status: 500 });
  }
}

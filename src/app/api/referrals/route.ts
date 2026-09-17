import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import * as referralsRepo from "@/db/repository/referrals";
import * as facilitiesRepo from "@/db/repository/facilities";
import { requirePermission } from "@/lib/rbac/server";
import { logAudit } from "@/lib/security/audit";

export async function GET(req: NextRequest) {
  const auth = await requirePermission("canViewCapacity");
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? undefined;
  const patientId = searchParams.get("patientId");

  const referrals = await referralsRepo.listReferrals({
    status,
    patientId: patientId ? Number(patientId) : undefined,
  });

  return NextResponse.json({ total: referrals.length, referrals });
}

const newReferralSchema = z.object({
  patientId: z.coerce.number().int(),
  referringFacilityId: z.coerce.number().int(),
  receivingFacilityId: z.coerce.number().int(),
  clinicalIndication: z.string().min(1),
  urgencyLevel: z.enum(["URGENT", "EMERGENCY", "CRITICAL_STAT"]).default("EMERGENCY"),
  icuBedReserved: z.boolean().default(false),
  theatreReserved: z.boolean().default(false),
  bloodUnitsReserved: z.coerce.number().int().min(0).default(0),
  bloodTypeReserved: z.string().optional(),
  preArrivalHandoverNote: z.string().optional(),
});

/**
 * Records a Delay-3 referral: this clinic has confirmed the receiving
 * facility's live capacity and is sending the mother there. No ambulance
 * dispatch happens here — transport coordination is out of product scope.
 */
export async function POST(req: NextRequest) {
  const auth = await requirePermission("canCreateReferral");
  if (!auth.ok) return auth.response;

  try {
    const body = newReferralSchema.parse(await req.json());

    const [referringFacility, receivingFacility] = await Promise.all([
      facilitiesRepo.getFacilityById(body.referringFacilityId),
      facilitiesRepo.getFacilityById(body.receivingFacilityId),
    ]);
    if (!referringFacility || !receivingFacility) {
      return NextResponse.json({ error: "Referring or receiving facility not found" }, { status: 404 });
    }

    const referral = await referralsRepo.createReferral(body);
    await logAudit(auth.actor, "REFERRAL_CREATE", "referral", String(referral.id), {
      receivingFacilityId: body.receivingFacilityId,
    });

    return NextResponse.json({
      success: true,
      message: `Referral ${referral.referralCode} recorded for ${receivingFacility.name}`,
      referral,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid referral payload", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to create referral" }, { status: 500 });
  }
}

const statusUpdateSchema = z.object({
  referralId: z.coerce.number().int(),
  status: z.enum(["ACKNOWLEDGED", "ACCEPTED", "ADMITTED", "COMPLETED", "DECLINED"]),
});

/** The receiving facility acknowledges/accepts/admits — no transport tracking involved. */
export async function PATCH(req: NextRequest) {
  const auth = await requirePermission("canAcknowledgeReferral");
  if (!auth.ok) return auth.response;

  try {
    const { referralId, status } = statusUpdateSchema.parse(await req.json());
    const referral = await referralsRepo.updateReferralStatus(referralId, status);
    if (!referral) return NextResponse.json({ error: "Referral not found" }, { status: 404 });

    await logAudit(auth.actor, "REFERRAL_STATUS_UPDATE", "referral", String(referralId), { status });

    return NextResponse.json({ success: true, referral });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid status payload", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to update referral" }, { status: 500 });
  }
}

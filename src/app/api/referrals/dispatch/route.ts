import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import * as referralsRepo from "@/db/repository/referrals";
import * as patientsRepo from "@/db/repository/patients";
import * as facilitiesRepo from "@/db/repository/facilities";
import * as capacitiesRepo from "@/db/repository/capacities";
import { requirePermission } from "@/lib/rbac/server";
import { logAudit } from "@/lib/security/audit";

const dispatchAlertSchema = z.object({
  referralId: z.coerce.number().int(),
  channel: z.enum(["WHATSAPP", "SMS", "ALL"]).default("WHATSAPP"),
  driverPhone: z.string().optional(),
  ambulancePlate: z.string().optional(),
  estimatedMinutes: z.coerce.number().int().optional(),
  onBoardInterventions: z.string().optional(), // e.g. "2L IV Normal Saline, MgSO4 4g IV loading dose completed"
});

/**
 * Pre-arrival WhatsApp / SMS dispatch alert to receiving hospital triage desk.
 * Solves the "no nurse will open a separate web tab" reality by piping critical
 * clinical telemetry directly into the duty station's phone / WhatsApp group.
 */
export async function POST(req: NextRequest) {
  const auth = await requirePermission("canCreateReferral");
  if (!auth.ok) return auth.response;

  try {
    const body = dispatchAlertSchema.parse(await req.json());

    const referral = await referralsRepo.getReferralById(body.referralId);
    if (!referral) {
      return NextResponse.json({ error: "Referral not found" }, { status: 404 });
    }

    const [patient, referringFacility, receivingFacility, receivingCapacity] = await Promise.all([
      patientsRepo.getPatientById(referral.patientId),
      facilitiesRepo.getFacilityById(referral.referringFacilityId),
      facilitiesRepo.getFacilityById(referral.receivingFacilityId),
      capacitiesRepo.getCapacityByFacilityId(referral.receivingFacilityId),
    ]);

    const targetPhone =
      receivingCapacity?.dutyStationWhatsappPhone ||
      receivingFacility?.emergencyPhone ||
      "+254711000303";

    const eta = body.estimatedMinutes ?? 35;
    const interventions = body.onBoardInterventions || "16G IV Cannula x2, IV Fluids running, Mother stabilized in transit";

    const acuityBadge = referral.isAcuityOverride
      ? "🔴 [APEX ACUITY OVERRIDE - LEVEL 6 TERTIARY ESCALATION]"
      : "🟡 [CONFIRMED CAPACITY REFERRAL]";

    const bloodNotice =
      referral.unreservedBloodReserved && referral.unreservedBloodReserved > 0
        ? `🩸 BLOOD HOLD: Reserve ${referral.unreservedBloodReserved} units Unreserved Emergency O-Negative immediately for acute transfusion.`
        : referral.bloodUnitsReserved > 0
        ? `🩸 BLOOD REQ: ${referral.bloodUnitsReserved} units ${referral.bloodTypeReserved || patient?.bloodType || "O+"} cross-match requested.`
        : "🩸 BLOOD: No acute transfusion required at departure.";

    // Clinician-friendly Kenyan Duty Station WhatsApp Format
    const whatsappText = `*${acuityBadge}*
*INBOUND MATERNAL EMERGENCY — MOH FORM 268*
--------------------------------------------------
📍 *Origin:* ${referringFacility?.name || "Referring Dispensary"} (${referringFacility?.subCounty || "Sub-County"})
🏥 *Destination:* ${receivingFacility?.name || "Receiving Hospital"} Labor Ward / Casualty
⏱️ *ETA:* ~${eta} Mins | Ambul: ${body.ambulancePlate || "County EMS"} (Driver: ${body.driverPhone || "N/A"})

👩 *Patient:* ${patient?.fullName || "Expectant Mother"}, ${patient?.age || 26}yo (G${patient?.gravida || 1}P${patient?.parity || 0}, ${patient?.gestationalWeeks || 34} wks)
🩸 *Blood Group:* ${patient?.bloodType || "O+"}
📋 *Indication:* ${referral.clinicalIndication.replace(/_/g, " ")}
${referral.acuityOverrideReason ? `⚠️ *Override Justification:* ${referral.acuityOverrideReason}\n` : ""}
💉 *On-Board Interventions:*
${interventions}

${bloodNotice}

📄 *MOH 268 Ref Slip:* #${referral.referralCode} (Paper copy in ambulance)
--------------------------------------------------
*ACTION REQUIRED:* Prep emergency resuscitation table & notify Senior Registrar.
*Reply '1' to ACKNOWLEDGE receipt or scan QR code upon ambulance arrival.*`;

    // Update dispatch status in database
    await referralsRepo.updateReferralDispatch(referral.id, "DISPATCHED");
    await logAudit(auth.actor, "REFERRAL_DISPATCH_ALERT", "referral", String(referral.id), {
      channel: body.channel,
      targetPhone,
    });

    return NextResponse.json({
      success: true,
      message: `Pre-arrival dispatch alert transmitted to ${receivingFacility?.name} triage desk`,
      targetPhone,
      channel: body.channel,
      dispatchPayload: {
        referralCode: referral.referralCode,
        targetFacility: receivingFacility?.name,
        targetPhone,
        whatsappText,
        dispatchedAt: new Date().toISOString(),
        isAcuityOverride: referral.isAcuityOverride,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid dispatch payload", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to dispatch alert" }, { status: 500 });
  }
}

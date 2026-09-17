import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { handleHIMSAdmissionWebhook } from "@/lib/interoperability/adapters";
import { verifySharedSecretOrSession } from "@/lib/security/webhookAuth";

const payloadSchema = z.object({
  facilityId: z.coerce.number().int(),
  eventType: z.enum(["PATIENT_ADMITTED", "PATIENT_DISCHARGED"]),
  wardType: z.enum(["ICU", "HDU", "MATERNITY"]),
});

/**
 * Delay 3: a hospital's own EHR/HIMS calls this on every admission/discharge
 * so referring clinics see real bed counts without any human re-typing them.
 */
export async function POST(request: NextRequest) {
  if (!(await verifySharedSecretOrSession(request, "HIMS_WEBHOOK_SECRET"))) {
    return NextResponse.json({ error: "Invalid webhook secret" }, { status: 401 });
  }

  try {
    const body = payloadSchema.parse(await request.json());
    const result = await handleHIMSAdmissionWebhook(body);
    return NextResponse.json(result);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid webhook payload", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Invalid webhook payload", details: error?.message }, { status: 400 });
  }
}

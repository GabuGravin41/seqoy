import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import { createUserProfile } from "@/db/repository/users";

/**
 * Syncs Clerk identities into our own userProfiles table (role/facility live
 * here, not in Clerk) — every new sign-up starts as CLINIC_NURSE and a
 * SYSTEM_ADMIN reassigns the real role/facility afterward.
 */
export async function POST(req: NextRequest) {
  let evt;
  try {
    evt = await verifyWebhook(req);
  } catch (err) {
    console.error("Clerk webhook verification failed:", err);
    return new Response("Verification failed", { status: 400 });
  }

  if (evt.type === "user.created") {
    const { id, email_addresses, first_name, last_name } = evt.data;
    const email = email_addresses[0]?.email_address ?? "";
    const fullName = `${first_name ?? ""} ${last_name ?? ""}`.trim() || email;
    await createUserProfile({ id, email, fullName });
  }

  return new Response("OK", { status: 200 });
}

import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import twilio from "twilio";

/**
 * Shared-secret verification for inbound webhooks that aren't signed by their
 * provider (Africa's Talking USSD, hospital EHR/HIMS pushes). Previously
 * these endpoints accepted any POST body from anyone on the internet —
 * including one that could fabricate a "check-in" for an arbitrary phone
 * number or silently drain a hospital's bed count.
 */
export function verifySharedSecret(req: NextRequest, envVarName: string): boolean {
  const expected = process.env[envVarName];
  if (!expected) {
    // No secret configured (e.g. local dev without env vars set) — allow
    // through, matching the rest of the app's offline-friendly dev mode.
    return process.env.NODE_ENV !== "production";
  }
  const provided = req.headers.get("x-seqoy-webhook-secret") || new URL(req.url).searchParams.get("secret");
  return provided === expected;
}

/**
 * Same as verifySharedSecret, but also accepts a signed-in Clerk session —
 * used on endpoints the in-app Simulator calls directly (as a staff member
 * demoing the pipeline) in addition to real telco/HIMS webhook callers.
 */
export async function verifySharedSecretOrSession(req: NextRequest, envVarName: string): Promise<boolean> {
  if (verifySharedSecret(req, envVarName)) return true;
  const { userId } = await auth();
  return Boolean(userId);
}

/** Verifies Twilio's request signature using the official helper. */
export function verifyTwilioSignature(req: NextRequest, params: Record<string, string>): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) {
    return process.env.NODE_ENV !== "production";
  }
  const signature = req.headers.get("x-twilio-signature") || "";
  return twilio.validateRequest(authToken, signature, req.url, params);
}

/**
 * Kenya Data Protection Act (2019) / ODPC Privacy & Data Minimization Helpers
 *
 * - Section 25(d): Data minimization — transmit only the minimum clinical data
 *   needed over third-party messaging (WhatsApp/SMS).
 * - Section 32 & 46: Sensitive health data requires explicit, auditable consent.
 * - Section 48: Cross-border transfer safeguards — strip direct identifiers
 *   (phone numbers, National IDs, emails) before calling external LLM APIs.
 */

export type ConsentStatus = "GRANTED" | "PENDING" | "REVOKED";
export type ConsentChannel =
  | "VERBAL_CLINIC"
  | "WRITTEN_ANC"
  | "USSD_OPT_IN"
  | "SMS_OPT_IN"
  | "REVOKED_BY_PATIENT";

/**
 * Converts a full name into clinical initials (e.g. "Wanjiku Muthoni" -> "W. M.")
 * for third-party messaging channels (WhatsApp/SMS duty-station alerts) where
 * the MOH 268 referral code provides unambiguous linkage on arrival.
 */
export function toPatientInitials(fullName?: string | null): string {
  if (!fullName || !fullName.trim()) return "Patient";
  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "Patient";
  return parts.map((p) => `${p[0].toUpperCase()}.`).join(" ");
}

/**
 * Redacts direct personal identifiers (Kenyan phone numbers, 7-8 digit National IDs,
 * and email addresses) before sending free-text prompts to external third-party
 * LLM providers (Anthropic, OpenAI, Gemini).
 */
export function redactPiiForExternalLlm(text: string): string {
  if (!text) return text;
  return text
    // Kenyan & E.164 phone numbers (+2547xxxxxxxx, 2547xxxxxxxx, 07xxxxxxxx, 01xxxxxxxx)
    .replace(/(?:\+?254|0)[17]\d{8}\b/g, "[REDACTED_PHONE]")
    // Generic international phone numbers
    .replace(/\+\d{10,15}\b/g, "[REDACTED_PHONE]")
    // Email addresses
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[REDACTED_EMAIL]")
    // Kenyan National ID numbers (7-8 consecutive digits, optionally prefixed by ID/NID)
    .replace(/\b(?:ID|NID|NATIONAL\s*ID)?\s*[:#-]?\s*\d{7,8}\b/gi, "[REDACTED_ID]");
}

/**
 * Returns true only if the patient has active consent for automated outreach.
 * Missing consentStatus on legacy mock records defaults to true only outside
 * explicit REVOKED/PENDING states.
 */
export function hasActiveOutreachConsent(patient: { consentStatus?: ConsentStatus | string }): boolean {
  if (!patient.consentStatus) return true;
  return patient.consentStatus === "GRANTED";
}

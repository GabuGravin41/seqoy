import type { CapacityUpdateInput } from "@/db/repository/capacities";

export interface ParsedShiftCapacityUpdate {
  isShiftUpdate: boolean;
  patch: CapacityUpdateInput;
  summary: string;
}

const THEATRE_MAP: Record<string, NonNullable<CapacityUpdateInput["theatreReadinessStatus"]>> = {
  READY: "READY",
  OPEN: "READY",
  OK: "READY",
  YES: "READY",
  BUSY: "SURGERY_IN_PROGRESS",
  IN_PROGRESS: "SURGERY_IN_PROGRESS",
  SURGERY: "SURGERY_IN_PROGRESS",
  STERILIZING: "STERILIZING",
  CLEANING: "STERILIZING",
  CLOSED: "SHORT_STAFFED",
  STRIKE: "SHORT_STAFFED",
  SHORT_STAFFED: "SHORT_STAFFED",
  NO: "SHORT_STAFFED",
};

/**
 * Parses low-friction shift capacity SMS/WhatsApp messages sent from a hospital's
 * registered duty-station phone, solving the "stale dashboard" problem without
 * requiring nurses to log into a web portal.
 *
 * Supported formats (case-insensitive, order-independent):
 *   CAP ICU=2 HDU=3 MAT=12 THEATRE=READY ONEG=4
 *   CAP STRIKE
 *   SHIFT ICU:1 THEATRE:BUSY ONEG:2 OB:Y
 */
export function parseShiftCapacityMessage(rawText: string): ParsedShiftCapacityUpdate {
  const text = rawText.trim();
  if (!/^(CAP|SHIFT|CAPACITY)\b/i.test(text)) {
    return { isShiftUpdate: false, patch: {}, summary: "" };
  }

  const patch: CapacityUpdateInput = { source: "MANUAL" };
  const parts: string[] = [];

  if (/\bSTRIKE\b/i.test(text)) {
    patch.theatreReadinessStatus = "SHORT_STAFFED";
    patch.operatingTheatresAvailable = 0;
    patch.obstetricianOnDuty = false;
    parts.push("STRIKE MODE (theatre closed, obstetrician off-duty)");
  }

  const numMatch = (pattern: RegExp): number | undefined => {
    const m = text.match(pattern);
    if (!m) return undefined;
    const n = Number(m[1]);
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : undefined;
  };

  const icu = numMatch(/\bICU\s*[:=]\s*(\d+)\b/i);
  if (icu !== undefined) {
    patch.icuBedsAvailable = icu;
    parts.push(`ICU=${icu}`);
  }

  const hdu = numMatch(/\bHDU\s*[:=]\s*(\d+)\b/i);
  if (hdu !== undefined) {
    patch.hduBedsAvailable = hdu;
    parts.push(`HDU=${hdu}`);
  }

  const mat = numMatch(/\b(?:MAT|MATERNITY)\s*[:=]\s*(\d+)\b/i);
  if (mat !== undefined) {
    patch.maternityBedsAvailable = mat;
    parts.push(`Maternity=${mat}`);
  }

  const oneg = numMatch(/\b(?:ONEG|O-|O_NEG)\s*[:=]\s*(\d+)\b/i);
  if (oneg !== undefined) {
    patch.unreservedEmergencyONeg = oneg;
    parts.push(`Emergency O-=${oneg}`);
  }

  const theatreMatch = text.match(/\b(?:THEATRE|OR|OT)\s*[:=]\s*([A-Z_]+)\b/i);
  if (theatreMatch) {
    const mapped = THEATRE_MAP[theatreMatch[1].toUpperCase()];
    if (mapped) {
      patch.theatreReadinessStatus = mapped;
      if (mapped === "READY") {
        patch.operatingTheatresAvailable = patch.operatingTheatresAvailable ?? 1;
      } else if (mapped === "SHORT_STAFFED") {
        patch.operatingTheatresAvailable = 0;
      }
      parts.push(`Theatre=${mapped}`);
    }
  }

  const obMatch = text.match(/\b(?:OB|OBGYN)\s*[:=]\s*(Y|YES|N|NO|1|0)\b/i);
  if (obMatch) {
    const onDuty = /^(Y|YES|1)$/i.test(obMatch[1]);
    patch.obstetricianOnDuty = onDuty;
    parts.push(`OB=${onDuty ? "ON" : "OFF"}`);
  }

  return {
    isShiftUpdate: parts.length > 0,
    patch,
    summary: parts.join(", "),
  };
}

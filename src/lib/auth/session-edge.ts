import type { UserRole } from "@/lib/rbac/permissions";

export const SESSION_COOKIE_NAME = "seqoy_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface SessionPayload {
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
  facilityName: string;
  exp: number;
}

function getSessionSecret(): string {
  const secret = process.env.AUTH_SESSION_SECRET;
  if (secret && secret.length >= 16) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SESSION_SECRET must be set (min 16 chars) in production.");
  }
  return "seqoy-local-dev-session-secret-change-me";
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(str: string): Uint8Array {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((str.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function signHmac(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return toBase64Url(new Uint8Array(sig));
}

export async function createSessionToken(
  input: Omit<SessionPayload, "exp">
): Promise<string> {
  const payload: SessionPayload = {
    ...input,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const encoded = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const signature = await signHmac(encoded, getSessionSecret());
  return `${encoded}.${signature}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token || !token.includes(".")) return null;
  const [encoded, providedSig] = token.split(".");
  if (!encoded || !providedSig) return null;

  try {
    const expectedSig = await signHmac(encoded, getSessionSecret());
    if (providedSig.length !== expectedSig.length) return null;
    let diff = 0;
    for (let i = 0; i < providedSig.length; i++) {
      diff |= providedSig.charCodeAt(i) ^ expectedSig.charCodeAt(i);
    }
    if (diff !== 0) return null;

    const json = new TextDecoder().decode(fromBase64Url(encoded));
    const payload = JSON.parse(json) as SessionPayload;
    if (!payload.userId || !payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

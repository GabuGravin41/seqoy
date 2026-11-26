import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import { getUserProfile } from "@/db/repository/users";

/** Returns the signed-in user's own seqoy role/facility profile. */
export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const dbProfile = await getUserProfile(session.userId);
  const profile = dbProfile ?? {
    id: session.userId,
    email: session.email,
    fullName: session.fullName,
    role: session.role,
    facilityName: session.facilityName,
    createdAt: new Date().toISOString(),
  };

  return NextResponse.json({ profile });
}

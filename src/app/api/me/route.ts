import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUserProfile } from "@/db/repository/users";

/** Returns the signed-in user's own SEQOY role/facility profile. */
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const profile = await getUserProfile(userId);
  if (!profile) {
    return NextResponse.json(
      { error: "No SEQOY profile provisioned yet. Ask a system admin to assign your role." },
      { status: 404 }
    );
  }

  return NextResponse.json({ profile });
}

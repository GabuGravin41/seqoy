import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/db/mock-store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const referralOnly = searchParams.get("referralOnly") === "true";
  const county = searchParams.get("county");

  let list = mockStore.facilities;

  if (referralOnly) {
    list = list.filter((f) => f.isReferralCenter);
  }

  if (county) {
    list = list.filter((f) => f.county.toLowerCase() === county.toLowerCase());
  }

  return NextResponse.json({
    total: list.length,
    facilities: list,
  });
}

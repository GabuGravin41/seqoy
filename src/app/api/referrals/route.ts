import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/db/mock-store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const patientId = searchParams.get("patientId");

  let list = mockStore.referrals;

  if (status) {
    list = list.filter((r) => r.status === status.toUpperCase());
  }

  if (patientId) {
    list = list.filter((r) => r.patientId === Number(patientId));
  }

  return NextResponse.json({
    total: list.length,
    referrals: list,
  });
}

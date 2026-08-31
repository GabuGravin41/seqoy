import { NextRequest, NextResponse } from "next/server";
import { evaluateClinicalRisk, TriageInput } from "@/lib/clinical/risk-scorer";

export async function POST(req: NextRequest) {
  try {
    const input: TriageInput = await req.json();
    const result = evaluateClinicalRisk(input);

    return NextResponse.json({
      success: true,
      triage: result,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Invalid triage payload" }, { status: 400 });
  }
}

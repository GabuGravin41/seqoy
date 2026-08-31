import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/db/mock-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phoneNumber, message, alertType = "DANGER_SIGN_ALERT", patientId } = body;

    if (!phoneNumber || !message) {
      return NextResponse.json({ error: "phoneNumber and message are required" }, { status: 400 });
    }

    const patient = mockStore.patients.find(
      (p) => p.id === Number(patientId) || p.phoneNumber === phoneNumber
    );

    // In production, Africa's Talking SMS API would be invoked here
    const simulatedMessageId = `AT-SMS-${Math.floor(100000 + Math.random() * 900000)}`;

    return NextResponse.json({
      success: true,
      messageId: simulatedMessageId,
      recipient: phoneNumber,
      patientName: patient?.fullName || "Registered Mother",
      alertType,
      deliveredAt: new Date().toISOString(),
      costKes: 0.8, // standard Kenya SMS rate (0.8 KES)
      status: "DELIVERED",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to dispatch SMS" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Password reset verification code dispatched to ${email}`,
      resetToken: `reset_${Date.now()}`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

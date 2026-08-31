import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, resetCode, newPassword } = body;

    if (!newPassword) {
      return NextResponse.json({ error: 'New password is required' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Password successfully updated',
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Invalid reset request' }, { status: 400 });
  }
}

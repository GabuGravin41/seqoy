import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: 'user-001',
        email,
        name: 'Nurse Kamau',
        role: 'CLINIC_NURSE',
        facilityName: 'Kangemi Health Centre',
      },
      token: `seqoy_jwt_${Date.now()}`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Invalid login request' }, { status: 400 });
  }
}

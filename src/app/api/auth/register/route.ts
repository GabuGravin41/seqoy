import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, role, facilityName, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: `user-${Date.now()}`,
        name,
        email,
        role: role || 'CLINIC_NURSE',
        facilityName: facilityName || 'Primary Health Centre',
      },
      token: `seqoy_jwt_${Date.now()}`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Invalid registration request' }, { status: 400 });
  }
}

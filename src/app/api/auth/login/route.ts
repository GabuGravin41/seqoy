import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  SESSION_COOKIE_NAME,
  createSessionToken,
  getPilotStaffAccounts,
} from "@/lib/auth/session";
import { createUserProfile, getUserProfile } from "@/db/repository/users";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = loginSchema.parse(await req.json());
    const email = body.email.trim().toLowerCase();

    const adminPassword = process.env.AUTH_ADMIN_PASSWORD || "seqoy2026!";
    const staffPassword = process.env.AUTH_STAFF_PASSWORD || adminPassword;

    const accounts = getPilotStaffAccounts();
    const account = accounts.find((a) => a.email === email);

    if (!account) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const expectedPassword = account.role === "SYSTEM_ADMIN" ? adminPassword : staffPassword;
    if (body.password !== expectedPassword) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Ensure profile row exists in DB / memory so RBAC & /api/me always resolve cleanly
    let profile = await getUserProfile(account.id);
    if (!profile) {
      profile = await createUserProfile({
        id: account.id,
        email: account.email,
        fullName: account.fullName,
        role: account.role,
      });
    }

    const token = await createSessionToken({
      userId: profile.id,
      email: profile.email,
      fullName: profile.fullName,
      role: profile.role,
      facilityName: profile.facilityName || account.facilityName,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: profile.id,
        email: profile.email,
        fullName: profile.fullName,
        role: profile.role,
        facilityName: profile.facilityName || account.facilityName,
      },
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Enter a valid email and password" }, { status: 400 });
    }
    return NextResponse.json({ error: error?.message || "Login failed" }, { status: 500 });
  }
}

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Public: the marketing landing page, Clerk's own auth pages, and inbound
// telephony/webhook endpoints (those verify a shared secret or provider
// signature instead of a Clerk session — see src/lib/telephony/webhookAuth.ts).
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/telephony/(.*)",
  "/api/webhooks/(.*)",
  "/api/cron/(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};

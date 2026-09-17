import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Register a Health Worker Account</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            An administrator assigns your clinical role after your account is created.
          </p>
        </div>
        <SignUp />
      </div>
    </div>
  );
}

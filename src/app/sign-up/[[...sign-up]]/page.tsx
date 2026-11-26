import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-white font-manrope text-navy flex items-center justify-center px-6">
      <div className="max-w-md w-full space-y-5">
        <Link href="/" aria-label="seqoy home" className="inline-flex items-center gap-2.5">
          <img
            src="/brand/seqoy-logo-primary-transparent.png"
            alt="seqoy"
            className="h-9 w-auto object-contain select-none"
          />
          <span className="pt-1 text-[22px] font-semibold leading-none tracking-[-0.02em] text-navy">
            seqoy
          </span>
        </Link>

        <h1 className="text-2xl font-extrabold tracking-tight text-navy">
          Staff accounts are provisioned by your admin
        </h1>
        <p className="text-sm leading-relaxed text-navy-muted">
          During Phase 1 pilot testing, clinical accounts are managed manually without self-registration. Sign in with
          your assigned staff email and password.
        </p>

        <Link
          href="/sign-in"
          className="inline-flex items-center rounded-md bg-crimson px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy"
        >
          Go to Sign In →
        </Link>
      </div>
    </div>
  );
}

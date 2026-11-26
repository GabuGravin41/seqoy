'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

/**
 * Official seqoy horizontal lockup following BRAND_GUIDELINES.md:
 * - Lowercase wordmark ("seqoy"), SemiBold, -0.02em tracking
 * - Optically centered to the heart body
 * - Switches cleanly to dark-mode variant on dark slate/navy surfaces
 */
function SeqoyWordmark({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" aria-label="seqoy home" className="inline-flex items-center gap-2.5">
      <img
        src={light ? '/brand/seqoy-logo-dark-transparent.png' : '/brand/seqoy-logo-primary-transparent.png'}
        alt="seqoy"
        className="h-9 w-auto object-contain select-none"
      />
      <span
        className={`pt-1 text-[22px] font-semibold leading-none tracking-[-0.02em] ${
          light ? 'text-white' : 'text-navy'
        }`}
      >
        seqoy
      </span>
    </Link>
  );
}

/**
 * Original seqoy Maternal Lifeline visual:
 * A calm clinical pulse waveform transitioning from Pulse Crimson (#A61C26)
 * to Deep Navy (#1F274B) — directly echoing the logo's ECG DNA.
 */
function MaternalLifelineGraphic() {
  const wavePath =
    'M 12 130 L 82 130 L 100 130 L 114 96 L 130 162 L 146 66 L 164 152 L 178 130 L 250 130 L 268 112 L 284 146 L 298 92 L 314 140 L 328 130 L 428 130';

  return (
    <div className="relative mx-auto w-full max-w-[460px] select-none" aria-hidden>
      <svg viewBox="0 0 440 240" className="h-auto w-full overflow-visible">
        <defs>
          <linearGradient id="seqoyLifelineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#A61C26" />
            <stop offset="52%" stopColor="#A61C26" />
            <stop offset="68%" stopColor="#1F274B" />
            <stop offset="100%" stopColor="#1F274B" />
          </linearGradient>
        </defs>

        {/* Quiet clinical baseline gridlines */}
        <line x1="12" y1="66" x2="428" y2="66" stroke="#1F274B" strokeOpacity="0.07" strokeWidth="1" />
        <line x1="12" y1="130" x2="428" y2="130" stroke="#1F274B" strokeOpacity="0.1" strokeWidth="1" />
        <line x1="12" y1="194" x2="428" y2="194" stroke="#1F274B" strokeOpacity="0.07" strokeWidth="1" />

        {/* Static ghost waveform */}
        <path
          d={wavePath}
          fill="none"
          stroke="url(#seqoyLifelineGrad)"
          strokeOpacity="0.18"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Subtle travelling pulse */}
        <path
          d={wavePath}
          fill="none"
          stroke="url(#seqoyLifelineGrad)"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="130 390"
          className="animate-pulse-travel"
        />

        {/* Three quiet clinical checkpoints */}
        <line x1="48" y1="130" x2="48" y2="206" stroke="#A61C26" strokeOpacity="0.28" strokeWidth="1" />
        <circle cx="48" cy="130" r="4.5" fill="#A61C26" />
        <text x="48" y="222" textAnchor="middle" fill="#1F274B" fontSize="10" fontWeight="700" letterSpacing="0.08em">
          SMS CHECK-IN
        </text>

        <line x1="214" y1="130" x2="214" y2="206" stroke="#1F274B" strokeOpacity="0.2" strokeWidth="1" />
        <circle cx="214" cy="130" r="4.5" fill="#FFFFFF" stroke="#A61C26" strokeWidth="2" />
        <text x="214" y="222" textAnchor="middle" fill="#1F274B" fontSize="10" fontWeight="700" letterSpacing="0.08em">
          TRIAGE SCORED
        </text>

        <line x1="382" y1="130" x2="382" y2="206" stroke="#1F274B" strokeOpacity="0.32" strokeWidth="1" />
        <circle cx="382" cy="130" r="5" fill="#1F274B" />
        <text x="382" y="222" textAnchor="middle" fill="#1F274B" fontSize="10" fontWeight="700" letterSpacing="0.08em">
          HOSPITAL READY
        </text>

        {/* Quiet top-left / top-right clinical tags */}
        <text x="12" y="34" fill="#A61C26" fontSize="10" fontWeight="700" letterSpacing="0.14em">
          DELAY 1 · EARLY WARNING
        </text>
        <text x="428" y="34" textAnchor="end" fill="#1F274B" fontSize="10" fontWeight="700" letterSpacing="0.14em">
          DELAY 3 · VERIFIED CAPACITY
        </text>
      </svg>
    </div>
  );
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white font-manrope text-black antialiased selection:bg-scarlet selection:text-white">
      {/* Scroll-aware fixed navigation */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'border-b border-black/5 bg-white/85 py-4 backdrop-blur-md'
            : 'bg-transparent py-6'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 md:px-12 lg:px-16">
          <SeqoyWordmark />

          <nav className="hidden items-center gap-9 text-sm font-medium text-black/70 md:flex">
            <a href="#how" className="transition hover:text-black">
              How It Works
            </a>
            <a href="#progress" className="transition hover:text-black">
              Progress
            </a>
            <a href="#trust" className="transition hover:text-black">
              Compliance
            </a>
            <Link href="/v1" className="text-black/45 transition hover:text-black">
              Compare v1
            </Link>
          </nav>

          <div className="flex items-center gap-5">
            <Link
              href="/capacity"
              className="hidden text-sm font-medium text-black/75 transition hover:text-black sm:inline"
            >
              Clinical Portal
            </Link>
            <a
              href="#partner"
              className="rounded-md bg-scarlet px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-jungle"
            >
              Book Pilot Call
            </a>
          </div>
        </div>
      </header>

      <main>
        {/* Hero — 2-column open split on crisp white */}
        <section className="mx-auto max-w-7xl px-6 pt-32 pb-16 md:px-12 md:pt-40 md:pb-24 lg:px-16">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <h1 className="text-4xl font-extrabold leading-[1.1] tracking-[-0.025em] text-black sm:text-5xl lg:text-[3.75rem]">
                Maternal Readiness{' '}
                <span className="text-scarlet underline decoration-2 underline-offset-[6px]">
                  Before Transfer
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-black/65 md:text-lg">
                SMS early warning for expectant mothers and live hospital bed, theatre, and O-negative blood visibility
                for clinics across Kenya.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-4">
                <a
                  href="#partner"
                  className="rounded-md bg-scarlet px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-jungle"
                >
                  Partner for Phase 1 Pilot
                </a>
                <Link
                  href="/capacity"
                  className="rounded-md border border-black/15 px-6 py-3 text-sm font-semibold text-black transition-all duration-300 hover:-translate-y-0.5 hover:border-black"
                >
                  Open Clinical Portal →
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <MaternalLifelineGraphic />
            </div>
          </div>

          {/* Grounded ecosystem strip */}
          <div className="mt-16 flex flex-wrap items-center justify-between gap-6 border-t border-black/10 pt-8">
            <span className="text-[11px] font-bold tracking-[0.2em] text-black/45 uppercase">
              Built for Kenya’s Referral Chain
            </span>
            <div className="flex flex-wrap items-center gap-x-10 gap-y-3 text-sm font-bold tracking-tight text-black/65">
              <span>SMS &amp; USSD</span>
              <span>MOH 268 Paper Slip</span>
              <span>KenyaEMR FHIR R4</span>
              <span>CHAK / KCCB Ready</span>
              <span>ODPC Compliant</span>
            </div>
          </div>
        </section>

        {/* Full-Bleed Scarlet Anchor Band — Clean Editorial Ledger */}
        <section className="bg-scarlet text-white">
          <div className="mx-auto max-w-7xl px-6 py-20 md:px-12 md:py-28 lg:px-16">
            <div className="grid items-start gap-12 lg:grid-cols-12">
              <div className="lg:col-span-6">
                <p className="text-[11px] font-bold tracking-[0.2em] text-white/70 uppercase">
                  THE NETWORK
                </p>
                <h2 className="mt-4 text-3xl font-extrabold leading-[1.12] tracking-[-0.025em] sm:text-4xl lg:text-5xl">
                  Zero blind referrals.
                </h2>
                <p className="mt-5 max-w-lg text-base leading-relaxed text-white/85">
                  Clinics stop sending critically ill mothers to full wards or closed theatres. Every referral checks
                  live capacity first — and stays resilient when strikes or power outages hit.
                </p>
                <div className="mt-8">
                  <Link
                    href="/capacity"
                    className="inline-flex items-center rounded-md bg-white px-5 py-3 text-sm font-semibold text-scarlet transition-all duration-300 hover:-translate-y-0.5 hover:bg-jungle hover:text-white"
                  >
                    Inspect Live Readiness Board →
                  </Link>
                </div>
              </div>

              <div className="divide-y divide-white/20 lg:col-span-6 lg:pt-4">
                <div className="pb-6">
                  <p className="text-[11px] font-bold tracking-[0.18em] text-white/65 uppercase">Before Transfer</p>
                  <p className="mt-2 text-lg font-bold text-white">
                    Live ICU, theatre, and unreserved O-negative blood checked first.
                  </p>
                </div>
                <div className="py-6">
                  <p className="text-[11px] font-bold tracking-[0.18em] text-white/65 uppercase">During Public Strikes</p>
                  <p className="mt-2 text-lg font-bold text-white">
                    Automatic routing to ready CHAK &amp; KCCB mission hospitals under SHA.
                  </p>
                </div>
                <div className="pt-6">
                  <p className="text-[11px] font-bold tracking-[0.18em] text-white/65 uppercase">When Power Drops</p>
                  <p className="mt-2 text-lg font-bold text-white">
                    One-click printable MOH 268 referral slip travels with the mother.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works — Borderless 01 / 02 / 03 Grid */}
        <section id="how" className="mx-auto max-w-7xl px-6 py-20 md:px-12 md:py-28 lg:px-16">
          <h2 className="text-3xl font-extrabold tracking-[-0.025em] text-black sm:text-4xl lg:text-5xl">
            How <span className="text-scarlet">SEQOY</span> Works on the Ground
          </h2>

          <div className="mt-14 grid gap-12 md:grid-cols-3">
            <div className="border-t-2 border-scarlet pt-6">
              <span className="text-xs font-extrabold tracking-widest text-scarlet">01</span>
              <h3 className="mt-4 text-xl font-extrabold tracking-tight text-black">
                SMS &amp; Midwife Outreach
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-black/60 md:text-[15px]">
                Scheduled Swahili and English SMS check-ins plus 30-second SIM calls from local midwives catch
                preeclampsia, bleeding, and sepsis early on any basic phone.
              </p>
              {/* Minimalist SMS signal SVG */}
              <svg viewBox="0 0 220 44" className="mt-8 h-10 w-48" aria-hidden>
                <circle cx="14" cy="22" r="4" fill="#A61C26" className="pulse-dot" />
                <path d="M26 14 A12 12 0 0 1 26 30" fill="none" stroke="#A61C26" strokeWidth="1.5" />
                <path d="M34 8 A20 20 0 0 1 34 36" fill="none" stroke="#1F274B" strokeOpacity="0.55" strokeWidth="1.5" />
                <line x1="50" y1="22" x2="205" y2="22" stroke="#1F274B" strokeOpacity="0.16" strokeWidth="1" strokeDasharray="3 4" />
              </svg>
            </div>

            <div className="border-t-2 border-navy pt-6">
              <span className="text-xs font-extrabold tracking-widest text-navy">02</span>
              <h3 className="mt-4 text-xl font-extrabold tracking-tight text-black">
                5-Second Hospital Shift SMS
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-black/60 md:text-[15px]">
                Bed and blood-bank staff text live ICU, theatre, and emergency O-negative counts from their duty phone
                — no web login needed. Stale counts (&gt;24h) are flagged automatically.
              </p>
              {/* Minimalist freshness bars SVG */}
              <svg viewBox="0 0 220 44" className="mt-8 h-10 w-48" aria-hidden>
                <rect x="6" y="18" width="24" height="6" rx="3" fill="#1F274B" />
                <rect x="38" y="18" width="24" height="6" rx="3" fill="#1F274B" fillOpacity="0.72" />
                <rect x="70" y="18" width="24" height="6" rx="3" fill="#1F274B" fillOpacity="0.38" />
                <rect x="102" y="18" width="24" height="6" rx="3" fill="#A61C26" fillOpacity="0.4" />
                <line x1="138" y1="21" x2="205" y2="21" stroke="#1F274B" strokeOpacity="0.16" strokeWidth="1" />
              </svg>
            </div>

            <div className="border-t-2 border-black pt-6">
              <span className="text-xs font-extrabold tracking-widest text-black">03</span>
              <h3 className="mt-4 text-xl font-extrabold tracking-tight text-black">
                Verified Route &amp; MOH 268
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-black/60 md:text-[15px]">
                Referring clinics match to a capable county or mission hospital, print a 1-click MOH 268 slip for the
                mother, and sync structured records to KenyaEMR via FHIR R4.
              </p>
              {/* Minimalist verified route SVG */}
              <svg viewBox="0 0 220 44" className="mt-8 h-10 w-48" aria-hidden>
                <circle cx="14" cy="22" r="4" fill="#A61C26" />
                <line x1="18" y1="22" x2="96" y2="22" stroke="#1F274B" strokeWidth="1.4" />
                <circle cx="104" cy="22" r="6" fill="none" stroke="#1F274B" strokeWidth="2" />
                <circle cx="104" cy="22" r="2.5" fill="#1F274B" className="pulse-dot" />
                <line x1="110" y1="22" x2="205" y2="22" stroke="#1F274B" strokeOpacity="0.16" strokeWidth="1" />
              </svg>
            </div>
          </div>
        </section>

        {/* Progress — Open 3-Column Layout with Crisp Vertical Dividers */}
        <section id="progress" className="border-t border-black/10">
          <div className="mx-auto max-w-7xl px-6 py-20 md:px-12 md:py-28 lg:px-16">
            <h2 className="text-3xl font-extrabold tracking-[-0.025em] text-black sm:text-4xl lg:text-5xl">
              Where We Are <span className="text-jungle">Today</span>
            </h2>

            <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-0 md:divide-x md:divide-black/10">
              <div className="md:pr-10">
                <p className="text-[11px] font-bold tracking-[0.2em] text-jungle uppercase">01 · Built</p>
                <h3 className="mt-3 text-xl font-extrabold tracking-tight text-black">
                  Core Engine Verified
                </h3>
                <ul className="mt-4 space-y-2.5 text-sm text-black/60">
                  <li>Deterministic WHO danger-sign scoring</li>
                  <li>SMS check-ins, USSD &amp; duty-station shift parser</li>
                  <li>MOH 268 slip, KenyaEMR FHIR &amp; ODPC consent</li>
                </ul>
              </div>

              <div className="md:px-10">
                <p className="text-[11px] font-bold tracking-[0.2em] text-scarlet uppercase">02 · Now</p>
                <h3 className="mt-3 text-xl font-extrabold tracking-tight text-black">
                  Phase 1 Kenya Pilot
                </h3>
                <ul className="mt-4 space-y-2.5 text-sm text-black/60">
                  <li>1 referral hospital + 5 feeder dispensaries</li>
                  <li>Field validation with frontline midwives on SMS</li>
                  <li>ODPC processor registration &amp; local data residency</li>
                </ul>
              </div>

              <div className="md:pl-10">
                <p className="text-[11px] font-bold tracking-[0.2em] text-black/45 uppercase">03 · Next</p>
                <h3 className="mt-3 text-xl font-extrabold tracking-tight text-black">
                  County Scale &amp; Phase 2
                </h3>
                <ul className="mt-4 space-y-2.5 text-sm text-black/60">
                  <li>Multi-county &amp; CHAK/KCCB mission network rollout</li>
                  <li>Digital Health Agency (DHA) / HIE integration</li>
                  <li>WhatsApp channel added after SMS is proven</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Compliance & Trust — 4-Column Open Grid */}
        <section id="trust" className="border-t border-black/10 bg-[#FAFAF9]">
          <div className="mx-auto max-w-7xl px-6 py-20 md:px-12 md:py-24 lg:px-16">
            <h2 className="text-2xl font-extrabold tracking-[-0.025em] text-black sm:text-3xl">
              Built for Kenya’s Health Governance
            </h2>

            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-sm font-extrabold text-black">Kenya ODPC (2019)</p>
                <p className="mt-2 text-sm leading-relaxed text-black/55">
                  Explicit patient consent tracking, automated opt-out enforcement, and minimized PII on external alerts.
                </p>
              </div>
              <div>
                <p className="text-sm font-extrabold text-black">Digital Health Act (2023)</p>
                <p className="mt-2 text-sm leading-relaxed text-black/55">
                  Complements eCHIS and KenyaEMR with standards-based HL7 FHIR R4 bundles and KMFL codes.
                </p>
              </div>
              <div>
                <p className="text-sm font-extrabold text-black">Server-Side RBAC</p>
                <p className="mt-2 text-sm leading-relaxed text-black/55">
                  Six clinical roles with immutable audit logs across every patient record, referral, and FHIR export.
                </p>
              </div>
              <div>
                <p className="text-sm font-extrabold text-black">Honest Scope</p>
                <p className="mt-2 text-sm leading-relaxed text-black/55">
                  Delay 1 and Delay 3 only. Transport stays with county EMS — zero fabricated metrics.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Partner CTA — Clean Dull Jungle Green Anchor */}
        <section id="partner" className="bg-jungle text-white">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-6 py-20 md:flex-row md:items-center md:px-12 lg:px-16">
            <div className="max-w-2xl">
              <p className="text-[11px] font-bold tracking-[0.2em] text-white/65 uppercase">
                PHASE 1 PILOT PARTNERS
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.025em] sm:text-4xl">
                Ready to pilot SEQOY at your hospital or county?
              </h2>
              <p className="mt-3 text-base text-white/80">
                We are onboarding our first referral hospital and five feeder clinics in Kenya.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="mailto:dalton@seqoy.health?subject=SEQOY%20Phase%201%20Pilot"
                className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-jungle transition-all duration-300 hover:-translate-y-0.5 hover:bg-scarlet hover:text-white"
              >
                dalton@seqoy.health
              </a>
              <Link
                href="/capacity"
                className="rounded-md border border-white/25 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-white"
              >
                Open Portal
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Deep Slate Footer (#111828 per seqoy Brand Guidelines) */}
      <footer className="bg-navy-deep text-white">
        <div className="mx-auto max-w-7xl px-6 py-14 md:px-12 lg:px-16">
          <div className="flex flex-col justify-between gap-10 md:flex-row">
            <div className="max-w-xs">
              <SeqoyWordmark light />
              <p className="mt-3 text-sm leading-relaxed text-white/55">
                SMS early warning and live hospital readiness for maternal care in Kenya.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-3">
              <div>
                <p className="text-[11px] font-bold tracking-[0.2em] text-white/45 uppercase">Platform</p>
                <ul className="mt-3 space-y-2 text-white/75">
                  <li><Link href="/capacity" className="hover:text-white">Hospital Readiness</Link></li>
                  <li><Link href="/mothers" className="hover:text-white">Expectant Mothers</Link></li>
                  <li><Link href="/surveillance" className="hover:text-white">MPDSR Audit</Link></li>
                </ul>
              </div>
              <div>
                <p className="text-[11px] font-bold tracking-[0.2em] text-white/45 uppercase">Standards</p>
                <ul className="mt-3 space-y-2 text-white/75">
                  <li><Link href="/integrations" className="hover:text-white">KenyaEMR / FHIR</Link></li>
                  <li><a href="#trust" className="hover:text-white">ODPC Compliance</a></li>
                  <li><Link href="/v1" className="hover:text-white">Compare v1</Link></li>
                </ul>
              </div>
              <div>
                <p className="text-[11px] font-bold tracking-[0.2em] text-white/45 uppercase">Contact</p>
                <ul className="mt-3 space-y-2 text-white/75">
                  <li><a href="mailto:dalton@seqoy.health" className="hover:text-white">dalton@seqoy.health</a></li>
                  <li className="text-white/50">Nairobi, Kenya</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/45 sm:flex-row sm:items-center">
            <p>© {new Date().getFullYear()} SEQOY. Built for maternal healthcare equity in Kenya.</p>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="font-semibold text-white/70 transition hover:text-scarlet"
            >
              Back to top ↑
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

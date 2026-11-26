'use client';

import React from 'react';
import Link from 'next/link';

/**
 * Logo slot — when your custom logo is ready, save it to `public/logo.svg` (or `.png`)
 * and replace the mark below with:
 *   <img src="/logo.svg" alt="SEQOY" className="h-8 w-auto" />
 */
function SeqoyMark({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-3">
      <span
        className={`size-2.5 rounded-full ${light ? 'bg-white' : 'bg-scarlet'}`}
        aria-hidden
      />
      <span
        className={`font-display text-xl font-semibold tracking-tight ${
          light ? 'text-white' : 'text-ink'
        }`}
      >
        SEQOY
      </span>
    </Link>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-ink antialiased selection:bg-scarlet selection:text-white">
      {/* Minimal Header */}
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-8">
        <SeqoyMark />

        <nav className="hidden items-center gap-10 text-sm text-ink-soft sm:flex">
          <a href="#work" className="transition hover:text-ink">
            Our Work
          </a>
          <a href="#progress" className="transition hover:text-ink">
            Progress
          </a>
          <a href="#contact" className="transition hover:text-ink">
            Partner
          </a>
        </nav>

        <Link
          href="/capacity"
          className="text-sm font-medium text-scarlet underline decoration-scarlet/30 underline-offset-4 transition hover:decoration-scarlet"
        >
          Clinical Portal →
        </Link>
      </header>

      {/* Hero — Pure White, Human, Uncluttered */}
      <main>
        <section className="mx-auto max-w-5xl px-6 pt-14 pb-24 sm:pt-24 sm:pb-32">
          <p className="text-xs font-medium tracking-[0.18em] text-jungle uppercase">
            Maternal Care · Kenya
          </p>

          <h1 className="mt-6 max-w-4xl font-display text-5xl font-normal leading-[1.05] tracking-tight text-ink sm:text-6xl md:text-[4.25rem]">
            No mother should arrive at a hospital that cannot save her.
          </h1>

          <p className="mt-8 max-w-xl text-lg leading-relaxed text-ink-soft">
            SEQOY connects expectant mothers, rural midwives, and referral hospitals using simple SMS and direct phone
            calls — catching danger signs early and confirming beds, theatre, and blood before transfer.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-6">
            <a
              href="#contact"
              className="rounded-full bg-scarlet px-7 py-3.5 text-sm font-medium text-white transition hover:bg-scarlet-deep"
            >
              Partner With Us
            </a>
            <a
              href="#progress"
              className="text-sm font-medium text-ink transition hover:text-scarlet"
            >
              See where we are →
            </a>
          </div>

          {/* Quiet Editorial Strip */}
          <div className="mt-20 grid gap-8 border-t border-ink/10 pt-10 sm:grid-cols-3">
            <div>
              <p className="font-display text-2xl text-scarlet">SMS First</p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                Works on every basic phone. No smartphones or data bundles required.
              </p>
            </div>
            <div>
              <p className="font-display text-2xl text-jungle">Live Readiness</p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                Clinics check real ICU beds, theatre status, and O-negative blood before referring.
              </p>
            </div>
            <div>
              <p className="font-display text-2xl text-ink">Paper Fallback</p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                One-click MOH 268 referral slip so care never stops when power or internet drops.
              </p>
            </div>
          </div>
        </section>

        {/* Full-Bleed Scarlet Statement */}
        <section className="bg-scarlet text-white">
          <div className="mx-auto max-w-5xl px-6 py-20 sm:py-28">
            <p className="max-w-3xl font-display text-3xl font-normal leading-[1.2] tracking-tight sm:text-4xl md:text-[2.65rem]">
              Not another app for exhausted nurses to learn. Just a phone call, a short SMS, and a hospital that is
              ready when she arrives.
            </p>
          </div>
        </section>

        {/* Our Work — Quiet Editorial Split */}
        <section id="work" className="bg-canvas">
          <div className="mx-auto max-w-5xl px-6 py-24 sm:py-32">
            <div className="grid gap-14 md:grid-cols-12">
              <div className="md:col-span-5">
                <p className="text-xs font-medium tracking-[0.18em] text-scarlet uppercase">What We Focus On</p>
                <h2 className="mt-4 font-display text-3xl font-normal leading-tight text-ink sm:text-4xl">
                  Two delays we can end.
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-ink-soft">
                  We intentionally leave ambulance transport to county EMS and focus strictly on early warning and
                  hospital readiness.
                </p>
              </div>

              <div className="divide-y divide-ink/10 md:col-span-7">
                <div className="pb-10">
                  <span className="font-display text-sm text-scarlet">01</span>
                  <h3 className="mt-2 font-display text-2xl font-normal text-ink">
                    Reaching mothers before emergencies escalate
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-ink-soft">
                    Two-way SMS check-ins in Swahili and English — backed by direct phone calls from local midwives and
                    CHPs — surface severe headaches, blurred vision, swelling, or bleeding early enough to act.
                  </p>
                </div>

                <div className="pt-10">
                  <span className="font-display text-sm text-jungle">02</span>
                  <h3 className="mt-2 font-display text-2xl font-normal text-ink">
                    Ending blind referrals between clinics and hospitals
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-ink-soft">
                    Hospital staff update bed, theatre, and blood availability in seconds via SMS. When a public
                    hospital is full or disrupted by a strike, clinics immediately see ready county or faith-based
                    mission hospitals nearby.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Progress — Calm, Honest, Non-Robotic */}
        <section id="progress" className="bg-white">
          <div className="mx-auto max-w-5xl px-6 py-24 sm:py-32">
            <p className="text-xs font-medium tracking-[0.18em] text-jungle uppercase">Progress</p>
            <h2 className="mt-4 max-w-xl font-display text-3xl font-normal leading-tight text-ink sm:text-4xl">
              Where we are today.
            </h2>

            <div className="mt-14 grid gap-12 border-t border-ink/10 pt-10 md:grid-cols-3">
              <div>
                <p className="text-xs font-semibold tracking-wider text-jungle uppercase">Built</p>
                <h3 className="mt-3 font-display text-xl text-ink">Core Platform Ready</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                  Clinical risk triage, SMS check-ins, duty-station shift updates, MOH 268 referral slips, KenyaEMR
                  compatibility, and Kenya ODPC privacy safeguards are built and tested.
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold tracking-wider text-scarlet uppercase">Now</p>
                <h3 className="mt-3 font-display text-xl text-ink">Phase 1 Kenya Pilot</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                  Partnering with one referral hospital and five feeder clinics to validate the SMS workflow with real
                  midwives on the ground.
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold tracking-wider text-ink-soft uppercase">Next</p>
                <h3 className="mt-3 font-display text-xl text-ink">County Scale &amp; Phase 2</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                  Expanding across county and mission hospital networks, aligning with Kenya’s Digital Health Agency,
                  and adding WhatsApp once SMS is proven.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Closing Invitation — Dull Jungle Green */}
        <section id="contact" className="bg-jungle text-white">
          <div className="mx-auto max-w-5xl px-6 py-24 sm:py-28">
            <div className="max-w-2xl">
              <p className="text-xs font-medium tracking-[0.18em] text-white/65 uppercase">Join the First Pilot</p>
              <h2 className="mt-4 font-display text-3xl font-normal leading-tight sm:text-4xl">
                We are looking for our first hospital and clinic partners in Kenya.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-white/80">
                If you run a mission hospital, a county maternity unit, or support maternal health in Kenya, we would
                like to talk.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-6">
                <a
                  href="mailto:dalton@seqoy.health?subject=SEQOY%20Pilot%20Conversation"
                  className="rounded-full bg-white px-7 py-3.5 text-sm font-medium text-jungle transition hover:bg-scarlet hover:text-white"
                >
                  dalton@seqoy.health
                </a>
                <Link
                  href="/capacity"
                  className="text-sm font-medium text-white/85 underline decoration-white/30 underline-offset-4 transition hover:text-white"
                >
                  View clinical portal →
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Footer */}
      <footer className="bg-jungle-deep text-white/70">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-4 px-6 py-8 text-xs sm:flex-row sm:items-center">
          <SeqoyMark light />
          <p>© {new Date().getFullYear()} SEQOY · Maternal Health, Kenya.</p>
        </div>
      </footer>
    </div>
  );
}

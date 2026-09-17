'use client';

import React from 'react';
import Link from 'next/link';

const delays = [
  {
    n: '01',
    bg: 'bg-lilac/70',
    chip: 'text-brand',
    title: 'The Decision to Seek Care',
    body: 'Early danger signs — puffy face, severe headache, spot bleeding — are dismissed until seizures or shock begin. SEQOY reaches every enrolled mother first: an automatic call every 2 weeks (her choice of day and time), plus a weekly WhatsApp or SMS check-in — whichever she actually has.',
    solved: true,
  },
  {
    n: '02',
    bg: 'bg-mint/70',
    chip: 'text-emerald-soft',
    title: 'Reaching the Facility',
    body: "Transport and ambulance coordination is a real problem — and a different one, owned by EMS and county transport systems. SEQOY doesn't touch it, by design: we focus where software actually moves the needle.",
    solved: false,
  },
  {
    n: '03',
    bg: 'bg-peach/70',
    chip: 'text-rose-soft',
    title: 'Receiving Quality Care',
    body: "Clinics stop referring blind. Before a referral is sent, the receiving hospital's own live bed, theatre, and blood numbers are checked — synced automatically from their EHR, or updated in 10 seconds by hand if they don't have one yet.",
    solved: true,
  },
];

const cadres = [
  {
    title: 'Clinic Midwives',
    body: 'Enrol mothers, set their check-in schedule, and review danger-sign check-ins as they come in.',
    href: '/patient-risk-monitoring',
  },
  {
    title: 'Bed & Theatre Managers',
    body: 'Keep live ICU/HDU and theatre readiness accurate — automatically via EHR webhook, or with a 10-second manual update.',
    href: '/capacity',
  },
  {
    title: 'Community Health Promoters',
    body: 'Follow up mothers who missed a scheduled check-in and help them pick a call time that actually works.',
    href: '/mothers',
  },
  {
    title: 'Blood Bank Officers',
    body: 'Region-wide O-negative and critical-stock visibility to prevent blind transfusion shortages.',
    href: '/capacity',
  },
  {
    title: 'County Directors',
    body: 'Automated MoH 711 & 105 maternal mortality audits, scoped to the two delays this network actually moves.',
    href: '/surveillance',
  },
];

const trustStats = [
  { value: '2', label: 'Channels reach every mother — call + WhatsApp/SMS', bg: 'bg-lilac/70', color: 'text-brand' },
  { value: '0', label: 'New systems for clinics to type into', bg: 'bg-mint/70', color: 'text-emerald-soft' },
  { value: '14d', label: 'Default call cadence, fully adjustable per mother', bg: 'bg-butter/70', color: 'text-amber-soft' },
  { value: '2', label: 'Delays this product actually solves', bg: 'bg-blush/70', color: 'text-rose-soft' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen font-sans text-ink antialiased bg-canvas selection:bg-brand selection:text-white">
      <div className="relative isolate overflow-hidden">
        {/* Ambient pastel orbs */}
        <div className="absolute -top-24 -left-24 size-[460px] rounded-full bg-brand/25 blur-3xl animate-floaty pointer-events-none" aria-hidden />
        <div className="absolute top-40 -right-28 size-[420px] rounded-full bg-blush/40 blur-3xl animate-floaty-2 pointer-events-none" aria-hidden />
        <div className="absolute bottom-0 left-1/3 size-[380px] rounded-full bg-mint/50 blur-3xl pointer-events-none" aria-hidden />

        {/* ─── Header ─── */}
        <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 pt-6">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="grid size-10 place-items-center rounded-2xl border border-white/80 bg-white/70 shadow-xs backdrop-blur-md transition group-hover:bg-white">
              <span className="font-display text-lg font-bold text-brand">S</span>
            </span>
            <span>
              <span className="block text-base font-bold leading-none tracking-tight text-ink">SEQOY</span>
              <span className="block text-[11px] text-ink-soft">Maternal Emergency Network</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-ink-soft md:flex">
            <a href="#problem" className="transition hover:text-ink">Problem</a>
            <a href="#cadres" className="transition hover:text-ink">Who Uses It</a>
            <a href="#trust" className="transition hover:text-ink">Trust</a>
            <a href="#cta" className="transition hover:text-ink">Contact</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/capacity"
              className="hidden rounded-full border border-white/80 bg-white/60 px-4 py-2.5 text-sm font-semibold text-ink backdrop-blur-md transition hover:bg-white sm:block"
            >
              Explore Clinical Portal
            </Link>
            <a
              href="#cta"
              className="rounded-full bg-ink px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-ink/10 transition hover:bg-ink/85"
            >
              Schedule Briefing
            </a>
          </div>
        </header>

        {/* ─── Hero ─── */}
        <section className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-6 pt-14 pb-16 md:pt-20 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/60 px-3 py-1.5 text-xs font-semibold text-ink-soft backdrop-blur-md">
              <span className="size-2 animate-pulse rounded-full bg-emerald-soft" />
              Two delays. Every mother reachable. No new system to learn.
            </div>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.02] tracking-tight text-balance md:text-[3.4rem]">
              Catch danger signs early. Stop referring mothers to hospitals that are already full.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
              SEQOY calls every enrolled mother every two weeks and checks in weekly by WhatsApp or SMS — whichever she
              has — so danger signs surface before they become emergencies. And when a clinic does need to refer her,
              it sees the receiving hospital's real bed, theatre, and blood numbers first, instead of guessing.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#cta"
                className="rounded-full bg-ink px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-ink/15 transition hover:bg-ink/85"
              >
                Schedule County Health Briefing
              </a>
              <Link
                href="/capacity"
                className="rounded-full border border-white/80 bg-white/70 px-6 py-3.5 text-sm font-bold text-ink backdrop-blur-md transition hover:bg-white"
              >
                Explore Clinical Portal
              </Link>
            </div>
            <div className="mt-7 flex flex-wrap gap-2">
              <span className="rounded-full bg-lilac px-3 py-1.5 text-xs font-medium text-ink-soft">County Health Directorates</span>
              <span className="rounded-full bg-mint px-3 py-1.5 text-xs font-medium text-ink-soft">Level 4–6 Referral Facilities</span>
              <span className="rounded-full bg-peach px-3 py-1.5 text-xs font-medium text-ink-soft">Primary Care Midwives</span>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative">
              {/* Floating blood-stock chip */}
              <div className="animate-floaty-card absolute -top-6 -right-4 z-20 flex items-center gap-3 rounded-2xl border border-white/90 bg-white/80 px-4 py-3 shadow-xl shadow-ink/5 backdrop-blur-md">
                <span className="grid size-9 place-items-center rounded-xl bg-blush">
                  <span className="font-bold text-rose-soft">O−</span>
                </span>
                <span>
                  <span className="block text-sm font-bold leading-none">4 units ready</span>
                  <span className="mt-1 block text-[11px] text-ink-soft">Facility blood bank · synced 8 min ago</span>
                </span>
              </div>

              {/* Referral pipeline card */}
              <div className="rounded-[2rem] border border-white/80 bg-white/55 p-5 shadow-2xl shadow-ink/10 backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold">Mother Check-in Queue</p>
                    <p className="text-[11px] text-ink-soft">Sorted by danger score from calls & WhatsApp/SMS</p>
                  </div>
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
                    <span className="size-1.5 animate-pulse rounded-full bg-emerald-soft" />
                    Live
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-2xl border border-blush/50 bg-blush/60 p-3">
                    <span className="grid size-9 place-items-center rounded-xl bg-white/70 text-xs font-bold text-rose-soft">
                      9/10
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">Amina H. · 34 wks</p>
                      <p className="truncate text-[11px] text-ink-soft">Eclampsia signs · BP 168/112 → Pumwani (capacity confirmed)</p>
                    </div>
                    <span className="rounded-full bg-rose-soft px-2 py-1 text-[10px] font-bold text-white">CRITICAL</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl border border-amber-200/60 bg-butter/70 p-3">
                    <span className="grid size-9 place-items-center rounded-xl bg-white/70 text-xs font-bold text-amber-soft">
                      5/10
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">Faith W. · 38 wks</p>
                      <p className="truncate text-[11px] text-ink-soft">Reduced fetal movement (WhatsApp reply) → clinic follow-up</p>
                    </div>
                    <span className="rounded-full bg-amber-soft px-2 py-1 text-[10px] font-bold text-white">MONITOR</span>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="rounded-xl border border-white/70 bg-white/60 p-2.5 text-center">
                    <p className="text-base font-bold">4</p>
                    <p className="text-[10px] text-ink-soft">Open Theatres</p>
                  </div>
                  <div className="rounded-xl border border-white/70 bg-white/60 p-2.5 text-center">
                    <p className="text-base font-bold">2</p>
                    <p className="text-[10px] text-ink-soft">Open ICU Beds</p>
                  </div>
                  <div className="rounded-xl border border-white/70 bg-white/60 p-2.5 text-center">
                    <p className="text-base font-bold">11</p>
                    <p className="text-[10px] text-ink-soft">O− Units</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Three Delays ─── */}
        <section id="problem" className="relative z-10 mx-auto max-w-6xl px-6 pb-20">
          <div className="rounded-[2rem] border border-white/70 bg-white/45 p-8 shadow-xl shadow-ink/5 backdrop-blur-xl md:p-10">
            <div className="mb-8 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">The Three Delays Framework</p>
              <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight md:text-3xl">
                We solve two delays completely, on purpose — not three delays halfway.
              </h2>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {delays.map((d) => (
                <article key={d.n} className={`rounded-3xl border border-white/70 p-6 ${d.bg} relative`}>
                  <div className="flex items-center justify-between">
                    <span className={`grid size-11 place-items-center rounded-2xl bg-white/80 text-sm font-bold ${d.chip}`}>
                      {d.n}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        d.solved ? 'bg-emerald-soft/90 text-white' : 'bg-white/70 text-ink-soft'
                      }`}
                    >
                      {d.solved ? 'SEQOY solves this' : 'Out of scope, by design'}
                    </span>
                  </div>
                  <h3 className="mt-4 text-base font-bold">{d.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{d.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Five Cadres ─── */}
        <section id="cadres" className="relative z-10 mx-auto max-w-6xl px-6 pb-20">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">Who Uses It</p>
            <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight md:text-3xl">
              Five cadres, one live network.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {cadres.map((c) => (
              <Link
                key={c.title}
                href={c.href}
                className="group rounded-3xl border border-white/70 bg-white/55 p-5 backdrop-blur-md transition hover:bg-white hover:shadow-md block"
              >
                <h3 className="font-display text-lg font-bold group-hover:text-brand transition">{c.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-ink-soft">{c.body}</p>
                <span className="mt-3 inline-block text-[11px] font-semibold text-brand underline opacity-0 group-hover:opacity-100 transition">
                  Open Workspace &rarr;
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ─── Trust / Accountability ─── */}
        <section id="trust" className="relative z-10 mx-auto max-w-6xl px-6 pb-20">
          <div className="grid items-center gap-8 rounded-[2rem] border border-white/70 bg-white/45 p-8 shadow-xl shadow-ink/5 backdrop-blur-xl md:grid-cols-2 md:p-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">Built on Trust</p>
              <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight md:text-3xl">
                No hallucinated triage. Your data stays sovereign.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-ink-soft">
                A hospital's own EHR can push live bed and blood numbers to SEQOY automatically — or, until that
                integration exists, a bed manager updates it in ten seconds by hand. Either way, referring clinics see
                the real number. Triage logic is deterministic clinical rules aligned to WHO Antenatal Guidelines and
                Kenya MoH MPDSR frameworks, built for compliance with the Kenya Data Protection Act 2019.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-lilac px-3 py-1.5 text-xs font-medium text-ink-soft">WHO Antenatal Guidelines</span>
                <span className="rounded-full bg-mint px-3 py-1.5 text-xs font-medium text-ink-soft">MoH MPDSR Framework</span>
                <span className="rounded-full bg-peach px-3 py-1.5 text-xs font-medium text-ink-soft">Data Protection Act 2019</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {trustStats.map((s) => (
                <div key={s.label} className={`rounded-3xl border border-white/70 p-5 text-center ${s.bg}`}>
                  <p className={`font-display text-3xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="mt-1 text-xs font-medium text-ink-soft">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA + Contact ─── */}
        <section id="cta" className="relative z-10 mx-auto max-w-6xl px-6 pb-20">
          <div className="relative overflow-hidden rounded-[2rem] bg-ink p-8 text-white md:p-12 shadow-2xl">
            <div className="absolute -top-20 -right-16 size-72 rounded-full bg-brand/30 blur-3xl pointer-events-none" aria-hidden />
            <div className="relative grid items-center gap-8 md:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand/90">Start a Sub-County Pilot</p>
                <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">
                  See your county's maternal network in 30 days.
                </h2>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
                  We onboard your primary clinics and referral hospitals onto one shared capacity picture, and get
                  every enrolled mother reachable by call and WhatsApp/SMS — no capital outlay, no new hardware.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a href="mailto:partners@seqoy.health" className="rounded-full bg-white px-6 py-3.5 text-sm font-bold text-ink transition hover:bg-white/90">
                    Request 30-Day Pilot
                  </a>
                  <Link href="/integrations" className="rounded-full border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/20">
                    Connect Your EMR Bridge
                  </Link>
                </div>
              </div>
              <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-white/50">Clinical Operations Line</p>
                  <p className="mt-1 text-sm font-semibold">+254 700 118 220</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-white/50">Institutional Email</p>
                  <p className="mt-1 text-sm font-semibold">partners@seqoy.health</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-white/50">Field Office</p>
                  <p className="mt-1 text-sm font-semibold">4th Floor, Kibera Innovation Hub, Nairobi</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Footer ─── */}
        <footer className="relative z-10 mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-ink/10 px-6 pt-8 pb-10 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="font-display text-base font-bold text-ink">SEQOY</span>
            <span className="text-xs text-ink-soft">© 2026 · Maternal Emergency Referral Network</span>
          </div>
          <div className="flex items-center gap-6 text-xs font-medium text-ink-soft">
            <a href="#trust" className="transition hover:text-ink">Privacy</a>
            <a href="#trust" className="transition hover:text-ink">Data Sovereignty</a>
            <a href="#trust" className="transition hover:text-ink">Clinical Safety</a>
          </div>
        </footer>
      </div>
    </div>
  );
}

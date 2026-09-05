'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';
import { useTelephony } from '@/context/TelephonyContext';
import { USER_PERSONAS } from '@/context/AuthContext';

export default function SEQOYLandingPage() {
  const { openDrawer } = useTelephony();
  const [selectedPersonaKey, setSelectedPersonaKey] = useState<string>('CLINIC_NURSE');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const selectedPersona = USER_PERSONAS[selectedPersonaKey as keyof typeof USER_PERSONAS];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-teal-500 selection:text-slate-950">
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 1. TOP GLOBAL NAVIGATION HEADER */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-3.5 transition">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:bg-teal-500/25 transition shadow-xs">
              <AppLogo size={24} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base text-white tracking-tight">SEQOY</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold">
                  Kenya 🏥
                </span>
              </div>
              <span className="text-[10px] text-slate-400 tracking-wide font-medium">
                Maternal Emergency &amp; Referral Network
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <a href="#why-seqoy" className="hover:text-teal-400 transition">The Crisis (Why)</a>
            <a href="#how-it-works" className="hover:text-teal-400 transition">How It Works</a>
            <a href="#roles" className="hover:text-teal-400 transition">Clinical Cadres</a>
            <a href="#trust" className="hover:text-teal-400 transition">Data &amp; Security</a>
            <a href="#faq" className="hover:text-teal-400 transition">FAQ</a>
          </nav>

          {/* Right Action CTAs */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => openDrawer('ussd')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700 transition"
              title="Test 2G USSD Dialing (*384#)"
            >
              <Icon name="RadioIcon" size={14} variant="outline" className="text-teal-400" />
              <span>USSD *384#</span>
            </button>

            <Link
              href="/my-pregnancy/1"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30 transition"
            >
              <span>🌸 Mother Pass</span>
            </Link>

            <Link
              href="/capacity"
              className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold shadow-lg shadow-teal-500/20 transition flex items-center gap-1.5 active:scale-95"
            >
              <span>Launch Clinical Portal</span>
              <Icon name="ArrowRightIcon" size={14} variant="outline" />
            </Link>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 2. HERO SECTION */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-slate-800/60">
        {/* Background Subtle Gradient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-teal-500/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[300px] bg-rose-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          {/* Institutional Compliance Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-sm text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-slate-300">Aligned with WHO Antenatal Protocols &amp; Kenya MOH 711 Standards</span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
            Eliminating Maternal <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-300 to-cyan-400">Referral Blindness</span> Across Kenya.
          </h1>

          {/* Hero Subtitle */}
          <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            In obstetric emergencies, referral delays cost lives. SEQOY connects primary maternity clinics, emergency ambulances, and tertiary hospitals in real time—pairing proactive 2G AI danger screening with live ICU bed and blood availability.
          </p>

          {/* Primary Action Button Cluster */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <Link
              href="/capacity"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-sm font-bold shadow-xl shadow-teal-500/25 transition flex items-center justify-center gap-2"
            >
              <Icon name="BuildingOffice2Icon" size={18} variant="solid" />
              <span>Enter Clinical Network</span>
            </Link>

            <Link
              href="/my-pregnancy/1"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-sm font-semibold transition flex items-center justify-center gap-2"
            >
              <span>🌸 Preview Mother Pass</span>
            </Link>
          </div>

          {/* High-Impact Stat Strip */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-xs">
              <span className="text-2xl sm:text-3xl font-black text-teal-400">73%</span>
              <p className="text-xs font-bold text-white mt-1">Preventable Complications</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Targeting eclampsia, PPH, and obstructed labor.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-xs">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400">&lt; 4 mins</span>
              <p className="text-xs font-bold text-white mt-1">Emergency Hospital Match</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Down from 140 min manual telephone delays.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-xs">
              <span className="text-2xl sm:text-3xl font-black text-cyan-400">100% Reach</span>
              <p className="text-xs font-bold text-white mt-1">2G Feature Phone Support</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Zero-data USSD `*384#` &amp; automated Swahili calls.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-xs">
              <span className="text-2xl sm:text-3xl font-black text-rose-400">Zero Blindness</span>
              <p className="text-xs font-bold text-white mt-1">Verified Capacity Transfer</p>
              <p className="text-[11px] text-slate-400 mt-0.5">No referrals to occupied theatres or dry blood banks.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 3. THE PROBLEM & WHY: WHO THREE DELAYS CRISIS */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <section id="why-seqoy" className="py-20 border-b border-slate-800/60 bg-slate-900/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
              The Reality in Sub-Saharan Africa
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Why Mothers Die: The Anatomy of Referral Failure
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Maternal mortality is not just a clinical failure—it is a coordination failure across the three stages of maternal care seeking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Delay 1 */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 hover:border-slate-700 transition">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center font-bold text-lg">
                1
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-rose-400 uppercase tracking-wide">Delay 1: Recognition</span>
                <h3 className="text-base font-bold text-white">Delayed Decision to Seek Care</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Mothers and families mistake early danger signs (visual scotoma, refractory headaches, facial edema) for normal pregnancy discomfort. By the time eclamptic convulsions start, irreversible brain or organ damage has occurred.
              </p>
              <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-500/20 text-[11px] text-teal-200">
                <strong>SEQOY Solution:</strong> Weekly automated Saturday voice calls in Swahili and USSD `*384#` proactively catch symptoms days before critical convulsions begin.
              </div>
            </div>

            {/* Delay 2 */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 hover:border-slate-700 transition">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold text-lg">
                2
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wide">Delay 2: Reaching Care</span>
                <h3 className="text-base font-bold text-white">Transport &amp; Geographic Delays</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Rural clinics struggle with phone dispatches, lack coordination with county emergency fleets, and patients get stuck in city traffic or bad roads without medical escorts or vital monitoring in transit.
              </p>
              <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-500/20 text-[11px] text-teal-200">
                <strong>SEQOY Solution:</strong> 1-Click emergency ambulance transfer with real-time transit telemetry and live pre-arrival vitals streaming to the receiving hospital ICU.
              </div>
            </div>

            {/* Delay 3 */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 hover:border-slate-700 transition">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold text-lg">
                3
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-purple-400 uppercase tracking-wide">Delay 3: Referral Blindness</span>
                <h3 className="text-base font-bold text-white">Arriving at an Unprepared Facility</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                A clinic sends a bleeding or seizing mother in an ambulance to a Level 5 hospital. Upon arrival, the theatre is occupied, the adult ICU is full, or there is no blood O-negative. The patient dies waiting for a second transfer.
              </p>
              <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-500/20 text-[11px] text-teal-200">
                <strong>SEQOY Solution:</strong> Real-time anti-referral blindness grid verifying bed availability, theatre readiness, and blood units BEFORE wheels start turning.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 4. HOW IT WORKS: THE GOLDEN THREAD WORKFLOW */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 border-b border-slate-800/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
              The Architecture of Survival
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              How SEQOY Coordinates the Care Continuum
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              From the rural village to the tertiary surgical theatre, SEQOY replaces fragmented telephone calls with closed-loop verified digital protocols.
            </p>
          </div>

          {/* 4 Step Timeline Process */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 font-bold flex items-center justify-center text-xs">
                01
              </div>
              <h4 className="text-sm font-bold text-white">Early 2G Warning</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Expectant mothers undergo weekly automated Swahili voice check-ins or USSD screening. Symptoms are instantly parsed for preeclampsia and PPH risk.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 font-bold flex items-center justify-center text-xs">
                02
              </div>
              <h4 className="text-sm font-bold text-white">Capacity Verification</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                When a clinic midwife initiates transfer, SEQOY algorithmically cross-checks ICU bed, theatre readiness, and blood match across KNH, Pumwani, and Mama Lucy.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 font-bold flex items-center justify-center text-xs">
                03
              </div>
              <h4 className="text-sm font-bold text-white">Closed-Loop Transport</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Emergency EMS ambulance receives turn-by-turn routing, updates in-transit vitals (BP, FHR, O2), and alerts the receiving surgical team before arrival.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 font-bold flex items-center justify-center text-xs">
                04
              </div>
              <h4 className="text-sm font-bold text-white">MPDSR Surveillance</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Transfer timestamps, delay durations, and clinical outcomes automatically populate county MPDSR audits to rectify bottlenecks and inform county health budgets.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 5. INTERACTIVE ROLE SANDBOX */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <section id="roles" className="py-20 border-b border-slate-800/60 bg-slate-900/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Role-Based Access Control (RBAC)
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Designed for Shifts, Not Generic Dashboards
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              In high-stress medical environments, extraneous buttons cause errors. SEQOY tailors every interface specifically to the clinician&apos;s exact job.
            </p>
          </div>

          {/* Interactive Cadre Selector */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {Object.keys(USER_PERSONAS).map((key) => {
              const persona = USER_PERSONAS[key as keyof typeof USER_PERSONAS];
              const isSelected = selectedPersonaKey === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedPersonaKey(key)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                    isSelected
                      ? 'bg-teal-500 text-slate-950 shadow-md'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  <span>{persona.avatarInitials}</span>
                  <span>{persona.roleTitle}</span>
                </button>
              );
            })}
          </div>

          {/* Selected Cadre Highlight Card */}
          <div className="max-w-3xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm border ${selectedPersona.avatarColor}`}
                >
                  {selectedPersona.avatarInitials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{selectedPersona.name}</h3>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                      {selectedPersona.facilityType}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{selectedPersona.roleTitle} · {selectedPersona.facilityName}</p>
                </div>
              </div>

              <Link
                href={selectedPersona.primaryRoute}
                className="btn-primary text-xs py-2 px-4 flex items-center justify-center gap-1.5 shrink-0"
              >
                <span>Launch This Workspace</span>
                <Icon name="ArrowRightIcon" size={14} variant="outline" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                <p className="font-bold text-teal-400 text-xs">Shift Responsibility:</p>
                <p className="text-slate-300 leading-relaxed">{selectedPersona.description}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                <p className="font-bold text-white text-xs">Primary Landing Workspace:</p>
                <p className="font-mono text-teal-300">{selectedPersona.primaryRoute}</p>
                <p className="text-[11px] text-slate-400">
                  Strictly hidden: irrelevant administrative grids, unnecessary data entry, unassigned modules.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 6. TRUST, SECURITY & INTEROPERABILITY */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <section id="trust" className="py-20 border-b border-slate-800/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Institutional Trust &amp; Compliance
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Built for Public Healthcare Rigor
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Deployable across national, county, and private hospital networks with enterprise-grade data protection and interoperability.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center">
                <Icon name="ShieldCheckIcon" size={20} variant="outline" />
              </div>
              <h4 className="text-sm font-bold text-white">Kenya DPA (2019) Aligned</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Full compliance with the Kenya Data Protection Act. End-to-end data encryption in transit and at rest with role-restricted audit logs.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <Icon name="CommandLineIcon" size={20} variant="outline" />
              </div>
              <h4 className="text-sm font-bold text-white">HL7 FHIR R4 Native</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Zero-data-custody middleware supporting standard FHIR bundles (`Patient`, `Observation`, `ServiceRequest`) for effortless EMR integration.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
                <Icon name="DocumentChartBarIcon" size={20} variant="outline" />
              </div>
              <h4 className="text-sm font-bold text-white">MOH 711 &amp; KHIS2 Ready</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automates maternal and perinatal indicators directly into Kenya Health Information System (DHIS2) for timely county reporting.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center">
                <Icon name="HeartIcon" size={20} variant="outline" />
              </div>
              <h4 className="text-sm font-bold text-white">KNBTS Blood Transfusion</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Direct shortage broadcast links with the Kenya National Blood Transfusion Service for emergency postpartum hemorrhage supply.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 7. FREQUENTLY ASKED QUESTIONS */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-20 border-b border-slate-800/60 bg-slate-900/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Clear Answers</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'What if expectant mothers have basic 2G feature phones without internet?',
                a: 'SEQOY is built specifically for this reality. Over 85% of maternal check-ins occur over standard 2G GSM telephony: zero-data USSD (*384*99#) and automated Saturday Voice AI calls in Swahili that speak directly to the mother with no app installation or airtime needed.',
              },
              {
                q: 'Does SEQOY replace hospital Electronic Medical Records (like KenyaEMR)?',
                a: 'No. SEQOY is an inter-facility emergency coordination switchboard, not a general hospital billing or pharmacy EMR. It exchanges clinical referral data with KenyaEMR and national systems via non-disruptive HL7 FHIR R4 APIs and automated MOH 711 exports.',
              },
              {
                q: 'How is live hospital capacity kept up to date?',
                a: 'Referral Hospital Charge Nurses and Bed Managers have a streamlined 1-tap mobile toggle taking less than 3 seconds per shift (e.g. toggling "Theatre 2: Busy with C-Section" or "ICU Bed Available: 1"). No tedious manual forms.',
              },
              {
                q: 'How can County Health Departments pilot SEQOY?',
                a: 'Deployments begin with a 90-day sub-county corridor pilot (e.g. connecting 5 primary dispensaries to 1 Level 4 and 1 Level 5 hospital). The system requires zero dedicated hardware beyond standard staff smartphones/computers and 2G telco shortcodes.',
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden transition"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-white hover:text-teal-400 transition"
                >
                  <span>{faq.q}</span>
                  <Icon
                    name="ChevronDownIcon"
                    size={16}
                    variant="outline"
                    className={`shrink-0 transition-transform duration-200 ${
                      activeFaq === idx ? 'rotate-180 text-teal-400' : 'text-slate-500'
                    }`}
                  />
                </button>
                {activeFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 8. CALL TO ACTION & FOOTER */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <section className="py-20 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center mx-auto text-xl">
            🏥
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Ready to Protect Expectant Mothers in Your County?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Eliminate referral delays, unannounced arrivals, and preventable maternal mortality with SEQOY&apos;s verified coordination network.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/capacity"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-xl shadow-teal-500/25 transition flex items-center justify-center gap-2"
            >
              <span>Explore Live Clinical Portal</span>
              <Icon name="ArrowRightIcon" size={16} variant="outline" />
            </Link>

            <Link
              href="/my-pregnancy/1"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition"
            >
              <span>View Mother Pass UI</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Global Bottom Footer */}
      <footer className="border-t border-slate-800/80 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 bg-slate-950">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">SEQOY Health Network</span>
            <span>· Nairobi, Kenya 🇰🇪</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/login" className="hover:text-slate-300 transition">Clinical Staff Sign In</Link>
            <Link href="/capacity" className="hover:text-slate-300 transition">Live Capacity</Link>
            <Link href="/surveillance" className="hover:text-slate-300 transition">MPDSR Surveillance</Link>
            <Link href="/integrations" className="hover:text-slate-300 transition">FHIR Interoperability</Link>
          </div>
          <p className="text-[10px]">© 2026 SEQOY. All rights reserved. Zero Maternal Referral Blindness.</p>
        </div>
      </footer>
    </div>
  );
}

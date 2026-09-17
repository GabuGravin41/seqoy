# SEQOY — Early Warning & Facility Readiness for Maternal Care 🏥🇰🇪

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=flat&logo=drizzle)](https://orm.drizzle.team/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Serverless-4169E1?style=flat&logo=postgresql)](https://neon.tech/)
[![Clerk](https://img.shields.io/badge/Auth-Clerk-6C47FF?style=flat)](https://clerk.com/)
[![Twilio](https://img.shields.io/badge/Twilio-Voice_&_WhatsApp-F22F46?style=flat&logo=twilio)](https://www.twilio.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)

**SEQOY** closes two of the WHO "Three Delays" behind preventable maternal deaths — **Delay 1** (recognizing danger
signs too late) and **Delay 3** (hospitals receiving mothers with no idea whether they can actually treat them).
**Delay 2 (transport/ambulance coordination) is explicitly out of scope** — it's a different problem, owned by EMS
and county transport systems, and bolting a fake version of it onto this product would make it worse, not better.

---

## 🌟 What It Actually Does

* **📞 Delay 1 — Reach every mother, on her terms**: an automated voice check-in call every 2 weeks by default
  (mother/clinic can change the day and time — including self-service via the USSD menu), plus a weekly WhatsApp
  message with baby-development info and a symptom prompt. Mothers without WhatsApp get the identical weekly cadence
  over SMS instead — both channels are two-way, so a reply gets parsed for danger signs the same way a call does.
* **🏥 Delay 3 — Facility readiness clinics can actually see**: live ICU/HDU bed, theatre, and blood-bank capacity per
  referral hospital, sourced either from that hospital's own EHR/HIMS via a webhook, or from a 10-second manual
  update screen for facilities that don't have that integration yet. Every facility's sync status is shown honestly —
  never a blanket "connected" claim.
* **🧠 Deterministic clinical triage**: WHO-aligned danger-sign scoring (severe headache, blurred vision, bleeding,
  reduced fetal movement, hypertension) drives risk level — not a black box. Symptom extraction from call/message
  transcripts uses Claude when configured, with a zero-cost keyword-match fallback.
* **🎭 Role-based access, enforced server-side**: Clinic Midwife, Bed Manager, Blood Bank Officer, County Director,
  Community Health Promoter, System Admin — real Clerk-backed accounts, real permission checks on every API route,
  not a client-side costume.
* **📊 MPDSR surveillance, scoped honestly**: County-level Delay 1 / Delay 3 audit reporting for MoH compliance.
  Delay 2 exists only as an optional free-text note a nurse can add — never computed or fabricated.

---

## 🏗️ Architecture

```
                     ┌──────────────────────────────────────────────┐
                     │          FRONTEND & APPLICATION LAYER        │
                     ├──────────────────────────────────────────────┤
                     │ • Next.js 14 App Router (React 18 + TS)      │
                     │ • Clerk (auth) + server-enforced RBAC        │
                     └──────────────────────┬───────────────────────┘
                                            │
                     ┌──────────────────────┴───────────────────────┐
                     │          MIDDLEWARE & API ROUTES             │
                     ├──────────────────────────────────────────────┤
                     │ • Serverless API Routes + zod validation     │
                     │ • Twilio Voice/WhatsApp + Africa's Talking   │
                     │   SMS/USSD, all webhook-signature verified   │
                     │ • HL7 FHIR R4 transformer for EHR handoff    │
                     └──────────────┬───────────────────────────────┘
                                    │
        ┌───────────────────────────┴───────────────────────────┐
        ▼                                                       ▼
┌───────────────────────────────┐               ┌───────────────────────────────┐
│     NEON / POSTGRES DB         │              │   TWILIO + AFRICA'S TALKING   │
├───────────────────────────────┤               ├───────────────────────────────┤
│ • Drizzle ORM schema          │               │ • Biweekly outbound calls     │
│ • Repository layer (db/repository) mediates   │ • Weekly WhatsApp/SMS         │
│   every route — no raw mock data in prod      │ • Inbound reply webhooks      │
└───────────────────────────────┘               └───────────────────────────────┘
```

---

## 🚀 Local Development

### 1. Prerequisites
* Node.js 18+ or 20+
* npm
* Docker (optional, for a local Postgres instead of Neon)

### 2. Install
```bash
npm install
```

### 3. Configure Environment Variables
```bash
cp .env.example .env.local
```
Fill in what you have — every integration has an offline mock/fallback mode for local dev (see `.env.example` for
the full list: Neon/Postgres, Clerk, Twilio, Africa's Talking, webhook secrets, Anthropic).

### 4. Database
Either point `DATABASE_URL` at a Neon instance, or run Postgres locally:
```bash
docker compose up -d
# DATABASE_URL=postgres://seqoy:seqoy_dev_password@localhost:5432/seqoy
npm run db:push
npm run db:seed
```
Without `DATABASE_URL` set, the app runs against an in-memory mock store for zero-friction local UI work — but no
data persists across restarts, and this must never be used in production.

### 5. Run
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000). Sign-in/sign-up is handled by Clerk; the first account created
gets the default `CLINIC_NURSE` role, and a `SYSTEM_ADMIN` reassigns roles from **Manage Staff Roles** in the sidebar.

### 6. Test
```bash
npm test
```
Runs the core-logic verification suite: clinical triage, USSD flow (including the self-service schedule change),
capacity matching, RBAC permission matrix, MPDSR reporting honesty, and Twilio TwiML generation.

---

## 🔌 Telephony Setup Notes

- **Voice calls & WhatsApp**: Twilio. Point your Twilio number's voice webhook at `/api/telephony/twilio/voice` and
  set `TWILIO_WHATSAPP_NUMBER` for outbound weekly WhatsApp messages.
- **USSD & SMS**: Africa's Talking — Twilio does not offer Kenyan USSD short codes. Point your AT USSD channel at
  `/api/telephony/ussd` and your SMS inbound callback at `/api/telephony/sms/inbound`.
- **Scheduling**: `/api/cron/checkins` should run on a daily schedule (e.g. Vercel Cron) — it independently checks
  each mother's call cadence and weekly message cadence rather than assuming everyone gets contacted the same day.
- **Webhook security**: set `USSD_WEBHOOK_SECRET`, `SMS_WEBHOOK_SECRET`, `HIMS_WEBHOOK_SECRET`, and `CRON_SECRET` in
  production — without them, anyone who finds the URL could inject fake check-ins or drain a hospital's bed count.

---

## 📜 License
MIT License. Built for maternal healthcare equity in Kenya and across Sub-Saharan Africa.

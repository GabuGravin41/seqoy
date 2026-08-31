# SEQOY — Maternal Health Monitoring & Hospital Referral Network 🏥🇰🇪

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=flat&logo=drizzle)](https://orm.drizzle.team/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Serverless-4169E1?style=flat&logo=postgresql)](https://neon.tech/)
[![Twilio](https://img.shields.io/badge/Twilio-Voice_&_SMS-F22F46?style=flat&logo=twilio)](https://www.twilio.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)

**SEQOY** connects primary maternity clinics and tertiary referral hospitals across Kenya in real time — combining continuous antenatal patient risk monitoring (via USSD `*384#` & automated Swahili Voice AI check-ins) with live bed and blood capacity visibility to eliminate preventable maternal delays and referral blindness.

---

## 🌟 Key Features

* **🏥 Anti-Referral Blindness Capacity Grid**: Real-time visibility into ICU/HDU bed availability, operating theatre readiness, and on-duty obstetric specialists across referral hospitals (KNH, Pumwani, Mama Lucy, Kiambu Level 5, Mbagathi).
* **🩸 Blood Bank Inventory Heatmap**: Live unit tracking across all ABO/Rh groups ($O^-, O^+, A^-, A^+, B^-, B^+, AB^-, AB^+$) with 1-click shortage broadcasts to the Kenya National Blood Transfusion Service (KNBTS).
* **📱 Dual 2G Telephony Support (100% Reach)**:
  * **Interactive USSD Simulator (`*384*99#`)**: Number-driven 20-second self-registration and emergency reporting on basic feature phones with zero internet or airtime required.
  * **Automated Saturday Voice AI Check-ins**: Natural Swahili and English conversational welfare calls extracting danger signs (scotoma, refractory headache, edema, bleeding, reduced fetal kicks) using structured WHO Antenatal Care (DAK) protocols.
* **🚑 Emergency Transport Dispatch & Live Radar**: 1-click ambulance referral transfers with real-time ETA calculation, in-transit vitals streaming, and pre-arrival EHR delivery directly to the hospital ICU desk.
* **📊 County MPDSR 3-Delays Surveillance**: Automated Maternal & Perinatal Death Surveillance and Response audits mapping Delay 1 (Decision to seek care), Delay 2 (Reaching care / transport), and Delay 3 (Receiving quality care).
* **🌐 Non-Disruptive HIMS Interoperability**: Zero-data-custody middleware supporting standard **HL7 FHIR R4** bundles (`Patient`, `Observation`, `ServiceRequest`) and automated **MOH 711 & 105 / KHIS2 (DHIS2)** reporting.
* **🎭 Role-Based Access Control (RBAC)**: 7 clinical personas with instant role switching (Clinic Midwife, Hospital Bed Manager, Blood Bank Officer, Ambulance Paramedic, County MPDSR Director, Community Health Promoter, System Admin).

---

## 🏗️ Architecture & Technology Stack

```
                     ┌──────────────────────────────────────────────┐
                     │          FRONTEND & APPLICATION LAYER        │
                     ├──────────────────────────────────────────────┤
                     │ • Next.js 14 App Router (React 18 + TS)      │
                     │ • Tailwind CSS + Lucide & Heroicons          │
                     │ • Recharts + Sonner Toast Notifications      │
                     └──────────────────────┬───────────────────────┘
                                            │
                     ┌──────────────────────┴───────────────────────┐
                     │          MIDDLEWARE & API ROUTES             │
                     ├──────────────────────────────────────────────┤
                     │ • Serverless Edge API Routes                 │
                     │ • Twilio Voice TwiML (<Gather>) & SMS Engine │
                     │ • HL7 FHIR R4 Interoperability Transformer   │
                     └──────────────┬───────────────────────────────┘
                                    │
        ┌───────────────────────────┴───────────────────────────┐
        ▼                                                       ▼
┌───────────────────────────────┐               ┌───────────────────────────────┐
│     NEON SERVERLESS DB        │               │       TWILIO TELEPHONY        │
├───────────────────────────────┤               ├───────────────────────────────┤
│ • Drizzle ORM Schema          │               │ • Outbound Triage Calls       │
│ • Connection Pooler           │               │ • Swahili Speech Recognition  │
│ • Zero idle server costs      │               │ • Emergency Clinic SMS Alerts │
└───────────────────────────────┘               └───────────────────────────────┘
```

---

## 🚀 Quickstart & Local Development

### 1. Prerequisites
* Node.js 18+ or 20+
* npm, yarn, or pnpm

### 2. Clone & Install
```bash
git clone https://github.com/your-username/seqoy.git
cd seqoy
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your configuration (all keys have automatic offline mock fallbacks for local dev):
```env
DATABASE_URL="postgres://username:password@ep-sample-pooler.us-east-2.aws.neon.tech/seqoy?sslmode=require"
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_PHONE_NUMBER="+12025550199"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Run Automated Test Suite
```bash
npm test
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 1-Click Deployment to Vercel

1. Push your code to your GitHub repository:
   ```bash
   git add .
   git commit -m "Initial commit of SEQOY platform"
   git branch -M main
   git remote add origin https://github.com/your-username/seqoy.git
   git push -u origin main
   ```
2. Go to [Vercel](https://vercel.com/) → **Add New Project** → Select your `seqoy` repository.
3. In **Environment Variables**, paste the values from `.env.local` (`DATABASE_URL`, `TWILIO_ACCOUNT_SID`, etc.).
4. Click **Deploy**. Vercel will build all 26 static & API routes live in under 60 seconds!

---

## 🧪 Verification & Health Check

* **Unit & Integration Suite**: `npm test` runs 11 automated verification tests across Clinical Risk Scoring, USSD Session State Machines, Voice AI Parsers, Anti-Referral Blindness Routing, MPDSR 3-Delays Metrics, and Twilio TwiML generation.
* **Production Build**: `npm run build` compiles 26 dynamic and static routes with 0 errors.

---

## 📜 License
MIT License. Built for maternal healthcare equity and zero preventable maternal deaths in Kenya and across Sub-Saharan Africa.

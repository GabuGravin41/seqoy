'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';

interface Referral {
  id: number;
  referralCode: string;
  patientId: number;
  referringFacilityId: number;
  receivingFacilityId: number;
  clinicalIndication: string;
  urgencyLevel: string;
  icuBedReserved: boolean;
  bloodUnitsReserved: number;
  bloodTypeReserved?: string;
  status: string;
  preArrivalHandoverNote?: string;
  initiatedAt: string;
}

interface Patient {
  fullName: string;
  age: number;
  phoneNumber: string;
  bloodType: string;
  gravida: number;
  parity: number;
  gestationalWeeks: number;
  estimatedDeliveryDate: string;
  preferredLanguage: string;
}

interface Facility {
  id: number;
  name: string;
  subCounty: string;
  county: string;
  tier: string;
  emergencyPhone: string;
}

export default function MOH268PrintSlipPage() {
  const params = useParams();
  const router = useRouter();
  const referralId = params.id ? parseInt(params.id as string) : 1;

  const [referral, setReferral] = useState<Referral | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [referringFacility, setReferringFacility] = useState<Facility | null>(null);
  const [receivingFacility, setReceivingFacility] = useState<Facility | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const referralsRes = await fetch('/api/referrals');
        const referralsData = await referralsRes.json();
        const ref: Referral | undefined = referralsData.referrals?.find((r: Referral) => r.id === referralId);
        if (!ref) return;
        setReferral(ref);

        const [patientRes, facilitiesRes] = await Promise.all([
          fetch(`/api/patients/${ref.patientId}`),
          fetch('/api/hospitals'),
        ]);
        const patientData = await patientRes.json();
        const facilitiesData = await facilitiesRes.json();

        setPatient(patientData.patient ?? null);
        setReferringFacility(facilitiesData.facilities?.find((f: Facility) => f.id === ref.referringFacilityId) ?? null);
        setReceivingFacility(facilitiesData.facilities?.find((f: Facility) => f.id === ref.receivingFacilityId) ?? null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [referralId]);

  const handlePrint = () => window.print();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">Loading referral...</div>;
  }

  if (!referral || !patient) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">Referral not found.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 text-slate-900 font-sans print:p-0 print:bg-white">
      <div className="max-w-3xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <button onClick={() => router.back()} className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold hover:bg-slate-50 flex items-center gap-2">
          <Icon name="ArrowLeftIcon" size={14} variant="outline" />
          Back to Referrals
        </button>
        <button onClick={handlePrint} className="px-5 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold shadow-md hover:bg-teal-700 flex items-center gap-2">
          <Icon name="PrinterIcon" size={16} variant="outline" />
          Print / Save PDF (MOH 268)
        </button>
      </div>

      <div className="max-w-3xl mx-auto bg-white border border-slate-300 p-8 rounded-2xl shadow-sm print:border-none print:shadow-none print:p-0">
        <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-600">Republic of Kenya · Ministry of Health</p>
          <h1 className="text-xl font-black uppercase text-slate-900 mt-1">Official Patient Referral Form (MOH 268)</h1>
          <p className="text-[11px] font-semibold text-slate-600 mt-0.5">Maternal & Neonatal Referral Handover Document</p>
          <div className="flex items-center justify-center gap-6 mt-3 text-xs font-mono flex-wrap">
            <span><strong>Referral Ref:</strong> {referral.referralCode}</span>
            <span><strong>Date & Time:</strong> {new Date(referral.initiatedAt).toLocaleString('en-GB')}</span>
            <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold border border-rose-300">
              URGENCY: {referral.urgencyLevel}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border border-slate-300 rounded-xl p-4 mb-5 bg-slate-50 text-xs">
          <div>
            <h3 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">Referring Facility (Origin)</h3>
            <p className="font-black text-sm text-slate-900">{referringFacility?.name ?? '—'}</p>
            <p className="text-slate-600">{referringFacility?.subCounty}, {referringFacility?.county} County</p>
            <p className="text-slate-600 font-mono">Facility Tier: {referringFacility?.tier?.replace(/_/g, ' ')}</p>
          </div>
          <div>
            <h3 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">Receiving Facility (Destination)</h3>
            <p className="font-black text-sm text-teal-800">{receivingFacility?.name ?? '—'}</p>
            <p className="text-slate-600">{receivingFacility?.subCounty}, {receivingFacility?.county} County</p>
            <p className="text-slate-600 font-mono">Triage Desk Line: {receivingFacility?.emergencyPhone}</p>
          </div>
        </div>

        <div className="border border-slate-300 rounded-xl p-4 mb-5 space-y-3 text-xs">
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1">1. Patient Clinical Profile</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-semibold">Full Name:</span>
              <p className="font-bold text-slate-900 text-sm">{patient.fullName}</p>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-semibold">Age & Contact:</span>
              <p className="font-semibold text-slate-900">{patient.age} yrs · {patient.phoneNumber}</p>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-semibold">Blood Group:</span>
              <p className="font-black text-slate-900 text-sm">{patient.bloodType}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100">
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-semibold">Obstetric Status:</span>
              <p className="font-semibold text-slate-900">Gravida {patient.gravida}, Para {patient.parity}</p>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-semibold">Gestational Age:</span>
              <p className="font-bold text-slate-900">{patient.gestationalWeeks} Weeks (EDD: {patient.estimatedDeliveryDate})</p>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-semibold">Preferred Language:</span>
              <p className="font-semibold text-slate-900">{patient.preferredLanguage}</p>
            </div>
          </div>
        </div>

        <div className="border border-slate-300 rounded-xl p-4 mb-5 space-y-3 text-xs">
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1">
            2. Clinical Indication & Pre-Referral Management
          </h3>
          <div>
            <span className="text-slate-500 text-[10px] uppercase font-semibold">Primary Diagnosis / Indication:</span>
            <p className="font-black text-rose-700 text-sm">{referral.clinicalIndication.replace(/_/g, ' ')}</p>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase font-semibold">Pre-Referral Handover Note:</span>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 mt-1 font-mono text-[11px] text-slate-800 leading-relaxed">
              {referral.preArrivalHandoverNote || 'No handover note recorded.'}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-semibold">ICU Bed Reserved:</span>
              <p className="font-bold text-slate-900">{referral.icuBedReserved ? 'YES (Confirmed at receiving facility)' : 'NO'}</p>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-semibold">Blood Bank Allocation:</span>
              <p className="font-bold text-slate-900">{referral.bloodUnitsReserved} Units ({referral.bloodTypeReserved || 'Not specified'})</p>
            </div>
          </div>
        </div>

        <div className="border border-slate-300 rounded-xl p-4 mb-6 space-y-4 text-xs">
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1">
            3. Referral Status & Sign-off Certification
          </h3>
          <div>
            <span className="text-slate-500 text-[10px] uppercase font-semibold">Current Status:</span>
            <p className="font-bold text-slate-900">{referral.status}</p>
            <p className="text-[10px] text-slate-500 mt-1">
              Transport to the facility is arranged by the referring clinic/family — SEQOY records the referral and its
              acceptance, not the transport itself.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200">
            <div className="space-y-4">
              <p className="font-bold text-slate-700">Referring Officer (Midwife/Doctor):</p>
              <div className="border-b border-slate-400 pb-1">Name: ______________________</div>
              <div className="border-b border-slate-400 pb-1">Signature: ______________________</div>
            </div>
            <div className="space-y-4">
              <p className="font-bold text-slate-700">Receiving Triage Officer (Hospital):</p>
              <div className="border-b border-slate-400 pb-1">Name: ______________________</div>
              <div className="border-b border-slate-400 pb-1">Signature: ______________________</div>
            </div>
          </div>
        </div>

        <div className="text-center text-[10px] text-slate-400 border-t border-slate-200 pt-3">
          Generated automatically by SEQOY · MOH 268 Standard Compliant
        </div>
      </div>
    </div>
  );
}

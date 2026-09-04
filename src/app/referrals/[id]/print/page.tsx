'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { initialReferrals, initialPatients, initialFacilities } from '@/db/mock-store';

export default function MOH268PrintSlipPage() {
  const params = useParams();
  const router = useRouter();
  const referralId = params.id ? parseInt(params.id as string) : 1;

  const referral = initialReferrals.find((r) => r.id === referralId) || initialReferrals[0];
  const patient = initialPatients.find((p) => p.id === referral.patientId) || initialPatients[0];
  const referringFacility = initialFacilities.find((f) => f.id === referral.referringFacilityId) || initialFacilities[0];
  const receivingFacility = initialFacilities.find((f) => f.id === referral.receivingFacilityId) || initialFacilities[1];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 text-slate-900 font-sans print:p-0 print:bg-white">
      {/* Non-printable action bar */}
      <div className="max-w-3xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold hover:bg-slate-50 flex items-center gap-2"
        >
          <Icon name="ArrowLeftIcon" size={14} variant="outline" />
          Back to Referrals
        </button>

        <button
          onClick={handlePrint}
          className="px-5 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold shadow-md hover:bg-teal-700 flex items-center gap-2"
        >
          <Icon name="PrinterIcon" size={16} variant="outline" />
          Print / Save PDF (MOH 268)
        </button>
      </div>

      {/* Official Kenya Ministry of Health Form MOH 268 Container */}
      <div className="max-w-3xl mx-auto bg-white border border-slate-300 p-8 rounded-2xl shadow-sm print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-600">
            Republic of Kenya · Ministry of Health
          </p>
          <h1 className="text-xl font-black uppercase text-slate-900 mt-1">
            Official Patient Referral Form (MOH 268)
          </h1>
          <p className="text-[11px] font-semibold text-slate-600 mt-0.5">
            Maternal & Neonatal Emergency Medical Transfer Handover Document
          </p>
          <div className="flex items-center justify-center gap-6 mt-3 text-xs font-mono">
            <span><strong>Referral Ref:</strong> {referral.referralCode}</span>
            <span><strong>Date & Time:</strong> {new Date(referral.initiatedAt).toLocaleString('en-GB')}</span>
            <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold border border-rose-300">
              URGENCY: {referral.urgencyLevel}
            </span>
          </div>
        </div>

        {/* Section 1: Facility Details */}
        <div className="grid grid-cols-2 gap-4 border border-slate-300 rounded-xl p-4 mb-5 bg-slate-50 text-xs">
          <div>
            <h3 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
              Referring Facility (Origin)
            </h3>
            <p className="font-black text-sm text-slate-900">{referringFacility.name}</p>
            <p className="text-slate-600">{referringFacility.subCounty}, {referringFacility.county} County</p>
            <p className="text-slate-600 font-mono">Facility Tier: {referringFacility.tier.replace(/_/g, ' ')}</p>
          </div>

          <div>
            <h3 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
              Receiving Facility (Destination)
            </h3>
            <p className="font-black text-sm text-teal-800">{receivingFacility.name}</p>
            <p className="text-slate-600">{receivingFacility.subCounty}, {receivingFacility.county} County</p>
            <p className="text-slate-600 font-mono">Triage Desk Line: {receivingFacility.emergencyPhone}</p>
          </div>
        </div>

        {/* Section 2: Patient Identification & Obstetric History */}
        <div className="border border-slate-300 rounded-xl p-4 mb-5 space-y-3 text-xs">
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1">
            1. Patient Clinical Profile
          </h3>
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
              <p className="font-black text-slate-900 text-sm">{patient.bloodType || 'O+'}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100">
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-semibold">Obstetric Status:</span>
              <p className="font-semibold text-slate-900">Gravida {patient.gravida || 2}, Para {patient.parity || 1}</p>
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

        {/* Section 3: Clinical Reason & Pre-Referral Treatment */}
        <div className="border border-slate-300 rounded-xl p-4 mb-5 space-y-3 text-xs">
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1">
            2. Clinical Indication & Pre-Referral Management
          </h3>

          <div>
            <span className="text-slate-500 text-[10px] uppercase font-semibold">Primary Diagnosis / Indication:</span>
            <p className="font-black text-rose-700 text-sm">{referral.clinicalIndication.replace(/_/g, ' ')}</p>
          </div>

          <div>
            <span className="text-slate-500 text-[10px] uppercase font-semibold">Pre-Referral Handover Note & Medication Given:</span>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 mt-1 font-mono text-[11px] text-slate-800 leading-relaxed">
              {referral.preArrivalHandoverNote || 'Patient administered Magnesium Sulphate 4g IV loading dose. BP 165/110. O- blood reserved.'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-semibold">ICU Bed Reserved:</span>
              <p className="font-bold text-slate-900">{referral.icuBedReserved ? '✅ YES (Maternal ICU Bed Pre-Allocated)' : 'NO'}</p>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-semibold">Blood Bank Allocation:</span>
              <p className="font-bold text-slate-900">{referral.bloodUnitsReserved} Units ({referral.bloodTypeReserved || 'O-'})</p>
            </div>
          </div>
        </div>

        {/* Section 4: Transport & Handover Sign-off */}
        <div className="border border-slate-300 rounded-xl p-4 mb-6 space-y-4 text-xs">
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1">
            3. Transport & Sign-off Certification
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-semibold">Ambulance Callsign:</span>
              <p className="font-bold text-slate-900">{referral.ambulanceCallSign || 'MEDIC-ALPHA-04'}</p>
              <p className="text-[10px] text-slate-500">Dispatch ID: {referral.transportDispatchId || 'DISPATCH-8831'}</p>
            </div>

            <div>
              <span className="text-slate-500 text-[10px] uppercase font-semibold">Estimated Transit Time:</span>
              <p className="font-bold text-slate-900">~{referral.estimatedTransitMinutes || 18} Minutes</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200">
            <div className="space-y-4">
              <p className="font-bold text-slate-700">Referring Officer (Midwife/Doctor):</p>
              <div className="border-b border-slate-400 pb-1">Name: Nurse Kamau (RN/KNC-88421)</div>
              <div className="border-b border-slate-400 pb-1">Signature: ______________________</div>
            </div>

            <div className="space-y-4">
              <p className="font-bold text-slate-700">Receiving Triage Officer (Hospital):</p>
              <div className="border-b border-slate-400 pb-1">Name: Sister Grace Ochieng</div>
              <div className="border-b border-slate-400 pb-1">Signature: ______________________</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[10px] text-slate-400 border-t border-slate-200 pt-3">
          Generated automatically by SEQOY Maternal Health & Hospital Capacity Network · MOH 268 Standard Compliant
        </div>
      </div>
    </div>
  );
}

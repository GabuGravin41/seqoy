'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'sonner';

interface PrimaryClinic {
  id: string;
  name: string;
  mflCode: string;
  subCounty: string;
  cadre: string;
  inCharge: string;
  phone: string;
  enrolledMothersCount: number;
  criticalCasesCount: number;
  assignedReferralHospital: string;
  distanceToReferralKm: number;
}

const PRIMARY_CLINICS: PrimaryClinic[] = [
  {
    id: 'clinic-1',
    name: 'Kangemi Health Centre',
    mflCode: 'MFL-13044',
    subCounty: 'Westlands Sub-County',
    cadre: 'Level 3 Maternity Clinic',
    inCharge: 'Nurse Kamau (RN/KNC-88421)',
    phone: '+254 722 101 202',
    enrolledMothersCount: 42,
    criticalCasesCount: 3,
    assignedReferralHospital: 'Pumwani Maternity Hospital (Level 5)',
    distanceToReferralKm: 12.4,
  },
  {
    id: 'clinic-2',
    name: 'Riruta Health Centre',
    mflCode: 'MFL-13088',
    subCounty: 'Dagoretti South',
    cadre: 'Level 3 Primary Clinic',
    inCharge: 'Nurse Eunice Wambui',
    phone: '+254 733 202 303',
    enrolledMothersCount: 38,
    criticalCasesCount: 2,
    assignedReferralHospital: 'Mama Lucy Kibaki Hospital (Level 5)',
    distanceToReferralKm: 14.1,
  },
  {
    id: 'clinic-3',
    name: 'Westlands Dispensary',
    mflCode: 'MFL-13110',
    subCounty: 'Westlands Sub-County',
    cadre: 'Level 2 Maternity Dispensary',
    inCharge: 'Clinical Officer Omwamba',
    phone: '+254 711 303 404',
    enrolledMothersCount: 29,
    criticalCasesCount: 1,
    assignedReferralHospital: 'Mbagathi County Hospital (Level 5)',
    distanceToReferralKm: 8.7,
  },
  {
    id: 'clinic-4',
    name: 'Kibera Community Health Centre',
    mflCode: 'MFL-13155',
    subCounty: 'Kibra Sub-County',
    cadre: 'Level 3 Comprehensive Clinic',
    inCharge: 'Nurse Brenda Achieng',
    phone: '+254 720 404 505',
    enrolledMothersCount: 54,
    criticalCasesCount: 4,
    assignedReferralHospital: 'Pumwani Maternity Hospital (Level 5)',
    distanceToReferralKm: 10.2,
  },
  {
    id: 'clinic-5',
    name: 'Waithaka Health Centre',
    mflCode: 'MFL-13192',
    subCounty: 'Dagoretti South',
    cadre: 'Level 3 Maternity Clinic',
    inCharge: 'Nurse Mercy Nduta',
    phone: '+254 728 505 606',
    enrolledMothersCount: 31,
    criticalCasesCount: 0,
    assignedReferralHospital: 'Kiambu Level 5 Hospital',
    distanceToReferralKm: 16.5,
  },
];

export default function PrimaryClinicsPage() {
  const [search, setSearch] = useState('');

  const filtered = PRIMARY_CLINICS.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.subCounty.toLowerCase().includes(search.toLowerCase()) ||
    c.mflCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="px-6 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary pulse-dot" />
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Primary Antenatal Care Network
              </span>
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight mt-1">
              Primary Maternity Clinics
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Level 2 and Level 3 primary health facilities managing first-line maternal care and USSD registration corridors.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search primary clinic or MFL..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field text-xs pl-8 w-64"
              />
              <Icon
                name="MagnifyingGlassIcon"
                size={14}
                variant="outline"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
            </div>
          </div>
        </div>

        {/* Clinics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((clinic) => (
            <div
              key={clinic.id}
              className="bg-card border border-border rounded-2xl p-5 card-glow-primary flex flex-col justify-between space-y-4 hover:border-primary/40 transition"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{clinic.name}</h3>
                    <p className="text-[11px] text-primary font-mono mt-0.5">{clinic.mflCode}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground border border-border">
                    {clinic.subCounty}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="p-2.5 bg-muted/40 rounded-xl border border-border">
                    <span className="stat-label text-[10px]">Enrolled Mothers</span>
                    <p className="text-lg font-bold text-foreground mt-0.5">{clinic.enrolledMothersCount}</p>
                  </div>
                  <div className="p-2.5 bg-muted/40 rounded-xl border border-border">
                    <span className="stat-label text-[10px]">Critical Alerts</span>
                    <p className="text-lg font-bold text-critical mt-0.5">{clinic.criticalCasesCount}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Midwife-in-Charge:</span>
                    <span className="font-semibold text-foreground">{clinic.inCharge}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Direct Contact:</span>
                    <span className="font-mono text-foreground font-semibold">{clinic.phone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Referral Link:</span>
                    <span className="font-semibold text-primary truncate max-w-[140px]" title={clinic.assignedReferralHospital}>
                      {clinic.assignedReferralHospital}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                  ~{clinic.distanceToReferralKm} km to ICU
                </span>
                <button
                  onClick={() => {
                    toast.success(`Connected to ${clinic.name} ANC Midwife desk`);
                  }}
                  className="btn-secondary text-xs py-1 px-3"
                >
                  <Icon name="PhoneIcon" size={13} variant="outline" />
                  Call Clinic
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

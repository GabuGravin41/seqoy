'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import { initialFacilities, initialCapacities } from '@/db/mock-store';
import { toast } from 'sonner';

export default function ReferralFacilitiesPage() {
  const [search, setSearch] = useState('');

  const referralFacilities = initialFacilities
    .filter((f) => f.isReferralCenter)
    .map((facility) => {
      const cap = initialCapacities.find((c) => c.facilityId === facility.id) || {
        icuBedsTotal: 6,
        icuBedsAvailable: 2,
        hduBedsTotal: 8,
        hduBedsAvailable: 3,
        operatingTheatresTotal: 3,
        operatingTheatresAvailable: 1,
        maternityBedsAvailable: 15,
        bloodStock: { 'O+': 8, 'O-': 2, 'A+': 4, 'B+': 3, 'AB+': 1 },
      };
      return {
        ...facility,
        capacity: cap,
      };
    });

  const filteredHospitals = referralFacilities.filter((h) => {
    const matchesSearch =
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.subCounty.toLowerCase().includes(search.toLowerCase()) ||
      h.county.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <AppLayout>
      <div className="px-6 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary pulse-dot" />
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Tertiary & Secondary Referral Network
              </span>
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight mt-1">
              Referral Hospitals Directory
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live maternal ICU readiness, operating theatre availability, and emergency referral corridors across Nairobi Metro.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search referral hospital..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field text-xs pl-8 w-60"
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

        {/* Hospital Directory Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredHospitals.map((hospital) => {
            const hasIcu = hospital.capacity.icuBedsAvailable > 0;
            const isCritical = !hasIcu;

            return (
              <div
                key={hospital.id}
                className="bg-card border border-border rounded-2xl p-5 card-glow-primary flex flex-col justify-between space-y-4 hover:border-primary/40 transition"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-foreground">
                          {hospital.name}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                          {hospital.tier.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                        <Icon name="MapPinIcon" size={13} variant="outline" />
                        {hospital.subCounty}, {hospital.county} County
                      </p>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        isCritical
                          ? 'bg-critical/10 text-critical border border-critical/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {isCritical ? '🔴 ICU At Capacity' : '🟢 Accepting Referrals'}
                    </span>
                  </div>

                  {/* Bed & Theatre Capacity Grid */}
                  <div className="grid grid-cols-3 gap-2.5 mt-4">
                    <div className="p-3 bg-muted/40 rounded-xl border border-border">
                      <span className="stat-label text-[10px]">Maternal ICU</span>
                      <p className="text-lg font-bold text-foreground mt-1">
                        <span className={hospital.capacity.icuBedsAvailable === 0 ? 'text-critical' : 'text-emerald-400'}>
                          {hospital.capacity.icuBedsAvailable}
                        </span>
                        <span className="text-xs text-muted-foreground font-normal"> / {hospital.capacity.icuBedsTotal}</span>
                      </p>
                    </div>

                    <div className="p-3 bg-muted/40 rounded-xl border border-border">
                      <span className="stat-label text-[10px]">Maternal HDU</span>
                      <p className="text-lg font-bold text-foreground mt-1">
                        <span className="text-emerald-400">{hospital.capacity.hduBedsAvailable}</span>
                        <span className="text-xs text-muted-foreground font-normal"> / {hospital.capacity.hduBedsTotal}</span>
                      </p>
                    </div>

                    <div className="p-3 bg-muted/40 rounded-xl border border-border">
                      <span className="stat-label text-[10px]">Theatres</span>
                      <p className="text-lg font-bold text-foreground mt-1">
                        <span className={hospital.capacity.operatingTheatresAvailable === 0 ? 'text-amber-400' : 'text-emerald-400'}>
                          {hospital.capacity.operatingTheatresAvailable}
                        </span>
                        <span className="text-xs text-muted-foreground font-normal"> / {hospital.capacity.operatingTheatresTotal}</span>
                      </p>
                    </div>
                  </div>

                  {/* On Duty Clinical Staff & Emergency Blood */}
                  <div className="mt-4 pt-3 border-t border-border space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Icon name="HeartIcon" size={14} variant="outline" className="text-rose-400" />
                        Blood Bank O- Units:
                      </span>
                      <span className="font-semibold text-foreground">{hospital.capacity.bloodStock['O-'] || 0} Units Available</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Icon name="PhoneIcon" size={14} variant="outline" className="text-emerald-400" />
                        Triage Desk Direct Line:
                      </span>
                      <span className="font-mono text-primary font-semibold">{hospital.emergencyPhone}</span>
                    </div>
                  </div>
                </div>

                {/* Action footer */}
                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">
                    Direct ambulance handover ready
                  </span>
                  <button
                    onClick={() => {
                      toast.info(`Pre-alerting ${hospital.name} Triage Desk...`, {
                        description: `Direct hotline ${hospital.emergencyPhone} connected.`,
                      });
                    }}
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    <Icon name="PhoneArrowUpRightIcon" size={13} variant="outline" />
                    Pre-Alert Triage
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import { toast } from 'sonner';
import { useCurrentUser } from '@/context/AuthContext';

interface Hospital {
  id: string;
  facilityId: number;
  name: string;
  shortName: string;
  tier: 'National' | 'County' | 'Private';
  distance: string;
  icuAvailable: number;
  icuTotal: number;
  hduAvailable: number;
  hduTotal: number;
  theatreStatus: 'READY' | 'OCCUPIED' | 'MAINTENANCE';
  theatreTeams: number;
  emergencySpecialists: number;
  readinessScore: number;
  lastUpdated: string;
  overallStatus: 'AVAILABLE' | 'LIMITED' | 'FULL' | 'OFFLINE';
  oNegativeUnits: number;
  acceptingReferrals: boolean;
  /** Delay 3: is this number coming from the hospital's own EHR/HIMS webhook, or typed in manually? */
  syncMode?: 'EHR_WEBHOOK' | 'MANUAL';
}

const defaultHospitals: Hospital[] = [
  {
    id: 'hosp-001',
    facilityId: 3,
    name: 'Kenyatta National Hospital',
    shortName: 'KNH',
    tier: 'National',
    distance: '4.2 km',
    icuAvailable: 0,
    icuTotal: 24,
    hduAvailable: 2,
    hduTotal: 18,
    theatreStatus: 'OCCUPIED',
    theatreTeams: 0,
    emergencySpecialists: 1,
    readinessScore: 12,
    lastUpdated: '2 min ago',
    overallStatus: 'FULL',
    oNegativeUnits: 0,
    acceptingReferrals: false,
  },
  {
    id: 'hosp-002',
    facilityId: 2,
    name: 'Pumwani Maternity Hospital',
    shortName: 'Pumwani',
    tier: 'County',
    distance: '6.8 km',
    icuAvailable: 4,
    icuTotal: 12,
    hduAvailable: 6,
    hduTotal: 14,
    theatreStatus: 'READY',
    theatreTeams: 2,
    emergencySpecialists: 3,
    readinessScore: 78,
    lastUpdated: '1 min ago',
    overallStatus: 'AVAILABLE',
    oNegativeUnits: 8,
    acceptingReferrals: true,
  },
  {
    id: 'hosp-003',
    facilityId: 6,
    name: 'Mama Lucy Kibaki Hospital',
    shortName: 'Mama Lucy',
    tier: 'County',
    distance: '11.4 km',
    icuAvailable: 2,
    icuTotal: 10,
    hduAvailable: 3,
    hduTotal: 10,
    theatreStatus: 'READY',
    theatreTeams: 1,
    emergencySpecialists: 2,
    readinessScore: 54,
    lastUpdated: '4 min ago',
    overallStatus: 'LIMITED',
    oNegativeUnits: 1,
    acceptingReferrals: true,
  },
  {
    id: 'hosp-004',
    facilityId: 4,
    name: 'Kiambu County Referral Hospital',
    shortName: 'Kiambu Level 5',
    tier: 'County',
    distance: '14.2 km',
    icuAvailable: 5,
    icuTotal: 8,
    hduAvailable: 6,
    hduTotal: 8,
    theatreStatus: 'READY',
    theatreTeams: 3,
    emergencySpecialists: 4,
    readinessScore: 91,
    lastUpdated: '3 min ago',
    overallStatus: 'AVAILABLE',
    oNegativeUnits: 6,
    acceptingReferrals: true,
  },
  {
    id: 'hosp-005',
    facilityId: 5,
    name: 'Mbagathi County Hospital',
    shortName: 'Mbagathi',
    tier: 'County',
    distance: '9.1 km',
    icuAvailable: 1,
    icuTotal: 6,
    hduAvailable: 2,
    hduTotal: 6,
    theatreStatus: 'READY',
    theatreTeams: 1,
    emergencySpecialists: 2,
    readinessScore: 62,
    lastUpdated: '6 min ago',
    overallStatus: 'LIMITED',
    oNegativeUnits: 2,
    acceptingReferrals: true,
  },
];

function ReadinessBar({ score }: { score: number }) {
  const color = score >= 70 ? 'bg-primary' : score >= 40 ? 'bg-moderate' : 'bg-critical';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-tabular font-semibold text-foreground w-7 text-right">{score}</span>
    </div>
  );
}

function BedIndicator({ available, total, label }: { available: number; total: number; label: string }) {
  const pct = total > 0 ? (available / total) * 100 : 0;
  const textColor = available === 0 ? 'text-critical' : available <= 2 ? 'text-moderate' : 'text-primary';
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1">
        <span className={`text-sm font-bold font-tabular ${textColor}`}>{available}</span>
        <span className="text-xs text-muted-foreground">/ {total}</span>
        <div className="w-12 h-1 bg-muted rounded-full overflow-hidden ml-1">
          <div
            className={`h-full rounded-full ${pct === 0 ? 'bg-critical' : pct <= 25 ? 'bg-moderate' : 'bg-primary'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

const theatreIcons: Record<Hospital['theatreStatus'], string> = {
  READY: 'CheckCircleIcon',
  OCCUPIED: 'ClockIcon',
  MAINTENANCE: 'WrenchScrewdriverIcon',
};

const theatreColors: Record<Hospital['theatreStatus'], string> = {
  READY: 'text-primary',
  OCCUPIED: 'text-accent',
  MAINTENANCE: 'text-moderate',
};

const tierColors: Record<Hospital['tier'], string> = {
  National: 'bg-info/15 text-info',
  County: 'bg-primary/15 text-primary',
  Private: 'bg-accent/15 text-accent',
};

export default function CapacityBentoGrid() {
  const currentUser = useCurrentUser();
  const [hospitals, setHospitals] = useState<Hospital[]>(defaultHospitals);

  const handleAdjustBed = (hospitalId: string, delta: number) => {
    setHospitals((prev) =>
      prev.map((h) => {
        if (h.id === hospitalId) {
          const newAvail = Math.max(0, Math.min(h.icuTotal, h.icuAvailable + delta));
          const isFull = newAvail === 0;
          const isLimited = newAvail <= 2;
          return {
            ...h,
            icuAvailable: newAvail,
            overallStatus: isFull ? 'FULL' : isLimited ? 'LIMITED' : 'AVAILABLE',
            acceptingReferrals: !isFull,
            readinessScore: isFull ? 12 : Math.min(95, 40 + newAvail * 10 + h.oNegativeUnits * 3),
          };
        }
        return h;
      })
    );
    toast.success('Hospital ICU capacity updated');
  };
  const [dispatchModal, setDispatchModal] = useState<Hospital | null>(null);
  const [dispatching, setDispatching] = useState(false);
  const [patientName, setPatientName] = useState('Wanjiku Muthoni');
  const [referralReason, setReferralReason] = useState('preeclampsia');

  const fetchLiveGrid = async () => {
    try {
      const res = await fetch('/api/hospitals/capacity?referringClinicId=1');
      if (res.ok) {
        const data = await res.json();
        if (data.capacities?.length) {
          const mapped: Hospital[] = data.capacities.map((c: any) => {
            const isFull = c.icuBedsAvailable === 0;
            const isLimited = c.icuBedsAvailable <= 2;
            const oNeg = c.bloodStock?.['O-'] || 0;
            const readiness = isFull ? 12 : Math.min(95, 40 + c.icuBedsAvailable * 10 + oNeg * 3);

            return {
              id: `hosp-${c.facilityId}`,
              facilityId: c.facilityId,
              name: c.facilityName,
              shortName: c.facilityName.split(' ')[0],
              tier: c.facilityTier?.includes('NATIONAL') ? 'National' : 'County',
              distance: `${c.distanceKm || 5} km`,
              icuAvailable: c.icuBedsAvailable,
              icuTotal: c.icuBedsTotal,
              hduAvailable: c.hduBedsAvailable,
              hduTotal: c.hduBedsTotal,
              theatreStatus: c.theatreReadinessStatus === 'READY' ? 'READY' : 'OCCUPIED',
              theatreTeams: c.operatingTheatresAvailable,
              emergencySpecialists: c.obstetricianOnDuty ? 3 : 0,
              readinessScore: readiness,
              lastUpdated: 'Just now',
              overallStatus: isFull ? 'FULL' : isLimited ? 'LIMITED' : 'AVAILABLE',
              oNegativeUnits: oNeg,
              acceptingReferrals: !isFull,
              syncMode: c.syncMode,
            };
          });
          setHospitals(mapped);
        }
      }
    } catch (e) {
      console.warn('Using local capacity state', e);
    }
  };

  useEffect(() => {
    fetchLiveGrid();
  }, []);

  const handleDispatch = async () => {
    if (!dispatchModal) return;
    setDispatching(true);

    try {
      const res = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: 1,
          referringFacilityId: 1,
          receivingFacilityId: dispatchModal.facilityId,
          clinicalIndication: referralReason.toUpperCase(),
          urgencyLevel: 'CRITICAL_STAT',
          icuBedReserved: true,
          theatreReserved: true,
          bloodUnitsReserved: 2,
        }),
      });

      const data = await res.json();

      setDispatching(false);
      setDispatchModal(null);

      if (!res.ok) {
        toast.error(data.error || 'Failed to send referral');
        return;
      }

      toast.success(`Referral sent to ${dispatchModal.name}`, {
        description: data.message || `${dispatchModal.name} has confirmed capacity and will be notified.`,
      });

      fetchLiveGrid();
    } catch (e) {
      setDispatching(false);
      toast.error('Failed to send referral');
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {hospitals.map((h) => {
          const isUnavailable = !h.acceptingReferrals;
          return (
            <div
              key={h.id}
              className={`bg-card border rounded-xl p-5 flex flex-col gap-4 transition-all duration-150 hover:border-primary/30 ${
                isUnavailable
                  ? 'border-critical/20 opacity-80'
                  : h.overallStatus === 'LIMITED'
                  ? 'border-accent/20'
                  : 'border-border'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${tierColors[h.tier]}`}>
                      {h.tier}
                    </span>
                    <StatusBadge status={h.overallStatus} />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mt-1.5 truncate">{h.name}</h3>
                  <p className="text-xs text-muted-foreground">{h.distance} from clinic</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-xs text-muted-foreground">Readiness</p>
                  <p
                    className={`text-xl font-bold font-tabular ${
                      h.readinessScore >= 70
                        ? 'text-primary'
                        : h.readinessScore >= 40
                        ? 'text-moderate'
                        : 'text-critical'
                    }`}
                  >
                    {h.readinessScore}
                  </p>
                </div>
              </div>

              {/* Readiness bar */}
              <ReadinessBar score={h.readinessScore} />

              {/* Bed counts */}
              <div className="space-y-2">
                <BedIndicator available={h.icuAvailable} total={h.icuTotal} label="ICU Beds" />
                <BedIndicator available={h.hduAvailable} total={h.hduTotal} label="HDU Beds" />
              </div>

              {/* Theatre + Specialists */}
              <div className="flex items-center justify-between border-t border-border pt-3">
                <div className="flex items-center gap-1.5">
                  <Icon
                    name={theatreIcons[h.theatreStatus] as Parameters<typeof Icon>[0]['name']}
                    size={14}
                    variant="outline"
                    className={theatreColors[h.theatreStatus]}
                  />
                  <span className="text-xs text-muted-foreground">Theatre</span>
                  <span className={`text-xs font-semibold ${theatreColors[h.theatreStatus]}`}>
                    {h.theatreStatus === 'READY'
                      ? `${h.theatreTeams} team${h.theatreTeams !== 1 ? 's' : ''} ready`
                      : h.theatreStatus === 'OCCUPIED'
                      ? 'In use'
                      : 'Maintenance'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Icon name="UserIcon" size={14} variant="outline" className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">OB Specialists:</span>
                  <span
                    className={`text-xs font-semibold ${
                      h.emergencySpecialists === 0 ? 'text-critical' : 'text-foreground'
                    }`}
                  >
                    {h.emergencySpecialists}
                  </span>
                </div>
              </div>

              {/* O-Neg + last updated */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Icon name="BeakerIcon" size={13} variant="outline" className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">O-Neg:</span>
                  <span
                    className={`text-xs font-bold font-tabular ${
                      h.oNegativeUnits === 0
                        ? 'text-critical'
                        : h.oNegativeUnits <= 2
                        ? 'text-moderate'
                        : 'text-primary'
                    }`}
                  >
                    {h.oNegativeUnits === 0 ? 'OUT OF STOCK' : `${h.oNegativeUnits} units`}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                    h.syncMode === 'EHR_WEBHOOK' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                  }`}
                  title={h.syncMode === 'EHR_WEBHOOK' ? 'Synced automatically from this hospital\'s EHR' : 'Updated manually by hospital staff'}
                >
                  {h.syncMode === 'EHR_WEBHOOK' ? 'EHR-synced' : 'Manual update'} · {h.lastUpdated}
                </span>
              </div>

              {/* Bed Manager Capacity Controls vs Midwife Dispatch */}
              {currentUser.permissions.canUpdateCapacity ? (
                <div className="flex items-center gap-2 bg-muted/40 p-1.5 rounded-lg border border-border">
                  <span className="text-[11px] text-muted-foreground font-medium flex-1">
                    Manage ICU Beds:
                  </span>
                  <button
                    onClick={() => handleAdjustBed(h.id, -1)}
                    disabled={h.icuAvailable <= 0}
                    className="w-7 h-7 bg-muted hover:bg-muted/80 disabled:opacity-30 rounded text-xs font-bold text-foreground flex items-center justify-center border border-border"
                    title="Mark 1 ICU bed occupied"
                  >
                    -1
                  </button>
                  <span className="text-xs font-bold font-tabular text-primary px-1">
                    {h.icuAvailable}
                  </span>
                  <button
                    onClick={() => handleAdjustBed(h.id, 1)}
                    disabled={h.icuAvailable >= h.icuTotal}
                    className="w-7 h-7 bg-primary/20 hover:bg-primary/30 disabled:opacity-30 rounded text-xs font-bold text-primary flex items-center justify-center border border-primary/30"
                    title="Mark 1 ICU bed available"
                  >
                    +1
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => !isUnavailable && setDispatchModal(h)}
                  disabled={isUnavailable}
                  className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all duration-150 active:scale-95 ${
                    isUnavailable
                      ? 'bg-muted text-muted-foreground cursor-not-allowed'
                      : 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20'
                  }`}
                >
                  <Icon name="ArrowsRightLeftIcon" size={14} variant="outline" />
                  {isUnavailable ? 'Not Accepting Referrals' : 'Refer Patient to This Facility'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Dispatch Modal */}
      <Modal
        open={!!dispatchModal}
        onClose={() => setDispatchModal(null)}
        title="Refer Patient to This Facility"
        description={`Send a Delay-3 referral to ${dispatchModal?.name} — no ambulance is dispatched by SEQOY; onward transport is arranged separately`}
        size="md"
      >
        {dispatchModal && (
          <div className="space-y-4">
            <div className="bg-muted/40 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Destination</span>
                <span className="font-semibold text-foreground">{dispatchModal.name}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">ICU Beds Available</span>
                <span
                  className={`font-bold font-tabular ${
                    dispatchModal.icuAvailable === 0 ? 'text-critical' : 'text-primary'
                  }`}
                >
                  {dispatchModal.icuAvailable}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Distance</span>
                <span className="font-semibold text-foreground">{dispatchModal.distance}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Readiness Score</span>
                <span className="font-bold font-tabular text-primary">{dispatchModal.readinessScore}/100</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Patient Name
              </label>
              <input
                className="input-field text-xs"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="e.g. Wanjiku Muthoni"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Referral Reason
              </label>
              <select
                className="input-field text-xs"
                value={referralReason}
                onChange={(e) => setReferralReason(e.target.value)}
              >
                <option value="pph">Postpartum Hemorrhage (PPH)</option>
                <option value="preeclampsia">Severe Preeclampsia</option>
                <option value="eclampsia">Eclampsia</option>
                <option value="sepsis">Maternal Sepsis</option>
                <option value="obstructed">Obstructed Labour</option>
              </select>
            </div>

            <div className="bg-info/10 border border-info/20 rounded-lg p-3 flex items-start gap-2">
              <Icon
                name="InformationCircleIcon"
                size={16}
                variant="outline"
                className="text-info flex-shrink-0 mt-0.5"
              />
              <p className="text-xs text-info/90 leading-relaxed">
                {dispatchModal.shortName} will see this referral immediately with the reserved ICU bed, theatre, and blood units confirmed. Transport to the facility is arranged separately — SEQOY does not dispatch ambulances.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setDispatchModal(null)} className="btn-secondary flex-1 text-xs">
                Cancel
              </button>
              <button onClick={handleDispatch} disabled={dispatching} className="btn-primary flex-1 text-xs">
                {dispatching ? (
                  <>
                    <Icon name="ArrowPathIcon" size={14} variant="outline" className="animate-spin" />
                    Sending Referral...
                  </>
                ) : (
                  <>
                    <Icon name="ArrowsRightLeftIcon" size={14} variant="outline" />
                    Send Referral
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

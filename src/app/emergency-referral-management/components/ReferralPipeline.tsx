'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import StatusBadge from '@/components/ui/StatusBadge';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface ActiveReferral {
  id: string;
  patient: string;
  reason: string;
  destination: string;
  stage: 'DISPATCHED' | 'IN_TRANSIT' | 'ARRIVED' | 'COMPLETED';
  eta: string;
  bloodType: string;
  dispatchedAt: string;
}

const initialActiveReferrals: ActiveReferral[] = [
  {
    id: 'SEQ-REF-2026-001',
    patient: 'Amina Wanjiku Mwangi',
    reason: 'Severe Preeclampsia',
    destination: 'Kiambu County Referral Hospital',
    stage: 'IN_TRANSIT',
    eta: '~18 min',
    bloodType: 'O-',
    dispatchedAt: '16:21 EAT',
  },
  {
    id: 'SEQ-REF-2026-002',
    patient: 'Achieng Otieno',
    reason: 'Postpartum Hemorrhage',
    destination: 'Pumwani Maternity Hospital',
    stage: 'IN_TRANSIT',
    eta: '~12 min',
    bloodType: 'A-',
    dispatchedAt: '16:10 EAT',
  },
  {
    id: 'SEQ-REF-2026-003',
    patient: 'Njeri Kamau',
    reason: 'Maternal Sepsis',
    destination: 'Mama Lucy Kibaki Hospital',
    stage: 'DISPATCHED',
    eta: '~25 min',
    bloodType: 'B+',
    dispatchedAt: '16:28 EAT',
  },
];

const stages = ['DISPATCHED', 'IN_TRANSIT', 'ARRIVED', 'COMPLETED'] as const;

const stageIcons: Record<string, string> = {
  DISPATCHED: 'TruckIcon',
  IN_TRANSIT: 'MapPinIcon',
  ARRIVED: 'BuildingOffice2Icon',
  COMPLETED: 'CheckCircleIcon',
};

function StageProgress({ current }: { current: ActiveReferral['stage'] }) {
  const currentIdx = stages.indexOf(current);
  return (
    <div className="flex items-center gap-0 my-2">
      {stages.map((stage, idx) => {
        const isCompleted = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        return (
          <React.Fragment key={`stage-${stage}`}>
            <div
              className={`flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all ${
                isCompleted
                  ? 'bg-primary border-primary text-primary-foreground'
                  : isCurrent
                  ? 'border-primary text-primary bg-primary/10'
                  : 'border-border text-muted-foreground bg-muted/30'
              }`}
            >
              <Icon
                name={stageIcons[stage] as Parameters<typeof Icon>[0]['name']}
                size={12}
                variant={isCompleted ? 'solid' : 'outline'}
              />
            </div>
            {idx < stages.length - 1 && (
              <div
                className={`h-0.5 flex-1 min-w-[20px] transition-all ${
                  idx < currentIdx ? 'bg-primary' : 'bg-border'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function ReferralPipeline() {
  const { currentUser } = useAuth();
  const [referrals, setReferrals] = useState<ActiveReferral[]>(initialActiveReferrals);

  const handleAdvanceStage = (refId: string) => {
    setReferrals((prev) =>
      prev.map((r) => {
        if (r.id === refId) {
          const currentIdx = stages.indexOf(r.stage);
          const nextStage = stages[Math.min(stages.length - 1, currentIdx + 1)];
          return {
            ...r,
            stage: nextStage,
            eta: nextStage === 'ARRIVED' ? 'Arrived at Gate' : nextStage === 'COMPLETED' ? 'Admitted' : '~8 min',
          };
        }
        return r;
      })
    );
    toast.success(`Referral ${refId} status advanced`);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5 card-glow-primary h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="section-header text-base">Active Transfer Pipeline</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Live telemetry of in-flight emergency ambulances</p>
        </div>
        <div className="flex items-center gap-2">
          {currentUser.permissions.canUpdateAmbulanceStatus && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
              🚑 Paramedic Unit MEDIC-04
            </span>
          )}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-primary pulse-dot" />
            Live
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {referrals.map((ref) => (
          <div
            key={ref.id}
            className="bg-muted/30 border border-border/60 rounded-xl p-4 hover:border-primary/20 transition-colors"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-mono text-muted-foreground">{ref.id}</span>
                  <span className="px-2 py-0.5 bg-critical/10 text-critical text-[10px] font-semibold rounded-full">
                    {ref.reason}
                  </span>
                  <span className="px-2 py-0.5 bg-secondary text-secondary-foreground text-[10px] rounded-full font-tabular font-bold">
                    {ref.bloodType}
                  </span>
                </div>
                <p className="text-xs font-bold text-foreground mt-1">{ref.patient}</p>
                <p className="text-[11px] text-muted-foreground">→ {ref.destination}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <StatusBadge status={ref.stage} />
                <p className="text-xs text-muted-foreground mt-1">
                  ETA: <span className="font-semibold text-foreground font-tabular">{ref.eta}</span>
                </p>
                <p className="text-[10px] text-muted-foreground">Dispatched {ref.dispatchedAt}</p>
              </div>
            </div>

            <StageProgress current={ref.stage} />

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/40 text-[11px]">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Icon name="TruckIcon" size={13} variant="outline" className="text-primary" />
                <span>Emergency ambulance assigned</span>
              </div>
              <div className="flex items-center gap-1 text-info">
                <Icon name="DocumentCheckIcon" size={13} variant="outline" />
                <span>Pre-arrival EHR transmitted</span>
              </div>
            </div>

            {/* Paramedic Live Driver Telemetry Controls */}
            {currentUser.permissions.canUpdateAmbulanceStatus && (
              <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between gap-2">
                <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                  <Icon name="SignalIcon" size={12} variant="outline" />
                  Live Ambulance Telemetry:
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => toast.success(`In-transit vitals transmitted to ${ref.destination} (BP 160/105, O2 98%)`)}
                    className="btn-secondary text-[11px] py-1 px-2.5"
                  >
                    Transmit Vitals
                  </button>
                  <button
                    onClick={() => handleAdvanceStage(ref.id)}
                    disabled={ref.stage === 'COMPLETED'}
                    className="btn-primary text-[11px] py-1 px-2.5"
                  >
                    {ref.stage === 'DISPATCHED'
                      ? 'Confirm Patient Loaded'
                      : ref.stage === 'IN_TRANSIT'
                      ? 'Mark Arrived at Hospital'
                      : ref.stage === 'ARRIVED'
                      ? 'Complete Handover'
                      : 'Completed'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

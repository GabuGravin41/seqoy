'use client';

import React, { useEffect, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import StatusBadge from '@/components/ui/StatusBadge';
import { useCurrentUser } from '@/context/AuthContext';
import { toast } from 'sonner';

interface ActiveReferral {
  id: number;
  referralCode: string;
  patientName?: string;
  clinicalIndication: string;
  receivingFacilityName?: string;
  bloodTypeReserved?: string;
  status: 'REQUESTED' | 'ACKNOWLEDGED' | 'ACCEPTED' | 'ADMITTED' | 'COMPLETED' | 'DECLINED';
  initiatedAt: string;
}

const stages = ['REQUESTED', 'ACKNOWLEDGED', 'ACCEPTED', 'ADMITTED'] as const;

const stageIcons: Record<string, string> = {
  REQUESTED: 'PaperAirplaneIcon',
  ACKNOWLEDGED: 'EyeIcon',
  ACCEPTED: 'CheckCircleIcon',
  ADMITTED: 'BuildingOffice2Icon',
};

const nextStageLabel: Record<(typeof stages)[number], string> = {
  REQUESTED: 'Acknowledge Referral',
  ACKNOWLEDGED: 'Accept Patient',
  ACCEPTED: 'Confirm Admitted',
  ADMITTED: 'Admitted',
};

function StageProgress({ current }: { current: ActiveReferral['status'] }) {
  const currentIdx = Math.max(0, stages.indexOf(current as (typeof stages)[number]));
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
              <div className={`h-0.5 flex-1 min-w-[20px] transition-all ${idx < currentIdx ? 'bg-primary' : 'bg-border'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function ReferralPipeline() {
  const currentUser = useCurrentUser();
  const [referrals, setReferrals] = useState<ActiveReferral[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReferrals = async () => {
    try {
      const res = await fetch('/api/referrals');
      if (res.ok) {
        const data = await res.json();
        setReferrals((data.referrals ?? []).filter((r: ActiveReferral) => r.status !== 'COMPLETED' && r.status !== 'DECLINED'));
      }
    } catch (e) {
      console.warn('Failed to load referrals', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  const handleAdvance = async (referral: ActiveReferral) => {
    const currentIdx = stages.indexOf(referral.status as (typeof stages)[number]);
    const nextStatus = stages[Math.min(stages.length - 1, currentIdx + 1)];
    if (nextStatus === referral.status) return;

    try {
      const res = await fetch('/api/referrals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referralId: referral.id, status: nextStatus === 'ACCEPTED' ? 'ACCEPTED' : nextStatus }),
      });
      if (!res.ok) throw new Error('Update failed');
      toast.success(`Referral ${referral.referralCode} marked ${nextStatus}`);
      fetchReferrals();
    } catch (e) {
      toast.error('Failed to update referral status');
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5 card-glow-primary h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="section-header text-base">Active Facility Referrals</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Delay 3: referrals awaiting facility acknowledgement</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-primary pulse-dot" />
          Live
        </div>
      </div>

      <div className="space-y-3">
        {!loading && referrals.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8">No active referrals right now.</p>
        )}
        {referrals.map((ref) => (
          <div
            key={ref.id}
            className="bg-muted/30 border border-border/60 rounded-xl p-4 hover:border-primary/20 transition-colors"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-mono text-muted-foreground">{ref.referralCode}</span>
                  <span className="px-2 py-0.5 bg-critical/10 text-critical text-[10px] font-semibold rounded-full">
                    {ref.clinicalIndication}
                  </span>
                  {ref.bloodTypeReserved && (
                    <span className="px-2 py-0.5 bg-secondary text-secondary-foreground text-[10px] rounded-full font-tabular font-bold">
                      {ref.bloodTypeReserved}
                    </span>
                  )}
                </div>
                <p className="text-xs font-bold text-foreground mt-1">{ref.patientName ?? 'Enrolled Mother'}</p>
                <p className="text-[11px] text-muted-foreground">→ {ref.receivingFacilityName ?? 'Receiving facility'}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <StatusBadge status={ref.status} />
                <p className="text-[10px] text-muted-foreground mt-1">
                  {new Date(ref.initiatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            <StageProgress current={ref.status} />

            {currentUser.permissions.canAcknowledgeReferral && ref.status !== 'ADMITTED' && (
              <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-end gap-2">
                <button onClick={() => handleAdvance(ref)} className="btn-primary text-[11px] py-1 px-2.5">
                  {nextStageLabel[ref.status as (typeof stages)[number]] ?? 'Advance'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

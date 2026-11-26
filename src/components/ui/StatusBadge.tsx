import React from 'react';

type TriageLevel = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
type CapacityStatus = 'AVAILABLE' | 'LIMITED' | 'FULL' | 'OFFLINE';
type ReferralStatus = 'REQUESTED' | 'ACKNOWLEDGED' | 'ACCEPTED' | 'ADMITTED' | 'COMPLETED' | 'DECLINED' | 'DRAFT';

type BadgeVariant =
  | TriageLevel
  | CapacityStatus
  | ReferralStatus
  | 'ACTIVE'
  | 'INACTIVE'
  | 'READY'
  | 'OCCUPIED'
  | 'MAINTENANCE'
  | 'NORMAL'
  | 'ELEVATED_RISK'
  | 'CRITICAL_EMERGENCY';

const variantMap: Record<BadgeVariant, { bg: string; text: string; dot: string }> = {
  CRITICAL: { bg: 'bg-scarlet-soft', text: 'text-scarlet', dot: 'bg-scarlet' },
  CRITICAL_EMERGENCY: { bg: 'bg-scarlet-soft', text: 'text-scarlet', dot: 'bg-scarlet' },
  HIGH: { bg: 'bg-amber-50', text: 'text-amber-800', dot: 'bg-amber-600' },
  ELEVATED_RISK: { bg: 'bg-amber-50', text: 'text-amber-800', dot: 'bg-amber-600' },
  MODERATE: { bg: 'bg-amber-50', text: 'text-amber-800', dot: 'bg-amber-600' },
  LOW: { bg: 'bg-jungle-soft', text: 'text-jungle', dot: 'bg-jungle' },
  NORMAL: { bg: 'bg-jungle-soft', text: 'text-jungle', dot: 'bg-jungle' },
  AVAILABLE: { bg: 'bg-jungle-soft', text: 'text-jungle', dot: 'bg-jungle' },
  LIMITED: { bg: 'bg-amber-50', text: 'text-amber-800', dot: 'bg-amber-600' },
  FULL: { bg: 'bg-scarlet-soft', text: 'text-scarlet', dot: 'bg-scarlet' },
  OFFLINE: { bg: 'bg-muted', text: 'text-muted-foreground', dot: 'bg-muted-foreground' },
  REQUESTED: { bg: 'bg-secondary', text: 'text-foreground', dot: 'bg-foreground' },
  ACKNOWLEDGED: { bg: 'bg-amber-50', text: 'text-amber-800', dot: 'bg-amber-600' },
  ACCEPTED: { bg: 'bg-jungle-soft', text: 'text-jungle', dot: 'bg-jungle' },
  ADMITTED: { bg: 'bg-jungle-soft', text: 'text-jungle', dot: 'bg-jungle' },
  COMPLETED: { bg: 'bg-jungle-soft', text: 'text-jungle', dot: 'bg-jungle' },
  DECLINED: { bg: 'bg-scarlet-soft', text: 'text-scarlet', dot: 'bg-scarlet' },
  DRAFT: { bg: 'bg-muted', text: 'text-muted-foreground', dot: 'bg-muted-foreground' },
  ACTIVE: { bg: 'bg-jungle-soft', text: 'text-jungle', dot: 'bg-jungle' },
  INACTIVE: { bg: 'bg-muted', text: 'text-muted-foreground', dot: 'bg-muted-foreground' },
  READY: { bg: 'bg-jungle-soft', text: 'text-jungle', dot: 'bg-jungle' },
  OCCUPIED: { bg: 'bg-scarlet-soft', text: 'text-scarlet', dot: 'bg-scarlet' },
  MAINTENANCE: { bg: 'bg-amber-50', text: 'text-amber-800', dot: 'bg-amber-600' },
};

interface StatusBadgeProps {
  status: BadgeVariant;
  label?: string;
  showDot?: boolean;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, label, showDot = true, size = 'sm' }: StatusBadgeProps) {
  const styles = variantMap[status] ?? variantMap.OFFLINE;
  const displayLabel = label ?? status.replace(/_/g, ' ');

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md font-semibold tracking-tight ${styles.bg} ${styles.text} ${
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      }`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${styles.dot} flex-shrink-0`} />}
      {displayLabel}
    </span>
  );
}

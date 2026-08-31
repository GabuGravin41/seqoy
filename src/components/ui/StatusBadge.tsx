import React from 'react';

type TriageLevel = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
type CapacityStatus = 'AVAILABLE' | 'LIMITED' | 'FULL' | 'OFFLINE';
type ReferralStatus = 'DISPATCHED' | 'IN_TRANSIT' | 'ARRIVED' | 'COMPLETED' | 'FAILED' | 'DRAFT';

type BadgeVariant = TriageLevel | CapacityStatus | ReferralStatus | 'ACTIVE' | 'INACTIVE' | 'READY' | 'OCCUPIED' | 'MAINTENANCE';

const variantMap: Record<BadgeVariant, { bg: string; text: string; dot: string }> = {
  CRITICAL: { bg: 'bg-critical/15', text: 'text-critical', dot: 'bg-critical' },
  HIGH: { bg: 'bg-high/15', text: 'text-high', dot: 'bg-high' },
  MODERATE: { bg: 'bg-moderate/15', text: 'text-moderate', dot: 'bg-moderate' },
  LOW: { bg: 'bg-low/15', text: 'text-low', dot: 'bg-low' },
  AVAILABLE: { bg: 'bg-low/15', text: 'text-low', dot: 'bg-low' },
  LIMITED: { bg: 'bg-moderate/15', text: 'text-moderate', dot: 'bg-moderate' },
  FULL: { bg: 'bg-critical/15', text: 'text-critical', dot: 'bg-critical' },
  OFFLINE: { bg: 'bg-muted', text: 'text-muted-foreground', dot: 'bg-muted-foreground' },
  DISPATCHED: { bg: 'bg-info/15', text: 'text-info', dot: 'bg-info' },
  IN_TRANSIT: { bg: 'bg-high/15', text: 'text-high', dot: 'bg-high' },
  ARRIVED: { bg: 'bg-low/15', text: 'text-low', dot: 'bg-low' },
  COMPLETED: { bg: 'bg-low/15', text: 'text-low', dot: 'bg-low' },
  FAILED: { bg: 'bg-critical/15', text: 'text-critical', dot: 'bg-critical' },
  DRAFT: { bg: 'bg-muted', text: 'text-muted-foreground', dot: 'bg-muted-foreground' },
  ACTIVE: { bg: 'bg-low/15', text: 'text-low', dot: 'bg-low' },
  INACTIVE: { bg: 'bg-muted', text: 'text-muted-foreground', dot: 'bg-muted-foreground' },
  READY: { bg: 'bg-low/15', text: 'text-low', dot: 'bg-low' },
  OCCUPIED: { bg: 'bg-critical/15', text: 'text-critical', dot: 'bg-critical' },
  MAINTENANCE: { bg: 'bg-moderate/15', text: 'text-moderate', dot: 'bg-moderate' },
};

interface StatusBadgeProps {
  status: BadgeVariant;
  label?: string;
  showDot?: boolean;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, label, showDot = true, size = 'sm' }: StatusBadgeProps) {
  const styles = variantMap[status] ?? variantMap.OFFLINE;
  const displayLabel = label ?? status.replace('_', ' ');

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${styles.bg} ${styles.text} ${
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'
      }`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${styles.dot} flex-shrink-0`} />}
      {displayLabel}
    </span>
  );
}

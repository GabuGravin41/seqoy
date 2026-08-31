'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/LoadingSkeleton';

const ReferralVolumeChartInner = dynamic(() => import('./ReferralVolumeChartInner'), {
  ssr: false,
  loading: () => <Skeleton className="h-[240px] w-full" />,
});

export default function ReferralVolumeChart() {
  return (
    <div className="bg-card border border-border rounded-xl p-5 card-glow-primary h-full">
      <div className="mb-4">
        <h2 className="section-header text-base">Referrals by Indication (30d)</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Emergency volume by obstetric complication</p>
      </div>
      <ReferralVolumeChartInner />
    </div>
  );
}

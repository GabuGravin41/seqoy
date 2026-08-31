'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/LoadingSkeleton';

const CapacityTrendChartInner = dynamic(() => import('./CapacityTrendChartInner'), {
  ssr: false,
  loading: () => <Skeleton className="h-[240px] w-full" />,
});

export default function CapacityTrendChart() {
  return (
    <div className="bg-card border border-border rounded-xl p-5 card-glow-primary h-full">
      <div className="mb-4">
        <h2 className="section-header">ICU Bed Availability Trend (24h)</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Hourly bed availability across Pumwani, Kiambu Level 5, and KNH
        </p>
      </div>
      <CapacityTrendChartInner />
    </div>
  );
}

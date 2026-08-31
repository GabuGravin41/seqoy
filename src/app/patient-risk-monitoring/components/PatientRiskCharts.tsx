'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/LoadingSkeleton';

const RiskTrendChartInner = dynamic(() => import('./RiskTrendChartInner'), {
  ssr: false,
  loading: () => <Skeleton className="h-[220px] w-full" />,
});

const SymptomBarChartInner = dynamic(() => import('./SymptomBarChartInner'), {
  ssr: false,
  loading: () => <Skeleton className="h-[220px] w-full" />,
});

export default function PatientRiskCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="bg-card border border-border rounded-xl p-5 card-glow-primary">
        <div className="mb-3">
          <h2 className="section-header">Cohort Risk Trend (14d)</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Average maternal risk score across all clinics</p>
        </div>
        <RiskTrendChartInner />
      </div>

      <div className="bg-card border border-border rounded-xl p-5 card-glow-primary">
        <div className="mb-3">
          <h2 className="section-header">Reported Danger Signs (30d)</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Frequency of symptoms captured via Voice AI & USSD</p>
        </div>
        <SymptomBarChartInner />
      </div>
    </div>
  );
}

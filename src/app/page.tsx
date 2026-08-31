'use client';

import React from 'react';
import AppLayout from '@/components/AppLayout';
import CriticalAlertBanner from '@/components/capacity/CriticalAlertBanner';
import CapacityPageHeader from '@/components/capacity/CapacityPageHeader';
import CapacityBentoGrid from '@/components/capacity/CapacityBentoGrid';
import CapacityTrendChart from '@/components/capacity/CapacityTrendChart';
import BloodBankHeatmap from '@/components/capacity/BloodBankHeatmap';

export default function HospitalCapacityNetworkPage() {
  return (
    <AppLayout>
      <div className="px-6 lg:px-8 py-6 max-w-screen-2xl mx-auto space-y-6">
        <CriticalAlertBanner />
        <CapacityPageHeader />
        <CapacityBentoGrid />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CapacityTrendChart />
          <BloodBankHeatmap />
        </div>
      </div>
    </AppLayout>
  );
}

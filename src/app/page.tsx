'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import CriticalAlertBanner from '@/components/capacity/CriticalAlertBanner';
import CapacityPageHeader from '@/components/capacity/CapacityPageHeader';
import CapacityBentoGrid from '@/components/capacity/CapacityBentoGrid';
import CapacityTrendChart from '@/components/capacity/CapacityTrendChart';
import BloodBankHeatmap from '@/components/capacity/BloodBankHeatmap';

type TabType = 'capacity' | 'blood' | 'trends';

export default function HospitalCapacityNetworkPage() {
  const [activeTab, setActiveTab] = useState<TabType>('capacity');

  return (
    <AppLayout>
      <div className="px-6 lg:px-8 py-6 max-w-screen-2xl mx-auto space-y-6">
        <CriticalAlertBanner />
        <CapacityPageHeader />

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-border pb-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('capacity')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'capacity'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
            }`}
          >
            <Icon name="BuildingOffice2Icon" size={16} variant="outline" />
            Live Bed & Theatre Capacity
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'capacity' ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-critical text-white'
              }`}
            >
              2 Critical
            </span>
          </button>

          <button
            onClick={() => setActiveTab('blood')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'blood'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
            }`}
          >
            <Icon name="HeartIcon" size={16} variant="outline" className={activeTab === 'blood' ? '' : 'text-rose-400'} />
            Blood Bank Inventory Heatmap
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'blood' ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-rose-500/20 text-rose-400'
              }`}
            >
              O- Low
            </span>
          </button>

          <button
            onClick={() => setActiveTab('trends')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'trends'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
            }`}
          >
            <Icon name="ChartBarIcon" size={16} variant="outline" />
            Occupancy & Bottleneck Trends
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'capacity' && (
          <div className="space-y-6 fade-in">
            <CapacityBentoGrid />
          </div>
        )}

        {activeTab === 'blood' && (
          <div className="fade-in max-w-4xl">
            <BloodBankHeatmap />
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="space-y-6 fade-in max-w-4xl">
            <CapacityTrendChart />
          </div>
        )}
      </div>
    </AppLayout>
  );
}

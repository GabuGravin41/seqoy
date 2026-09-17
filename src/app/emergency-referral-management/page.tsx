'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import ReferralHeader from './components/ReferralHeader';
import ReferralKPICards from './components/ReferralKPICards';
import ReferralPipeline from './components/ReferralPipeline';
import ReferralTable from './components/ReferralTable';
import ReferralVolumeChart from './components/ReferralVolumeChart';

type TabType = 'pipeline' | 'history' | 'volume';

export default function EmergencyReferralManagementPage() {
  const [activeTab, setActiveTab] = useState<TabType>('pipeline');

  return (
    <AppLayout>
      <div className="px-6 lg:px-8 py-6 max-w-screen-2xl mx-auto space-y-6">
        <ReferralHeader />
        <ReferralKPICards />

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-border pb-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'pipeline'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
            }`}
          >
            <Icon name="ArrowsRightLeftIcon" size={16} variant="outline" />
            Active Referral Pipeline
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
            }`}
          >
            <Icon name="TableCellsIcon" size={16} variant="outline" />
            Referral Handover Logs & History
          </button>

          <button
            onClick={() => setActiveTab('volume')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'volume'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
            }`}
          >
            <Icon name="ChartBarIcon" size={16} variant="outline" />
            Corridor Volume Analytics
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'pipeline' && (
          <div className="fade-in max-w-4xl">
            <ReferralPipeline />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="fade-in">
            <ReferralTable />
          </div>
        )}

        {activeTab === 'volume' && (
          <div className="fade-in max-w-3xl">
            <ReferralVolumeChart />
          </div>
        )}
      </div>
    </AppLayout>
  );
}

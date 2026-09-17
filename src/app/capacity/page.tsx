'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import CriticalAlertBanner from '@/components/capacity/CriticalAlertBanner';
import CapacityPageHeader from '@/components/capacity/CapacityPageHeader';
import CapacityBentoGrid from '@/components/capacity/CapacityBentoGrid';
import CapacityTrendChart from '@/components/capacity/CapacityTrendChart';
import BloodBankHeatmap from '@/components/capacity/BloodBankHeatmap';
import { useCurrentUser } from '@/context/AuthContext';

type TabType = 'capacity' | 'blood' | 'trends';

export default function HospitalCapacityNetworkPage() {
  const currentUser = useCurrentUser();
  const [activeTab, setActiveTab] = useState<TabType>(() =>
    currentUser.role === 'BLOOD_BANK_OFFICER' ? 'blood' : 'capacity'
  );

  useEffect(() => {
    if (currentUser.role === 'BLOOD_BANK_OFFICER') {
      setActiveTab('blood');
    }
  }, [currentUser.role]);

  return (
    <AppLayout>
      <div className="px-6 lg:px-8 py-6 max-w-screen-2xl mx-auto space-y-6">
        <CriticalAlertBanner />

        {/* Role-Specific Workspace Notice */}
        {currentUser.role === 'CLINIC_NURSE' && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-emerald-300">
              <Icon name="InformationCircleIcon" size={18} variant="outline" className="shrink-0" />
              <span>
                <strong>Primary Clinic Midwife View:</strong> Reviewing referral hospital readiness from {currentUser.facilityName}. Need to transfer an emergency patient?
              </span>
            </div>
            <Link
              href="/patient-risk-monitoring"
              className="btn-primary text-xs shrink-0 py-1.5 px-3 flex items-center gap-1.5"
            >
              <span>Go to Patient Triage & Transfers</span>
              <Icon name="ArrowRightIcon" size={14} variant="outline" />
            </Link>
          </div>
        )}

        {currentUser.role === 'COMMUNITY_PROMOTER' && (
          <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-teal-300">
              <Icon name="UsersIcon" size={18} variant="outline" className="shrink-0" />
              <span>
                <strong>Community Health Promoter (CHP) View:</strong> You have mothers scheduled for danger-sign follow-ups in your zone.
              </span>
            </div>
            <Link
              href="/mothers"
              className="btn-primary text-xs shrink-0 py-1.5 px-3 flex items-center gap-1.5"
            >
              <span>Open Community Mothers Roster</span>
              <Icon name="ArrowRightIcon" size={14} variant="outline" />
            </Link>
          </div>
        )}

        {currentUser.role === 'COUNTY_DIRECTOR' && (
          <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-purple-300">
              <Icon name="ChartBarIcon" size={18} variant="outline" className="shrink-0" />
              <span>
                <strong>County Reproductive Health Directorate:</strong> Reviewing county-wide capacity bottlenecks. For WHO 3-Delays audits and MOH 711 reporting:
              </span>
            </div>
            <Link
              href="/surveillance"
              className="btn-primary text-xs shrink-0 py-1.5 px-3 flex items-center gap-1.5"
            >
              <span>Open MPDSR Surveillance</span>
              <Icon name="ArrowRightIcon" size={14} variant="outline" />
            </Link>
          </div>
        )}

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

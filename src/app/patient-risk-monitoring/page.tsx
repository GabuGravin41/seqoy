'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import PatientMonitoringHeader from './components/PatientMonitoringHeader';
import PatientKPICards from './components/PatientKPICards';
import PatientRiskCharts from './components/PatientRiskCharts';
import PatientTable from './components/PatientTable';
import HealthCheckInPanel from './components/HealthCheckInPanel';

type TabType = 'queue' | 'chat' | 'analytics';

export default function PatientRiskMonitoringPage() {
  const [activeTab, setActiveTab] = useState<TabType>('queue');

  return (
    <AppLayout>
      <div className="px-6 lg:px-8 py-6 max-w-screen-2xl mx-auto space-y-6">
        <PatientMonitoringHeader />

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-border pb-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('queue')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'queue'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
            }`}
          >
            <Icon name="QueueListIcon" size={16} variant="outline" />
            Triage Patient Queue
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'queue' ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-critical text-white'
              }`}
            >
              5 Urgent
            </span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'chat'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
            }`}
          >
            <Icon name="ChatBubbleLeftRightIcon" size={16} variant="outline" />
            Voice & Chat Assistant
            <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'analytics'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
            }`}
          >
            <Icon name="ChartBarIcon" size={16} variant="outline" />
            Risk & Symptom Analytics
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'queue' && (
          <div className="space-y-6 fade-in">
            <PatientKPICards />
            <PatientTable />
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="fade-in">
            <HealthCheckInPanel
              patientName="Amina Wanjiku"
              gestationalWeek={34}
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6 fade-in">
            <PatientKPICards />
            <PatientRiskCharts />
          </div>
        )}
      </div>
    </AppLayout>
  );
}

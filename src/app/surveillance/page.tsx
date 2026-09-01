'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import { generateCountyMPDSRReport } from '@/lib/analytics/mpdsr';
import { mockMpdsrAuditLogs } from '@/db/mock-store';
import { toast } from 'sonner';

export default function SurveillancePage() {
  const [filterPeriod, setFilterPeriod] = useState<'month' | 'quarter' | 'year'>('quarter');
  const [selectedDelay, setSelectedDelay] = useState<'ALL' | 'DELAY_1' | 'DELAY_2' | 'DELAY_3'>('ALL');

  const report = generateCountyMPDSRReport(mockMpdsrAuditLogs);
  const { delay1RatePercent, delay2RatePercent, delay3RatePercent, countySummary, totalAudited } = report;

  const filteredLogs = mockMpdsrAuditLogs.filter((log) => {
    if (selectedDelay === 'DELAY_1') return log.delay1DurationMinutes > 20;
    if (selectedDelay === 'DELAY_2') return log.delay2DurationMinutes > 20;
    if (selectedDelay === 'DELAY_3') return log.delay3DurationMinutes > 15;
    return true;
  });

  const handleExportMOH711 = () => {
    toast.success('MOH 711 & 105 Audit Data Exported', {
      description: 'Downloaded official County MPDSR compliance summary CSV.',
    });
  };

  return (
    <AppLayout>
      <div className="px-6 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary pulse-dot" />
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                County Health Directorate · MoH Compliance
              </span>
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight mt-1">
              Maternal & Perinatal Death Surveillance (MPDSR)
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Continuous 3-Delays framework monitoring, near-miss clinical audits, and preventable mortality eradication.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-muted/40 p-1 rounded-xl border border-border text-xs">
              {(['month', 'quarter', 'year'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setFilterPeriod(p)}
                  className={`px-3 py-1 rounded-lg font-semibold capitalize transition ${
                    filterPeriod === p ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {p === 'month' ? 'This Month' : p === 'quarter' ? 'Q3 2026' : 'Year to Date'}
                </button>
              ))}
            </div>
            <button onClick={handleExportMOH711} className="btn-primary text-xs flex items-center gap-2">
              <Icon name="ArrowDownTrayIcon" size={14} variant="outline" />
              Export MOH 711
            </button>
          </div>
        </div>

        {/* 3-Delays Framework Summary Banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Avoidance Score */}
          <div className="bg-card border border-border rounded-2xl p-5 card-glow-primary flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="stat-label">Mortality Avoidance Score</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <Icon name="ShieldCheckIcon" size={18} variant="solid" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-hero-metric text-emerald-400">
                {countySummary.nairobiMaternalMortalityAvoidanceScore}%
              </span>
              <p className="text-xs text-muted-foreground mt-1">
                Zero preventable deaths achieved in {totalAudited} near-miss transfers audited.
              </p>
            </div>
          </div>

          {/* Delay 1: Decision */}
          <div
            onClick={() => setSelectedDelay(selectedDelay === 'DELAY_1' ? 'ALL' : 'DELAY_1')}
            className={`bg-card border rounded-2xl p-5 cursor-pointer transition ${
              selectedDelay === 'DELAY_1' ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="stat-label">Delay 1: Seeking Care</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                {delay1RatePercent}% Rate
              </span>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-foreground">
                15 mins avg
              </span>
              <p className="text-[11px] text-muted-foreground mt-1">
                Weekly Voice AI prompts mother as soon as symptoms arise.
              </p>
            </div>
          </div>

          {/* Delay 2: Transport */}
          <div
            onClick={() => setSelectedDelay(selectedDelay === 'DELAY_2' ? 'ALL' : 'DELAY_2')}
            className={`bg-card border rounded-2xl p-5 cursor-pointer transition ${
              selectedDelay === 'DELAY_2' ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="stat-label">Delay 2: Transport & Reach</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                {delay2RatePercent}% Rate
              </span>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-foreground">
                18 mins avg
              </span>
              <p className="text-[11px] text-muted-foreground mt-1">
                Smart dispatch routes ambulance directly to capable Level 5 hospital.
              </p>
            </div>
          </div>

          {/* Delay 3: Facility Care */}
          <div
            onClick={() => setSelectedDelay(selectedDelay === 'DELAY_3' ? 'ALL' : 'DELAY_3')}
            className={`bg-card border rounded-2xl p-5 cursor-pointer transition ${
              selectedDelay === 'DELAY_3' ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="stat-label">Delay 3: Receiving Care</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                {delay3RatePercent}% Rate
              </span>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-foreground">
                5 mins avg
              </span>
              <p className="text-[11px] text-muted-foreground mt-1">
                Pre-arrival notification reserves ICU bed & O- blood in advance.
              </p>
            </div>
          </div>
        </div>

        {/* Actionable County Health Director Recommendations */}
        <div className="bg-card border border-border rounded-2xl p-5 card-glow-primary space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Icon name="LightBulbIcon" size={18} variant="outline" className="text-amber-400" />
            <h2 className="section-header text-sm font-bold">
              Targeted Interventions from MPDSR Near-Miss Audits
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {countySummary.criticalInterventionRecommendations.map((rec, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-muted/30 border border-border flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <p className="text-xs text-foreground leading-relaxed font-medium">{rec}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Audited Cases Table */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="ClipboardDocumentListIcon" size={18} variant="outline" className="text-primary" />
              <h3 className="text-sm font-bold text-foreground">
                Maternal Near-Miss & Case Audits ({filteredLogs.length} Records)
              </h3>
            </div>
            {selectedDelay !== 'ALL' && (
              <button
                onClick={() => setSelectedDelay('ALL')}
                className="text-xs text-primary font-semibold hover:underline"
              >
                Clear Filter (Show All)
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 text-muted-foreground border-b border-border uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Audit ID / Patient</th>
                  <th className="py-3 px-4">Corridor</th>
                  <th className="py-3 px-4">Delay Factors Addressed</th>
                  <th className="py-3 px-4">Outcome</th>
                  <th className="py-3 px-4">Executive Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/20 transition">
                    <td className="py-3 px-4">
                      <p className="font-bold text-foreground font-mono">AUDIT-#{log.id}</p>
                      <p className="text-[11px] text-muted-foreground">{log.patientName}</p>
                    </td>
                    <td className="py-3 px-4 font-medium text-foreground">
                      {log.county}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      <p className="text-[11px]"><strong className="text-foreground">D1:</strong> {log.delay1Factor}</p>
                      <p className="text-[11px]"><strong className="text-foreground">D2:</strong> {log.delay2Factor}</p>
                      <p className="text-[11px]"><strong className="text-foreground">D3:</strong> {log.delay3Factor}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                        <Icon name="CheckCircleIcon" size={14} variant="solid" />
                        {log.clinicalOutcome}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground max-w-xs">
                      {log.executiveAuditSummary}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

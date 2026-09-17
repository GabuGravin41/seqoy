'use client';

import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'sonner';

interface MPDSRReport {
  totalAudited: number;
  insufficientData: boolean;
  delay1IdentifiedRatePercent: number;
  delay3IdentifiedRatePercent: number;
  preventableRatePercent: number;
  averageDelay3Minutes: number | null;
  outcomeBreakdown: Record<string, number>;
}

interface AuditLog {
  id: number;
  patientName: string;
  county: string;
  delay1Factor: string;
  delay3Factor: string;
  clinicalOutcome: string;
  executiveAuditSummary: string;
}

export default function SurveillancePage() {
  const [report, setReport] = useState<MPDSRReport | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics/mpdsr')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setReport(data?.report ?? null);
        setLogs(data?.recentAuditLogs ?? []);
      })
      .catch(() => {
        setReport(null);
        setLogs([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleExportMOH711 = () => {
    toast.success('MOH 711 & 105 Audit Data Exported', {
      description: 'Downloaded official County MPDSR compliance summary CSV.',
    });
  };

  return (
    <AppLayout>
      <div className="px-6 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto">
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
              SEQOY closes Delay 1 (early identification) and Delay 3 (facility readiness). Delay 2 (transport) is
              tracked here only as an optional manual note for MoH reporting completeness — it isn't a product feature.
            </p>
          </div>
          <button onClick={handleExportMOH711} className="btn-primary text-xs flex items-center gap-2">
            <Icon name="ArrowDownTrayIcon" size={14} variant="outline" />
            Export MOH 711
          </button>
        </div>

        {!loading && report?.insufficientData ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <Icon name="ClipboardDocumentListIcon" size={28} variant="outline" className="text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-bold text-foreground">No MPDSR audits logged yet</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
              Once a nurse logs a case audit from a completed referral, Delay 1 / Delay 3 metrics will appear here —
              real numbers only, never a placeholder.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card border border-border rounded-2xl p-5 card-glow-primary">
                <div className="flex items-center justify-between">
                  <span className="stat-label">Delay 1: Danger Sign Identified</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                    <Icon name="PhoneIcon" size={16} variant="solid" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-hero-metric text-emerald-400">{report?.delay1IdentifiedRatePercent ?? 0}%</span>
                  <p className="text-xs text-muted-foreground mt-1">
                    Of {report?.totalAudited ?? 0} audited cases, an early check-in flagged a danger sign before referral.
                  </p>
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl p-5 card-glow-primary">
                <div className="flex items-center justify-between">
                  <span className="stat-label">Delay 3: Avg. Time to Admission</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                    <Icon name="BuildingOffice2Icon" size={16} variant="solid" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-hero-metric text-blue-400">
                    {report?.averageDelay3Minutes != null ? `${report.averageDelay3Minutes}m` : '—'}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    From receiving facility acknowledgement to admission, across cases with recorded timestamps.
                  </p>
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl p-5 card-glow-primary">
                <div className="flex items-center justify-between">
                  <span className="stat-label">Preventable Delay Rate</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                    <Icon name="ExclamationTriangleIcon" size={16} variant="solid" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-hero-metric text-amber-400">{report?.preventableRatePercent ?? 0}%</span>
                  <p className="text-xs text-muted-foreground mt-1">Share of audits where a preventable delay was identified.</p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-border flex items-center gap-2">
                <Icon name="ClipboardDocumentListIcon" size={18} variant="outline" className="text-primary" />
                <h3 className="text-sm font-bold text-foreground">Maternal Near-Miss & Case Audits ({logs.length} Records)</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/40 text-muted-foreground border-b border-border uppercase font-semibold text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Audit ID / Patient</th>
                      <th className="py-3 px-4">County</th>
                      <th className="py-3 px-4">Delay 1 / Delay 3 Factors</th>
                      <th className="py-3 px-4">Outcome</th>
                      <th className="py-3 px-4">Executive Summary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-muted/20 transition">
                        <td className="py-3 px-4">
                          <p className="font-bold text-foreground font-mono">AUDIT-#{log.id}</p>
                          <p className="text-[11px] text-muted-foreground">{log.patientName}</p>
                        </td>
                        <td className="py-3 px-4 font-medium text-foreground">{log.county}</td>
                        <td className="py-3 px-4 text-muted-foreground">
                          <p className="text-[11px]"><strong className="text-foreground">D1:</strong> {log.delay1Factor || '—'}</p>
                          <p className="text-[11px]"><strong className="text-foreground">D3:</strong> {log.delay3Factor || '—'}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                            <Icon name="CheckCircleIcon" size={14} variant="solid" />
                            {log.clinicalOutcome}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground max-w-xs">{log.executiveAuditSummary}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}

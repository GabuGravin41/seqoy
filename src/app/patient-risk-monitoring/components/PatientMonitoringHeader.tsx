'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'sonner';

export default function PatientMonitoringHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-6 border-b border-border">
      <div>
        <p className="text-[11px] font-bold tracking-[0.16em] text-scarlet uppercase">Delay 1 · Early Warning</p>
        <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-foreground tracking-[-0.025em]">
          Patient Risk Monitoring
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Enrolled expectant mothers — SMS check-ins, midwife triage scoring, and danger-sign surveillance.
        </p>
      </div>
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-md border border-border">
          <span className="w-2 h-2 rounded-full bg-jungle pulse-dot" />
          <span className="text-xs font-medium text-muted-foreground font-tabular">SMS outreach active</span>
        </div>
        <button
          onClick={() => toast.success('Exporting patient clinical logs...')}
          className="btn-secondary text-xs"
        >
          <Icon name="ArrowDownTrayIcon" size={14} variant="outline" />
          Export
        </button>
        <button
          onClick={() => toast.info('New patient registration modal')}
          className="btn-primary text-xs"
        >
          <Icon name="PlusIcon" size={14} variant="outline" />
          Enrol Patient
        </button>
      </div>
    </div>
  );
}

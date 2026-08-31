'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'sonner';

export default function PatientMonitoringHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Patient Risk Monitoring</h1>
        <p className="text-xs text-muted-foreground mt-1">
          All enrolled expectant mothers — Voice AI check-ins, triage scoring, and danger sign surveillance
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg border border-border">
          <span className="w-2 h-2 rounded-full bg-primary pulse-dot" />
          <span className="text-xs text-muted-foreground font-tabular">247 patients enrolled</span>
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

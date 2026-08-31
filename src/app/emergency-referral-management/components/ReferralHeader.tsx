'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'sonner';

export default function ReferralHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Emergency Referral Management</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Active patient transfers, real-time ambulance routing, and MoH MPDSR compliance — Nairobi Region
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-high/10 rounded-lg border border-high/20">
          <span className="w-2 h-2 rounded-full bg-high pulse-dot" />
          <span className="text-xs text-high font-semibold font-tabular">3 in transit</span>
        </div>
        <button
          onClick={() => toast.success('Generating County MPDSR Audit Report...')}
          className="btn-secondary text-xs"
        >
          <Icon name="DocumentChartBarIcon" size={14} variant="outline" />
          MPDSR Report
        </button>
        <button
          onClick={() => toast.info('Open live capacity terminal to dispatch')}
          className="btn-primary text-xs"
        >
          <Icon name="PlusIcon" size={14} variant="outline" />
          New Referral
        </button>
      </div>
    </div>
  );
}

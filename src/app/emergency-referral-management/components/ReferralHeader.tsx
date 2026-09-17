'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'sonner';

export default function ReferralHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Facility Referral Management</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Referrals sent to hospitals with confirmed capacity, and MoH MPDSR compliance — Nairobi Region
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => toast.success('Generating County MPDSR Audit Report...')}
          className="btn-secondary text-xs"
        >
          <Icon name="DocumentChartBarIcon" size={14} variant="outline" />
          MPDSR Report
        </button>
        <a href="/capacity" className="btn-primary text-xs">
          <Icon name="PlusIcon" size={14} variant="outline" />
          New Referral
        </a>
      </div>
    </div>
  );
}

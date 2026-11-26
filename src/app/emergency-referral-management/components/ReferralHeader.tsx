'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'sonner';

export default function ReferralHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-6 border-b border-border">
      <div>
        <p className="text-[11px] font-bold tracking-[0.16em] text-jungle uppercase">Delay 3 · Verified Transfers</p>
        <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-foreground tracking-[-0.025em]">
          Facility Referral Management
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Verified referrals with confirmed capacity, MOH 268 slips, and MPDSR audit tracking.
        </p>
      </div>
      <div className="flex items-center gap-2.5">
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

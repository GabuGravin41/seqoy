'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'sonner';

interface CapacityPageHeaderProps {
  onRefresh?: () => void;
  onNewReferral?: () => void;
}

export default function CapacityPageHeader({ onRefresh, onNewReferral }: CapacityPageHeaderProps) {
  const [lastSync, setLastSync] = useState('');
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    setLastSync('16:31 EAT');
  }, []);

  const handleRefresh = async () => {
    setSyncing(true);
    if (onRefresh) {
      await onRefresh();
    }
    setTimeout(() => {
      setSyncing(false);
      setLastSync(
        new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' EAT'
      );
      toast.success('Capacity data refreshed', {
        description: 'All 6 referral hospitals synced in real time',
      });
    }, 800);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-6 border-b border-border">
      <div>
        <p className="text-[11px] font-bold tracking-[0.16em] text-jungle uppercase">Delay 3 · Live Readiness</p>
        <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-foreground tracking-[-0.025em]">
          Hospital Capacity Network
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Live ICU beds, theatre readiness, and unreserved O-negative blood across referral hospitals.
        </p>
      </div>
      <div className="flex items-center gap-2.5">
        {lastSync && (
          <div className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-md border border-border">
            <span className="w-2 h-2 rounded-full bg-jungle pulse-dot" />
            <span className="text-xs font-medium text-muted-foreground font-tabular">
              Synced {lastSync}
            </span>
          </div>
        )}
        <button
          onClick={handleRefresh}
          disabled={syncing}
          className="btn-secondary text-xs"
        >
          <Icon
            name="ArrowPathIcon"
            size={14}
            variant="outline"
            className={syncing ? 'animate-spin' : ''}
          />
          {syncing ? 'Syncing...' : 'Refresh'}
        </button>
        <button
          onClick={onNewReferral}
          className="btn-primary text-xs"
        >
          <Icon name="PlusIcon" size={14} variant="outline" />
          New Referral
        </button>
      </div>
    </div>
  );
}

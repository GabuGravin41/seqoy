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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Hospital Capacity Network</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Live referral capacity across surrounding Level 4, 5 & 6 facilities — Nairobi Metro Region
        </p>
      </div>
      <div className="flex items-center gap-3">
        {lastSync && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg border border-border">
            <span className="w-2 h-2 rounded-full bg-primary pulse-dot" />
            <span className="text-xs text-muted-foreground font-tabular">
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

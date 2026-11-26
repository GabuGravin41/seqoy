'use client';

import React from 'react';
import { useAuth, useCurrentUser } from '@/context/AuthContext';
import Icon from '@/components/ui/AppIcon';

export default function RoleTopBanner() {
  const currentUser = useCurrentUser();
  const { signOut } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-border px-5 lg:px-8 h-16 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-md bg-navy text-white flex items-center justify-center font-bold text-xs shrink-0">
          {currentUser.avatarInitials}
        </div>

        <div className="min-w-0 flex flex-col sm:flex-row sm:items-center sm:gap-2.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-foreground truncate">{currentUser.name}</span>
            <span className="text-[11px] font-bold tracking-[0.08em] uppercase text-navy dark:text-white/80 shrink-0">
              {currentUser.roleTitle}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground truncate">
            <span className="text-border">·</span>
            <Icon name="BuildingOfficeIcon" size={13} variant="outline" className="shrink-0" />
            <span className="truncate">{currentUser.facilityName}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={signOut}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-foreground/80 transition hover:border-scarlet hover:text-scarlet"
        >
          <Icon name="ArrowRightOnRectangleIcon" size={14} variant="outline" />
          Sign Out
        </button>
      </div>
    </header>
  );
}

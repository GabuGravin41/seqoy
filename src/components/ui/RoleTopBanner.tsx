'use client';

import React from 'react';
import { UserButton } from '@clerk/nextjs';
import { useCurrentUser } from '@/context/AuthContext';
import Icon from '@/components/ui/AppIcon';

/**
 * Previously this let anyone free-switch their own role/persona from a
 * dropdown — a UI costume, not real access control. Role changes now
 * require a SYSTEM_ADMIN acting through /admin/users; this banner just
 * shows who you actually are and lets you sign out via Clerk.
 */
export default function RoleTopBanner() {
  const currentUser = useCurrentUser();

  return (
    <header className="sticky top-0 z-30 bg-card/90 backdrop-blur-md border-b border-border px-4 lg:px-6 py-2.5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border shadow-xs ${currentUser.avatarColor}`}
        >
          {currentUser.avatarInitials}
        </div>

        <div className="min-w-0 flex flex-col sm:flex-row sm:items-center sm:gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-foreground truncate">{currentUser.name}</span>
            <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-bold border border-primary/20 shrink-0">
              {currentUser.roleTitle}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-muted-foreground truncate">
            <span className="text-border">|</span>
            <Icon name="BuildingOfficeIcon" size={13} variant="outline" className="shrink-0" />
            <span className="truncate">{currentUser.facilityName}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  );
}

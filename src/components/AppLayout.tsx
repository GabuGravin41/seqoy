'use client';

import React from 'react';
import Sidebar from './Sidebar';
import PhoneDrawer from '@/components/telephony/PhoneDrawer';
import RoleTopBanner from '@/components/ui/RoleTopBanner';
import { useAuth } from '@/context/AuthContext';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-muted-foreground text-sm">
        Loading your workspace…
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex h-screen items-center justify-center bg-background px-6">
        <div className="max-w-sm text-center space-y-2">
          <p className="text-sm font-semibold text-foreground">No SEQOY role assigned yet</p>
          <p className="text-xs text-muted-foreground">
            Your account was created, but a system administrator hasn't assigned your clinical role and facility yet.
            Ask them to do so from the Admin panel, then reload this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <RoleTopBanner />
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {children}
        </div>
      </main>
      {/* Global Slide-out Handset Drawer */}
      <PhoneDrawer />
    </div>
  );
}

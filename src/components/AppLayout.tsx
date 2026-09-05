'use client';

import React from 'react';
import Sidebar from './Sidebar';
import PhoneDrawer from '@/components/telephony/PhoneDrawer';
import RoleTopBanner from '@/components/ui/RoleTopBanner';

export default function AppLayout({ children }: { children: React.ReactNode }) {
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

'use client';

import React from 'react';
import Sidebar from './Sidebar';
import PhoneDrawer from '@/components/telephony/PhoneDrawer';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-y-auto scrollbar-thin relative">
        {children}
      </main>
      {/* Global Slide-out Handset Drawer */}
      <PhoneDrawer />
    </div>
  );
}

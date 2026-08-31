'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TelephonyPatient {
  id?: string | number;
  name?: string;
  phone?: string;
  gestationalWeek?: number;
  clinic?: string;
  riskLevel?: string;
}

interface TelephonyContextType {
  isOpen: boolean;
  activeMode: 'ussd' | 'voice';
  selectedPatient: TelephonyPatient | null;
  openDrawer: (mode?: 'ussd' | 'voice', patient?: TelephonyPatient) => void;
  closeDrawer: () => void;
  setActiveMode: (mode: 'ussd' | 'voice') => void;
}

const TelephonyContext = createContext<TelephonyContextType | undefined>(undefined);

export function TelephonyProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<'ussd' | 'voice'>('ussd');
  const [selectedPatient, setSelectedPatient] = useState<TelephonyPatient | null>(null);

  const openDrawer = (mode: 'ussd' | 'voice' = 'ussd', patient?: TelephonyPatient) => {
    setActiveMode(mode);
    if (patient) {
      setSelectedPatient(patient);
    }
    setIsOpen(true);
  };

  const closeDrawer = () => {
    setIsOpen(false);
  };

  return (
    <TelephonyContext.Provider
      value={{
        isOpen,
        activeMode,
        selectedPatient,
        openDrawer,
        closeDrawer,
        setActiveMode,
      }}
    >
      {children}
    </TelephonyContext.Provider>
  );
}

export function useTelephony() {
  const context = useContext(TelephonyContext);
  if (!context) {
    throw new Error('useTelephony must be used within a TelephonyProvider');
  }
  return context;
}

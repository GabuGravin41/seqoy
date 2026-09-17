'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { SignOutButton } from '@clerk/nextjs';
import { useCurrentUser } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'sonner';

export default function UserProfilePage() {
  const currentUser = useCurrentUser();
  const { theme, setTheme } = useTheme();
  const [isOnDuty, setIsOnDuty] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [voiceCallEscalation, setVoiceCallEscalation] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [phone, setPhone] = useState('+254 712 345 678');
  const [licenseNumber, setLicenseNumber] = useState('KNC-RN-88421');

  const handleSave = () => {
    toast.success('User profile & clinical preferences saved successfully');
  };

  return (
    <AppLayout>
      <div className="px-6 lg:px-8 py-6 max-w-5xl mx-auto space-y-6">
        {/* Profile Banner */}
        <div className="bg-card border border-border rounded-2xl p-6 card-glow-primary flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl border shadow-md ${currentUser.avatarColor}`}
            >
              {currentUser.avatarInitials}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-foreground">{currentUser.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-primary/15 text-primary text-xs font-bold border border-primary/30">
                  {currentUser.roleTitle}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    isOnDuty
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isOnDuty ? '🟢 On Duty' : '⚪ Off Duty'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                <Icon name="BuildingOfficeIcon" size={14} variant="outline" />
                {currentUser.facilityName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setIsOnDuty(!isOnDuty);
                toast.info(`Duty status marked as ${!isOnDuty ? 'On Duty' : 'Off Duty'}`);
              }}
              className="btn-secondary text-xs"
            >
              <Icon name="PowerIcon" size={14} variant="outline" />
              {isOnDuty ? 'Go Off Duty' : 'Set Active Duty'}
            </button>
            <button onClick={handleSave} className="btn-primary text-xs">
              <Icon name="CheckIcon" size={14} variant="outline" />
              Save Changes
            </button>
            <SignOutButton>
              <button className="btn-secondary text-xs text-critical hover:bg-critical/10 border-critical/30">
                <Icon name="ArrowRightOnRectangleIcon" size={14} variant="outline" />
                Sign Out
              </button>
            </SignOutButton>
          </div>
        </div>

        {/* 2 Column Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Clinical Credentials & Notification Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Clinical & License Information */}
            <div className="bg-card border border-border rounded-xl p-5 card-glow-primary space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <Icon name="IdentificationIcon" size={18} variant="outline" className="text-primary" />
                <h2 className="section-header text-sm">Clinical Cadre & Licensing</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="stat-label text-[11px]">Full Name</label>
                  <input
                    className="input-field text-xs"
                    value={currentUser.name}
                    readOnly
                  />
                </div>

                <div className="space-y-1">
                  <label className="stat-label text-[11px]">Professional Role</label>
                  <input
                    className="input-field text-xs"
                    value={currentUser.roleTitle}
                    readOnly
                  />
                </div>

                <div className="space-y-1">
                  <label className="stat-label text-[11px]">Nursing / Medical License No.</label>
                  <input
                    className="input-field text-xs font-mono"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="stat-label text-[11px]">Primary Contact Phone</label>
                  <input
                    className="input-field text-xs font-mono"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Health Facility Details */}
            <div className="bg-card border border-border rounded-xl p-5 card-glow-primary space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <Icon name="BuildingOffice2Icon" size={18} variant="outline" className="text-primary" />
                <h2 className="section-header text-sm">Assigned Health Facility</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-muted/40 p-3 rounded-xl space-y-1">
                  <p className="stat-label text-[10px]">Facility Name</p>
                  <p className="font-bold text-foreground">{currentUser.facilityName}</p>
                </div>

                <div className="bg-muted/40 p-3 rounded-xl space-y-1">
                  <p className="stat-label text-[10px]">Facility Category</p>
                  <p className="font-semibold text-foreground">
                    {currentUser.facilityType.replace(/_/g, ' ')}
                  </p>
                </div>

                <div className="bg-muted/40 p-3 rounded-xl space-y-1">
                  <p className="stat-label text-[10px]">MFL Master Code</p>
                  <p className="font-mono text-primary font-bold">MFL-13044 (Nairobi Metro)</p>
                </div>

                <div className="bg-muted/40 p-3 rounded-xl space-y-1">
                  <p className="stat-label text-[10px]">Duty Shift</p>
                  <p className="font-semibold text-foreground">Day Shift (07:00 – 19:00 EAT)</p>
                </div>
              </div>
            </div>

            {/* Telephony & Emergency Notifications */}
            <div className="bg-card border border-border rounded-xl p-5 card-glow-primary space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <Icon name="BellAlertIcon" size={18} variant="outline" className="text-primary" />
                <h2 className="section-header text-sm">Emergency Alert Preferences</h2>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                  <div>
                    <p className="text-xs font-bold text-foreground">CRITICAL Maternal Danger SMS Alerts</p>
                    <p className="text-[11px] text-muted-foreground">Receive instant SMS alerts when a mother flags severe preeclampsia or PPH</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={smsAlerts}
                    onChange={(e) => setSmsAlerts(e.target.checked)}
                    className="rounded border-border accent-primary w-4 h-4"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                  <div>
                    <p className="text-xs font-bold text-foreground">Automated Voice AI Escalation</p>
                    <p className="text-[11px] text-muted-foreground">Trigger direct phone call when risk score exceeds 7.0/10</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={voiceCallEscalation}
                    onChange={(e) => setVoiceCallEscalation(e.target.checked)}
                    className="rounded border-border accent-primary w-4 h-4"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                  <div>
                    <p className="text-xs font-bold text-foreground">Referral Notification Sound</p>
                    <p className="text-[11px] text-muted-foreground">Play an audible chime in-browser when a new facility referral arrives</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={soundAlerts}
                    onChange={(e) => setSoundAlerts(e.target.checked)}
                    className="rounded border-border accent-primary w-4 h-4"
                  />
                </div>
              </div>
            </div>

            {/* Display & Interface Theme */}
            <div className="bg-card border border-border rounded-xl p-5 card-glow-primary space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <Icon name="SwatchIcon" size={18} variant="outline" className="text-primary" />
                <h2 className="section-header text-sm">Display Theme</h2>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`p-3.5 rounded-xl border text-left flex flex-col justify-between gap-2 transition ${
                    theme === 'light'
                      ? 'bg-primary/10 border-primary ring-1 ring-primary'
                      : 'bg-muted/30 hover:bg-muted border-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg">☀️</span>
                    {theme === 'light' && (
                      <span className="px-1.5 py-0.2 bg-primary text-primary-foreground text-[9px] font-bold rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Day Mode</p>
                    <p className="text-[10px] text-muted-foreground">High contrast light background</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`p-3.5 rounded-xl border text-left flex flex-col justify-between gap-2 transition ${
                    theme === 'dark'
                      ? 'bg-primary/10 border-primary ring-1 ring-primary'
                      : 'bg-muted/30 hover:bg-muted border-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg">🌙</span>
                    {theme === 'dark' && (
                      <span className="px-1.5 py-0.2 bg-primary text-primary-foreground text-[9px] font-bold rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Night Mode</p>
                    <p className="text-[10px] text-muted-foreground">Deep obsidian dark background</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Right Col: Facility Context & Clinical Privileges */}
          <div className="space-y-6">
            {/* Facility Card */}
            <div className="bg-card border border-border rounded-xl p-5 card-glow-primary space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <Icon name="BuildingOffice2Icon" size={18} variant="outline" className="text-primary" />
                <h2 className="section-header text-sm">Assigned Health Facility</h2>
              </div>
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-1">
                  <p className="text-xs font-bold text-foreground">{currentUser.facilityName}</p>
                  <p className="text-[11px] text-muted-foreground">Level 3 / Primary Healthcare Facility · Nairobi County</p>
                </div>
                <div className="flex items-center justify-between text-xs py-1 border-b border-border">
                  <span className="text-muted-foreground">Facility Type</span>
                  <span className="font-semibold text-foreground">{currentUser.facilityType}</span>
                </div>
                <div className="flex items-center justify-between text-xs py-1 border-b border-border">
                  <span className="text-muted-foreground">Emergency Referral Link</span>
                  <span className="font-semibold text-primary">Pumwani & Mama Lucy Level 5</span>
                </div>
                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-muted-foreground">Sub-County Coverage Zone</span>
                  <span className="font-semibold text-foreground">Westlands Sub-County</span>
                </div>
              </div>
            </div>

            {/* Clinical Privileges Card */}
            <div className="bg-card border border-border rounded-xl p-5 card-glow-primary space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <Icon name="ShieldCheckIcon" size={18} variant="outline" className="text-primary" />
                <h2 className="section-header text-sm">Authorized Clinical Privileges</h2>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 bg-muted/20 rounded-lg text-xs">
                  <span className="text-foreground">Antenatal Patient Registration</span>
                  <span className="text-emerald-400 font-bold text-[11px]">✓ Authorized</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-muted/20 rounded-lg text-xs">
                  <span className="text-foreground">Referral Hospital Capacity Viewing</span>
                  <span className="text-emerald-400 font-bold text-[11px]">✓ Authorized</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-muted/20 rounded-lg text-xs">
                  <span className="text-foreground">MOH 711 & 105 Reporting Export</span>
                  <span className="text-emerald-400 font-bold text-[11px]">✓ Authorized</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

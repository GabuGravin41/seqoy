'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import StatusBadge from '@/components/ui/StatusBadge';
import { toast } from 'sonner';
import { useTelephony } from '@/context/TelephonyContext';
import { useCurrentUser } from '@/context/AuthContext';
import PatientProfileModal from './PatientProfileModal';

type RiskLevel = 'NORMAL' | 'ELEVATED_RISK' | 'CRITICAL_EMERGENCY';

interface Patient {
  id: number;
  fullName: string;
  phoneNumber: string;
  gestationalWeeks: number;
  currentRiskLevel: RiskLevel;
  bloodType: string;
  lastCheckinAt?: string;
  checkinFrequencyDays: number;
  preferredCheckinDayOfWeek: number;
  contactChannel: 'WHATSAPP' | 'SMS';
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const riskLevels: (RiskLevel | 'ALL')[] = ['ALL', 'CRITICAL_EMERGENCY', 'ELEVATED_RISK', 'NORMAL'];

export default function PatientTable() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [profileModalPatient, setProfileModalPatient] = useState<Patient | null>(null);
  const perPage = 6;

  const fetchPatients = async () => {
    try {
      const res = await fetch('/api/patients');
      if (res.ok) {
        const data = await res.json();
        setPatients(data.patients ?? []);
      }
    } catch (e) {
      console.warn('Failed to load patients', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const filtered = useMemo(() => {
    return patients
      .filter((p) => {
        if (riskFilter !== 'ALL' && p.currentRiskLevel !== riskFilter) return false;
        if (search && !p.fullName.toLowerCase().includes(search.toLowerCase()) && !p.phoneNumber.includes(search)) return false;
        return true;
      })
      .sort((a, b) => {
        const order: Record<RiskLevel, number> = { CRITICAL_EMERGENCY: 0, ELEVATED_RISK: 1, NORMAL: 2 };
        return order[a.currentRiskLevel] - order[b.currentRiskLevel];
      });
  }, [patients, riskFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const { openDrawer } = useTelephony();
  const currentUser = useCurrentUser();

  const handleCallNow = async (patient: Patient) => {
    openDrawer('voice', {
      id: patient.id,
      name: patient.fullName,
      phone: patient.phoneNumber,
      gestationalWeek: patient.gestationalWeeks,
      riskLevel: patient.currentRiskLevel,
    });

    try {
      const res = await fetch('/api/telephony/twilio/outbound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toPhoneNumber: patient.phoneNumber, patientId: patient.id }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Check-in call queued for ${patient.fullName}`, { description: data.mode === 'MOCK' ? 'Simulated (no Twilio credentials configured)' : `Call SID ${data.callSid}` });
      } else {
        toast.error(data.error || 'Failed to queue call');
      }
    } catch (e) {
      toast.error('Failed to queue call');
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl card-glow-primary">
      <div className="p-5 border-b border-border flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="section-header text-base">Enrolled Expectant Mothers</h2>
            {currentUser.permissions.canViewAssignedOnly && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-400 font-bold border border-teal-500/30">
                CHP Assigned Zone
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{filtered.length} mothers matching filters</p>
        </div>
        <div className="relative">
          <Icon name="MagnifyingGlassIcon" size={14} variant="outline" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            className="input-field pl-8 w-48 text-xs h-8"
            placeholder="Search name or phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      <div className="px-5 py-3 border-b border-border flex items-center gap-2 overflow-x-auto scrollbar-thin">
        <span className="text-xs text-muted-foreground whitespace-nowrap">Risk:</span>
        {riskLevels.map((level) => (
          <button
            key={`chip-${level}`}
            onClick={() => {
              setRiskFilter(level);
              setPage(1);
            }}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-150 active:scale-95 ${
              riskFilter === level
                ? level === 'CRITICAL_EMERGENCY'
                  ? 'bg-critical text-white'
                  : level === 'ELEVATED_RISK'
                  ? 'bg-high text-white'
                  : level === 'NORMAL'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-foreground text-background'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {level === 'ALL' ? 'All Levels' : level.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-xs min-w-[900px]">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left stat-label">Patient</th>
              <th className="px-4 py-3 text-left stat-label">Risk</th>
              <th className="px-4 py-3 text-left stat-label">Gest. Week</th>
              <th className="px-4 py-3 text-left stat-label">Last Check-in</th>
              <th className="px-4 py-3 text-left stat-label">Next Call Day</th>
              <th className="px-4 py-3 text-left stat-label">Weekly Channel</th>
              <th className="px-4 py-3 text-left stat-label">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading && paged.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <p className="text-xs text-muted-foreground">No patients match these filters</p>
                </td>
              </tr>
            )}
            {paged.map((patient) => (
              <tr key={patient.id} className="border-b border-border/50 transition-colors duration-100 hover:bg-muted/30">
                <td className="px-4 py-3">
                  <p className="font-semibold text-foreground text-xs">{patient.fullName}</p>
                  <p className="text-[11px] text-muted-foreground font-tabular">{patient.phoneNumber}</p>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={patient.currentRiskLevel} />
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary rounded text-xs font-tabular font-semibold text-secondary-foreground">
                    Wk {patient.gestationalWeeks}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[11px] text-muted-foreground">
                    {patient.lastCheckinAt ? new Date(patient.lastCheckinAt).toLocaleDateString() : 'No check-in yet'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[11px] text-foreground">
                    Every {patient.checkinFrequencyDays}d, {DAY_NAMES[patient.preferredCheckinDayOfWeek]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                    {patient.contactChannel}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setProfileModalPatient(patient)}
                      title={`View ${patient.fullName}'s file`}
                      className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors active:scale-95"
                    >
                      <Icon name="EyeIcon" size={14} variant="outline" />
                    </button>
                    <button
                      onClick={() => handleCallNow(patient)}
                      title={`Call ${patient.fullName} now`}
                      className="p-1.5 rounded-md hover:bg-primary/15 text-primary transition-colors active:scale-95"
                    >
                      <Icon name="PhoneIcon" size={14} variant="outline" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PatientProfileModal
        patient={
          profileModalPatient
            ? {
                id: String(profileModalPatient.id),
                name: profileModalPatient.fullName,
                phone: profileModalPatient.phoneNumber,
                gestationalWeek: profileModalPatient.gestationalWeeks,
                riskScore: profileModalPatient.currentRiskLevel === 'CRITICAL_EMERGENCY' ? 8.5 : profileModalPatient.currentRiskLevel === 'ELEVATED_RISK' ? 5.5 : 1.5,
                triageLevel: profileModalPatient.currentRiskLevel === 'CRITICAL_EMERGENCY' ? 'CRITICAL' : profileModalPatient.currentRiskLevel === 'ELEVATED_RISK' ? 'HIGH' : 'LOW',
                clinic: '',
                lastCallDate: profileModalPatient.lastCheckinAt ?? '',
                lastCallOutcome: 'PENDING',
                symptoms: [],
                flaggedAt: '',
              }
            : (null as any)
        }
        open={!!profileModalPatient}
        onClose={() => setProfileModalPatient(null)}
        onTriggerCall={() => profileModalPatient && handleCallNow(profileModalPatient)}
      />
    </div>
  );
}

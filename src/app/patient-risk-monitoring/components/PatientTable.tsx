'use client';

import React, { useState, useMemo } from 'react';
import Icon from '@/components/ui/AppIcon';
import StatusBadge from '@/components/ui/StatusBadge';
import { toast } from 'sonner';
import { useTelephony } from '@/context/TelephonyContext';
import { useAuth } from '@/context/AuthContext';
import PatientProfileModal from './PatientProfileModal';

type TriageLevel = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
type CallOutcome = 'ANSWERED' | 'MISSED' | 'VOICEMAIL' | 'PENDING';

interface Patient {
  id: string;
  name: string;
  phone: string;
  gestationalWeek: number;
  riskScore: number;
  triageLevel: TriageLevel;
  clinic: string;
  lastCallDate: string;
  lastCallOutcome: CallOutcome;
  lastUssdPing: string;
  daysSinceContact: number;
  symptoms: string[];
  flaggedAt: string;
}

const initialPatients: Patient[] = [
  {
    id: 'pat-001',
    name: 'Amina Wanjiku Mwangi',
    phone: '+254 712 345 678',
    gestationalWeek: 34,
    riskScore: 8.4,
    triageLevel: 'CRITICAL',
    clinic: 'Kangemi Health Centre',
    lastCallDate: '30/08/2026',
    lastCallOutcome: 'ANSWERED',
    lastUssdPing: '30/08/2026',
    daysSinceContact: 0,
    symptoms: ['Blurred Vision', 'Severe Headache', 'High BP'],
    flaggedAt: '08:14 EAT',
  },
  {
    id: 'pat-002',
    name: 'Achieng Otieno',
    phone: '+254 722 891 234',
    gestationalWeek: 38,
    riskScore: 7.9,
    triageLevel: 'CRITICAL',
    clinic: 'Mathare North Clinic',
    lastCallDate: '30/08/2026',
    lastCallOutcome: 'ANSWERED',
    lastUssdPing: '30/08/2026',
    daysSinceContact: 0,
    symptoms: ['Vaginal Bleeding', 'Reduced Fetal Movement'],
    flaggedAt: '10:32 EAT',
  },
  {
    id: 'pat-003',
    name: 'Njeri Kamau',
    phone: '+254 733 456 789',
    gestationalWeek: 36,
    riskScore: 8.1,
    triageLevel: 'CRITICAL',
    clinic: 'Korogocho Dispensary',
    lastCallDate: '28/08/2026',
    lastCallOutcome: 'MISSED',
    lastUssdPing: '27/08/2026',
    daysSinceContact: 2,
    symptoms: ['Severe Abdominal Pain', 'Fever'],
    flaggedAt: '14:55 EAT',
  },
  {
    id: 'pat-004',
    name: 'Fatuma Osman',
    phone: '+254 700 234 567',
    gestationalWeek: 32,
    riskScore: 7.2,
    triageLevel: 'CRITICAL',
    clinic: 'Eastleigh Community Clinic',
    lastCallDate: '30/08/2026',
    lastCallOutcome: 'ANSWERED',
    lastUssdPing: '30/08/2026',
    daysSinceContact: 0,
    symptoms: ['Severe Oedema', 'High BP'],
    flaggedAt: '12:07 EAT',
  },
  {
    id: 'pat-005',
    name: 'Grace Waweru',
    phone: '+254 710 567 890',
    gestationalWeek: 29,
    riskScore: 7.5,
    triageLevel: 'CRITICAL',
    clinic: 'Kangemi Health Centre',
    lastCallDate: '29/08/2026',
    lastCallOutcome: 'VOICEMAIL',
    lastUssdPing: '28/08/2026',
    daysSinceContact: 1,
    symptoms: ['Blurred Vision', 'Persistent Headache'],
    flaggedAt: '15:40 EAT',
  },
  {
    id: 'pat-006',
    name: 'Faith Nekesa Juma',
    phone: '+254 722 998 877',
    gestationalWeek: 28,
    riskScore: 2.1,
    triageLevel: 'LOW',
    clinic: 'Kangemi Health Centre',
    lastCallDate: '30/08/2026',
    lastCallOutcome: 'ANSWERED',
    lastUssdPing: '29/08/2026',
    daysSinceContact: 0,
    symptoms: [],
    flaggedAt: '—',
  },
  {
    id: 'pat-007',
    name: 'Mary Akinyi Ochieng',
    phone: '+254 733 445 566',
    gestationalWeek: 38,
    riskScore: 5.8,
    triageLevel: 'HIGH',
    clinic: 'Kangemi Health Centre',
    lastCallDate: '29/08/2026',
    lastCallOutcome: 'ANSWERED',
    lastUssdPing: '29/08/2026',
    daysSinceContact: 1,
    symptoms: ['Mild Bleeding', 'Pelvic Discomfort'],
    flaggedAt: '11:15 EAT',
  },
];

const callOutcomeStyles: Record<CallOutcome, string> = {
  ANSWERED: 'text-primary',
  MISSED: 'text-critical',
  VOICEMAIL: 'text-moderate',
  PENDING: 'text-muted-foreground',
};

const callOutcomeIcons: Record<CallOutcome, string> = {
  ANSWERED: 'PhoneIcon',
  MISSED: 'PhoneXMarkIcon',
  VOICEMAIL: 'PhoneArrowDownLeftIcon',
  PENDING: 'ClockIcon',
};

const clinics = ['All Clinics', 'Kangemi Health Centre', 'Mathare North Clinic', 'Korogocho Dispensary', 'Eastleigh Community Clinic', 'Kibera Health Centre'];
const triageLevels: (TriageLevel | 'ALL')[] = ['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'];

export default function PatientTable() {
  const [triageFilter, setTriageFilter] = useState<TriageLevel | 'ALL'>('ALL');
  const [clinicFilter, setClinicFilter] = useState('All Clinics');
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState<'riskScore' | 'gestationalWeek' | 'daysSinceContact'>('riskScore');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [profileModalPatient, setProfileModalPatient] = useState<Patient | null>(null);
  const perPage = 6;

  const filtered = useMemo(() => {
    return initialPatients
      .filter((p) => {
        if (triageFilter !== 'ALL' && p.triageLevel !== triageFilter) return false;
        if (clinicFilter !== 'All Clinics' && p.clinic !== clinicFilter) return false;
        if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.phone.includes(search)) return false;
        return true;
      })
      .sort((a, b) => {
        const dir = sortDir === 'desc' ? -1 : 1;
        return (a[sortCol] - b[sortCol]) * dir;
      });
  }, [triageFilter, clinicFilter, search, sortCol, sortDir]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const toggleSort = (col: typeof sortCol) => {
    if (sortCol === col) setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
    else {
      setSortCol(col);
      setSortDir('desc');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleAll = () => {
    if (selectedIds.length === paged.length) setSelectedIds([]);
    else setSelectedIds(paged.map((p) => p.id));
  };

  const { openDrawer } = useTelephony();
  const { currentUser } = useAuth();

  const handleCallNow = (patient: Patient) => {
    openDrawer('voice', {
      id: patient.id,
      name: patient.name,
      phone: patient.phone,
      gestationalWeek: patient.gestationalWeek,
      clinic: patient.clinic,
      riskLevel: patient.triageLevel,
    });
  };

  const SortIcon = ({ col }: { col: typeof sortCol }) => (
    <Icon
      name={sortCol === col ? (sortDir === 'desc' ? 'ChevronDownIcon' : 'ChevronUpIcon') : 'ChevronUpDownIcon'}
      size={12}
      variant="outline"
      className={sortCol === col ? 'text-primary' : 'text-muted-foreground'}
    />
  );

  return (
    <div className="bg-card border border-border rounded-xl card-glow-primary">
      {/* Table header controls */}
      <div className="p-5 border-b border-border flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="section-header text-base">Enrolled Expectant Mothers</h2>
            {currentUser.permissions.canViewAssignedOnly && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-400 font-bold border border-teal-500/30">
                🏡 CHP Assigned Zone: Kangemi Sub-Zone 4
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {currentUser.permissions.canViewAssignedOnly
              ? 'Mothers in your village zone requiring weekly household follow-up & USSD assistance'
              : `${filtered.length} mothers matching filters`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Icon
              name="MagnifyingGlassIcon"
              size={14}
              variant="outline"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
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
          {/* Clinic filter */}
          <select
            className="input-field text-xs h-8 w-44"
            value={clinicFilter}
            onChange={(e) => {
              setClinicFilter(e.target.value);
              setPage(1);
            }}
          >
            {clinics.map((c) => (
              <option key={`clinic-${c}`} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Triage filter chips */}
      <div className="px-5 py-3 border-b border-border flex items-center gap-2 overflow-x-auto scrollbar-thin">
        <span className="text-xs text-muted-foreground whitespace-nowrap">Triage:</span>
        {triageLevels.map((level) => (
          <button
            key={`chip-${level}`}
            onClick={() => {
              setTriageFilter(level);
              setPage(1);
            }}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-150 active:scale-95 ${
              triageFilter === level
                ? level === 'CRITICAL'
                  ? 'bg-critical text-white'
                  : level === 'HIGH'
                  ? 'bg-high text-white'
                  : level === 'MODERATE'
                  ? 'bg-moderate text-white'
                  : level === 'LOW'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-foreground text-background'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {level === 'ALL' ? 'All Levels' : level}
            {level !== 'ALL' && (
              <span className="ml-1.5 opacity-70">
                {initialPatients.filter((p) => p.triageLevel === level).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Bulk action bar */}
      {selectedIds.length > 0 && (
        <div className="px-5 py-2.5 bg-primary/10 border-b border-primary/20 flex items-center gap-3 slide-up">
          <span className="text-xs font-semibold text-primary">{selectedIds.length} selected</span>
          <button
            onClick={() => {
              toast.success(`Voice AI calls queued for ${selectedIds.length} patients`);
              setSelectedIds([]);
            }}
            className="text-xs btn-primary py-1.5"
          >
            <Icon name="PhoneIcon" size={12} variant="outline" />
            Call All via Voice AI
          </button>
          <button
            onClick={() => toast.success(`Exported ${selectedIds.length} patient records`)}
            className="text-xs btn-secondary py-1.5"
          >
            <Icon name="ArrowDownTrayIcon" size={12} variant="outline" />
            Export Selected
          </button>
          <button onClick={() => setSelectedIds([])} className="text-xs text-muted-foreground hover:text-foreground ml-auto">
            Clear
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-xs min-w-[1000px]">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left w-8">
                <input
                  type="checkbox"
                  checked={selectedIds.length === paged.length && paged.length > 0}
                  onChange={toggleAll}
                  className="rounded border-border bg-input accent-primary"
                  aria-label="Select all patients on this page"
                />
              </th>
              <th className="px-4 py-3 text-left stat-label">Patient</th>
              <th className="px-4 py-3 text-left stat-label">Triage</th>
              <th
                className="px-4 py-3 text-left stat-label cursor-pointer select-none"
                onClick={() => toggleSort('riskScore')}
              >
                <span className="flex items-center gap-1">
                  Risk Score <SortIcon col="riskScore" />
                </span>
              </th>
              <th
                className="px-4 py-3 text-left stat-label cursor-pointer select-none"
                onClick={() => toggleSort('gestationalWeek')}
              >
                <span className="flex items-center gap-1">
                  Gest. Week <SortIcon col="gestationalWeek" />
                </span>
              </th>
              <th className="px-4 py-3 text-left stat-label">Clinic</th>
              <th className="px-4 py-3 text-left stat-label">Last Contact</th>
              <th className="px-4 py-3 text-left stat-label">Flagged Symptoms</th>
              <th className="px-4 py-3 text-left stat-label">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center">
                  <p className="text-xs text-muted-foreground">No patients match these filters</p>
                </td>
              </tr>
            ) : (
              paged.map((patient) => (
                <tr
                  key={patient.id}
                  className={`border-b border-border/50 transition-colors duration-100 hover:bg-muted/30 ${
                    selectedIds.includes(patient.id) ? 'bg-primary/5' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(patient.id)}
                      onChange={() => toggleSelect(patient.id)}
                      className="rounded border-border bg-input accent-primary"
                      aria-label={`Select ${patient.name}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-semibold text-foreground text-xs">{patient.name}</p>
                      <p className="text-[11px] text-muted-foreground font-tabular">{patient.phone}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={patient.triageLevel} />
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-sm font-bold font-tabular ${
                        patient.riskScore >= 7
                          ? 'text-critical'
                          : patient.riskScore >= 5
                          ? 'text-high'
                          : patient.riskScore >= 3
                          ? 'text-moderate'
                          : 'text-primary'
                      }`}
                    >
                      {patient.riskScore.toFixed(1)}/10
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary rounded text-xs font-tabular font-semibold text-secondary-foreground">
                      Wk {patient.gestationalWeek}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-foreground truncate max-w-[140px]">{patient.clinic}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Icon
                        name={callOutcomeIcons[patient.lastCallOutcome] as Parameters<typeof Icon>[0]['name']}
                        size={13}
                        variant="outline"
                        className={callOutcomeStyles[patient.lastCallOutcome]}
                      />
                      <span className="text-[11px] text-muted-foreground">{patient.lastCallDate}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1 max-w-[180px]">
                      {patient.symptoms.length === 0 ? (
                        <span className="text-[11px] text-muted-foreground">None reported</span>
                      ) : (
                        patient.symptoms.map((s) => (
                          <span
                            key={`sym-${patient.id}-${s}`}
                            className="px-1.5 py-0.5 bg-critical/10 text-critical text-[10px] rounded font-medium"
                          >
                            {s}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setProfileModalPatient(patient)}
                        title={`View ${patient.name}'s Maternal File`}
                        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors active:scale-95"
                        aria-label={`View file for ${patient.name}`}
                      >
                        <Icon name="EyeIcon" size={14} variant="outline" />
                      </button>
                      <button
                        onClick={() => handleCallNow(patient)}
                        title={`Call ${patient.name} via Voice AI`}
                        className="p-1.5 rounded-md hover:bg-primary/15 text-primary transition-colors active:scale-95"
                        aria-label={`Call ${patient.name}`}
                      >
                        <Icon name="PhoneIcon" size={14} variant="outline" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Patient Detailed Maternal Clinical Profile Modal */}
      <PatientProfileModal
        patient={profileModalPatient as any}
        open={!!profileModalPatient}
        onClose={() => setProfileModalPatient(null)}
        onTriggerCall={(p) => handleCallNow(p as any)}
      />
    </div>
  );
}

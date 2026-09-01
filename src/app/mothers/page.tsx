'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import StatusBadge from '@/components/ui/StatusBadge';
import { initialPatients } from '@/db/mock-store';
import PatientProfileModal from '@/app/patient-risk-monitoring/components/PatientProfileModal';
import { toast } from 'sonner';

export default function ExpectantMothersPage() {
  const [patients, setPatients] = useState(initialPatients);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'CRITICAL_EMERGENCY' | 'ELEVATED_RISK' | 'NORMAL'>('ALL');
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [isEnrolModalOpen, setIsEnrolModalOpen] = useState(false);

  // New Enrolment Form State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('+254 7');
  const [newAge, setNewAge] = useState('26');
  const [newWeeks, setNewWeeks] = useState('28');
  const [newBlood, setNewBlood] = useState('O+');
  const [newClinic, setNewClinic] = useState('Kangemi Health Centre');

  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.fullName.toLowerCase().includes(search.toLowerCase()) ||
      p.phoneNumber.includes(search);
    const matchesRisk = riskFilter === 'ALL' || p.currentRiskLevel === riskFilter;
    return matchesSearch && matchesRisk;
  });

  const handleEnrolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPatient = {
      id: Date.now(),
      fullName: newName,
      phoneNumber: newPhone,
      age: parseInt(newAge) || 25,
      gravida: 2,
      parity: 1,
      gestationalWeeks: parseInt(newWeeks) || 24,
      estimatedDeliveryDate: '2026-11-20',
      bloodType: newBlood,
      preferredLanguage: 'SWAHILI' as const,
      primaryFacilityId: 1,
      currentRiskLevel: 'NORMAL' as const,
      lastCheckinAt: 'Just Enrolled',
      createdAt: new Date().toISOString(),
    };

    setPatients([newPatient, ...patients]);
    setIsEnrolModalOpen(false);
    toast.success(`Mother ${newName} enrolled successfully!`, {
      description: 'Scheduled for automated Saturday 2:00 PM Voice AI check-in.',
    });
    setNewName('');
  };

  return (
    <AppLayout>
      <div className="px-6 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary pulse-dot" />
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Community & Clinical Registry
              </span>
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight mt-1">
              Expectant Mothers Directory
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Continuous maternal welfare tracking, weekly Saturday voice schedules, and active obstetric records.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <input
                type="text"
                placeholder="Search mother by name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field text-xs pl-8 w-64"
              />
              <Icon
                name="MagnifyingGlassIcon"
                size={14}
                variant="outline"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
            </div>

            <button
              onClick={() => setIsEnrolModalOpen(true)}
              className="btn-primary text-xs flex items-center gap-2"
            >
              <Icon name="UserPlusIcon" size={15} variant="outline" />
              Enrol Expectant Mother
            </button>
          </div>
        </div>

        {/* Quick Filter Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setRiskFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl font-semibold border transition ${
              riskFilter === 'ALL'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-muted/40 text-muted-foreground border-border hover:text-foreground'
            }`}
          >
            All Enrolled ({patients.length})
          </button>
          <button
            onClick={() => setRiskFilter('CRITICAL_EMERGENCY')}
            className={`px-3 py-1.5 rounded-xl font-semibold border transition ${
              riskFilter === 'CRITICAL_EMERGENCY'
                ? 'bg-critical text-white border-critical'
                : 'bg-muted/40 text-critical border-border hover:bg-critical/10'
            }`}
          >
            🔴 Urgent Danger ({patients.filter((p) => p.currentRiskLevel === 'CRITICAL_EMERGENCY').length})
          </button>
          <button
            onClick={() => setRiskFilter('ELEVATED_RISK')}
            className={`px-3 py-1.5 rounded-xl font-semibold border transition ${
              riskFilter === 'ELEVATED_RISK'
                ? 'bg-accent text-white border-accent'
                : 'bg-muted/40 text-accent border-border hover:bg-accent/10'
            }`}
          >
            🟡 Elevated Risk ({patients.filter((p) => p.currentRiskLevel === 'ELEVATED_RISK').length})
          </button>
          <button
            onClick={() => setRiskFilter('NORMAL')}
            className={`px-3 py-1.5 rounded-xl font-semibold border transition ${
              riskFilter === 'NORMAL'
                ? 'bg-emerald-500 text-white border-emerald-500'
                : 'bg-muted/40 text-emerald-400 border-border hover:bg-emerald-500/10'
            }`}
          >
            🟢 Stable ({patients.filter((p) => p.currentRiskLevel === 'NORMAL').length})
          </button>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 text-muted-foreground border-b border-border uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Expectant Mother</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Gestational Stage</th>
                  <th className="py-3 px-4">Blood Group</th>
                  <th className="py-3 px-4">Status & Risk</th>
                  <th className="py-3 px-4">Saturday Check-in</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="hover:bg-muted/20 transition cursor-pointer"
                    onClick={() => setSelectedPatient(patient)}
                  >
                    <td className="py-3 px-4">
                      <p className="font-bold text-foreground">{patient.fullName}</p>
                      <p className="text-[11px] text-muted-foreground">{patient.age} yrs · Gravida {patient.gravida || 1}</p>
                    </td>
                    <td className="py-3 px-4 font-mono text-muted-foreground">
                      {patient.phoneNumber}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-foreground">Week {patient.gestationalWeeks}</span>
                      <p className="text-[10px] text-muted-foreground">EDD: {patient.estimatedDeliveryDate}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-foreground border border-border">
                        {patient.bloodType || 'O+'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={patient.currentRiskLevel} />
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {patient.lastCheckinAt || 'Pending Saturday'}
                    </td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedPatient(patient)}
                        className="btn-secondary text-xs py-1 px-2.5"
                      >
                        View File
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Patient Profile Medical File Modal */}
        {selectedPatient && (
          <PatientProfileModal
            open={Boolean(selectedPatient)}
            patient={{
              id: String(selectedPatient.id),
              name: selectedPatient.fullName,
              phone: selectedPatient.phoneNumber,
              gestationalWeek: selectedPatient.gestationalWeeks || 28,
              riskScore: selectedPatient.currentRiskLevel === 'CRITICAL_EMERGENCY' ? 8.8 : selectedPatient.currentRiskLevel === 'ELEVATED_RISK' ? 6.2 : 2.1,
              triageLevel: selectedPatient.currentRiskLevel === 'CRITICAL_EMERGENCY' ? 'CRITICAL' : selectedPatient.currentRiskLevel === 'ELEVATED_RISK' ? 'HIGH' : 'LOW',
              clinic: 'Kangemi Health Centre',
              lastCallDate: '30/08/2026',
              lastCallOutcome: 'ANSWERED',
              symptoms: selectedPatient.currentRiskLevel === 'CRITICAL_EMERGENCY' ? ['Severe Headache', 'Blurred Vision', 'Reduced Movement'] : ['Routine Care'],
              flaggedAt: '10:45 AM',
            }}
            onClose={() => setSelectedPatient(null)}
            onTriggerCall={(pat) => {
              toast.success(`Queued automated Swahili check-in call for ${pat.name}`);
            }}
          />
        )}

        {/* Enrolment Modal */}
        {isEnrolModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
            <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 card-glow-primary">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Icon name="UserPlusIcon" size={20} variant="outline" className="text-primary" />
                  <h3 className="text-base font-bold text-foreground">Enrol New Expectant Mother</h3>
                </div>
                <button
                  onClick={() => setIsEnrolModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <form className="space-y-4" onSubmit={handleEnrolSubmit}>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="input-field text-xs"
                    placeholder="e.g. Grace Nyambura"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="input-field text-xs font-mono"
                      placeholder="+254 712 345 678"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Age</label>
                    <input
                      type="number"
                      value={newAge}
                      onChange={(e) => setNewAge(e.target.value)}
                      className="input-field text-xs"
                      placeholder="26"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Gestational Age (Weeks)</label>
                    <input
                      type="number"
                      value={newWeeks}
                      onChange={(e) => setNewWeeks(e.target.value)}
                      className="input-field text-xs"
                      placeholder="28"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Blood Group</label>
                    <select
                      value={newBlood}
                      onChange={(e) => setNewBlood(e.target.value)}
                      className="input-field text-xs"
                    >
                      <option value="O+">O Positive (O+)</option>
                      <option value="O-">O Negative (O-)</option>
                      <option value="A+">A Positive (A+)</option>
                      <option value="A-">A Negative (A-)</option>
                      <option value="B+">B Positive (B+)</option>
                      <option value="B-">B Negative (B-)</option>
                      <option value="AB+">AB Positive (AB+)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Primary Health Centre</label>
                  <select
                    value={newClinic}
                    onChange={(e) => setNewClinic(e.target.value)}
                    className="input-field text-xs"
                  >
                    <option value="Kangemi Health Centre">Kangemi Health Centre</option>
                    <option value="Riruta Health Centre">Riruta Health Centre</option>
                    <option value="Westlands Dispensary">Westlands Dispensary</option>
                    <option value="Kibera Community Health Centre">Kibera Community Health Centre</option>
                  </select>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsEnrolModalOpen(false)}
                    className="btn-secondary text-xs py-2 px-4"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary text-xs py-2 px-4 font-bold">
                    Save & Schedule Saturday Call
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

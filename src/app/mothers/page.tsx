'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import StatusBadge from '@/components/ui/StatusBadge';
import { useTelephony } from '@/context/TelephonyContext';
import { toast } from 'sonner';

interface Patient {
  id: number;
  fullName: string;
  phoneNumber: string;
  age: number;
  gravida: number;
  gestationalWeeks: number;
  estimatedDeliveryDate: string;
  bloodType: string;
  currentRiskLevel: 'NORMAL' | 'ELEVATED_RISK' | 'CRITICAL_EMERGENCY';
  lastCheckinAt?: string;
  checkinFrequencyDays: number;
  preferredCheckinDayOfWeek: number;
  contactChannel: 'WHATSAPP' | 'SMS';
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function ExpectantMothersPage() {
  const { openDrawer } = useTelephony();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'CRITICAL_EMERGENCY' | 'ELEVATED_RISK' | 'NORMAL'>('ALL');
  const [isEnrolModalOpen, setIsEnrolModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Enrolment Form State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('+254 7');
  const [newAge, setNewAge] = useState('26');
  const [newWeeks, setNewWeeks] = useState('28');
  const [newBlood, setNewBlood] = useState('O+');
  const [checkinFrequencyDays, setCheckinFrequencyDays] = useState('14');
  const [preferredDay, setPreferredDay] = useState('6');
  const [preferredHour, setPreferredHour] = useState('14');
  const [contactChannel, setContactChannel] = useState<'WHATSAPP' | 'SMS'>('SMS');
  const [whatsappNumber, setWhatsappNumber] = useState('');

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

  const filteredPatients = patients.filter((p) => {
    const matchesSearch = p.fullName.toLowerCase().includes(search.toLowerCase()) || p.phoneNumber.includes(search);
    const matchesRisk = riskFilter === 'ALL' || p.currentRiskLevel === riskFilter;
    return matchesSearch && matchesRisk;
  });

  const handleEnrolSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: newName,
          phoneNumber: newPhone,
          age: newAge,
          gestationalWeeks: newWeeks,
          bloodType: newBlood,
          checkinFrequencyDays,
          preferredCheckinDayOfWeek: preferredDay,
          preferredCheckinHour: preferredHour,
          contactChannel,
          whatsappNumber: contactChannel === 'WHATSAPP' ? whatsappNumber || newPhone : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to enrol mother');
        return;
      }
      setIsEnrolModalOpen(false);
      toast.success(`Mother ${newName} enrolled successfully!`, {
        description: `Scheduled for calls every ${checkinFrequencyDays} days on ${DAY_NAMES[Number(preferredDay)]}, plus weekly ${contactChannel === 'WHATSAPP' ? 'WhatsApp' : 'SMS'} check-ins.`,
      });
      setNewName('');
      fetchPatients();
    } catch (e) {
      toast.error('Failed to enrol mother');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="px-6 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary pulse-dot" />
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Community & Clinical Registry
              </span>
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight mt-1">Expectant Mothers Directory</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Delay 1: automated biweekly calls and weekly WhatsApp/SMS check-ins for every enrolled mother.
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
              <Icon name="MagnifyingGlassIcon" size={14} variant="outline" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </div>
            <button onClick={() => setIsEnrolModalOpen(true)} className="btn-primary text-xs flex items-center gap-2">
              <Icon name="UserPlusIcon" size={15} variant="outline" />
              Enrol Expectant Mother
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button onClick={() => setRiskFilter('ALL')} className={`px-3 py-1.5 rounded-xl font-semibold border transition ${riskFilter === 'ALL' ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/40 text-muted-foreground border-border hover:text-foreground'}`}>
            All Enrolled ({patients.length})
          </button>
          <button onClick={() => setRiskFilter('CRITICAL_EMERGENCY')} className={`px-3 py-1.5 rounded-xl font-semibold border transition ${riskFilter === 'CRITICAL_EMERGENCY' ? 'bg-critical text-white border-critical' : 'bg-muted/40 text-critical border-border hover:bg-critical/10'}`}>
            Urgent Danger ({patients.filter((p) => p.currentRiskLevel === 'CRITICAL_EMERGENCY').length})
          </button>
          <button onClick={() => setRiskFilter('ELEVATED_RISK')} className={`px-3 py-1.5 rounded-xl font-semibold border transition ${riskFilter === 'ELEVATED_RISK' ? 'bg-accent text-white border-accent' : 'bg-muted/40 text-accent border-border hover:bg-accent/10'}`}>
            Elevated Risk ({patients.filter((p) => p.currentRiskLevel === 'ELEVATED_RISK').length})
          </button>
          <button onClick={() => setRiskFilter('NORMAL')} className={`px-3 py-1.5 rounded-xl font-semibold border transition ${riskFilter === 'NORMAL' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-muted/40 text-emerald-400 border-border hover:bg-emerald-500/10'}`}>
            Stable ({patients.filter((p) => p.currentRiskLevel === 'NORMAL').length})
          </button>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 text-muted-foreground border-b border-border uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Expectant Mother</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Gestational Stage</th>
                  <th className="py-3 px-4">Status & Risk</th>
                  <th className="py-3 px-4">Call Schedule</th>
                  <th className="py-3 px-4">Weekly Channel</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {!loading && filteredPatients.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">No mothers match these filters</td>
                  </tr>
                )}
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-muted/20 transition">
                    <td className="py-3 px-4">
                      <p className="font-bold text-foreground">{patient.fullName}</p>
                      <p className="text-[11px] text-muted-foreground">{patient.age} yrs · Gravida {patient.gravida || 1}</p>
                    </td>
                    <td className="py-3 px-4 font-mono text-muted-foreground">{patient.phoneNumber}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-foreground">Week {patient.gestationalWeeks}</span>
                      <p className="text-[10px] text-muted-foreground">EDD: {patient.estimatedDeliveryDate}</p>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={patient.currentRiskLevel} />
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      Every {patient.checkinFrequencyDays}d · {DAY_NAMES[patient.preferredCheckinDayOfWeek]}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-foreground border border-border">
                        {patient.contactChannel}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            openDrawer('manual', {
                              id: patient.id,
                              name: patient.fullName,
                              phone: patient.phoneNumber,
                              gestationalWeek: patient.gestationalWeeks,
                              riskLevel: patient.currentRiskLevel,
                            })
                          }
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition inline-flex items-center gap-1.5 shadow-2xs"
                          title="Instant 30-sec manual call & triage (Zero airtime/Twilio cost)"
                        >
                          <Icon name="PhoneIcon" size={13} variant="solid" />
                          <span>Call / Triage</span>
                        </button>
                        <Link
                          href={`/my-pregnancy/${patient.id}`}
                          target="_blank"
                          className="px-2 py-1 rounded-lg text-xs font-semibold bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 border border-teal-500/20 transition inline-flex items-center gap-1"
                        >
                          <span>Mother Pass</span>
                          <Icon name="ArrowTopRightOnSquareIcon" size={12} variant="outline" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {isEnrolModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
            <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 card-glow-primary max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Icon name="UserPlusIcon" size={20} variant="outline" className="text-primary" />
                  <h3 className="text-base font-bold text-foreground">Enrol New Expectant Mother</h3>
                </div>
                <button onClick={() => setIsEnrolModalOpen(false)} className="text-muted-foreground hover:text-foreground text-sm font-bold">✕</button>
              </div>

              <form className="space-y-4" onSubmit={handleEnrolSubmit}>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Full Name</label>
                  <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)} className="input-field text-xs" placeholder="e.g. Grace Nyambura" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Phone Number</label>
                    <input type="text" required value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className="input-field text-xs font-mono" placeholder="+254 712 345 678" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Age</label>
                    <input type="number" value={newAge} onChange={(e) => setNewAge(e.target.value)} className="input-field text-xs" placeholder="26" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Gestational Age (Weeks)</label>
                    <input type="number" value={newWeeks} onChange={(e) => setNewWeeks(e.target.value)} className="input-field text-xs" placeholder="28" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Blood Group</label>
                    <select value={newBlood} onChange={(e) => setNewBlood(e.target.value)} className="input-field text-xs">
                      {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-3 border-t border-border space-y-3">
                  <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Icon name="PhoneIcon" size={13} variant="outline" className="text-primary" />
                    Delay 1: Check-in Schedule
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-muted-foreground mb-1">Call Every</label>
                      <select value={checkinFrequencyDays} onChange={(e) => setCheckinFrequencyDays(e.target.value)} className="input-field text-xs">
                        <option value="7">7 days</option>
                        <option value="14">14 days (default)</option>
                        <option value="21">21 days</option>
                        <option value="28">28 days</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-muted-foreground mb-1">Preferred Day</label>
                      <select value={preferredDay} onChange={(e) => setPreferredDay(e.target.value)} className="input-field text-xs">
                        {DAY_NAMES.map((d, idx) => (
                          <option key={d} value={idx}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-muted-foreground mb-1">Preferred Time</label>
                      <select value={preferredHour} onChange={(e) => setPreferredHour(e.target.value)} className="input-field text-xs">
                        <option value="9">9:00 AM</option>
                        <option value="14">2:00 PM (default)</option>
                        <option value="18">6:00 PM</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-muted-foreground mb-1">Weekly Update Channel</label>
                      <select value={contactChannel} onChange={(e) => setContactChannel(e.target.value as 'WHATSAPP' | 'SMS')} className="input-field text-xs">
                        <option value="SMS">SMS (no smartphone needed)</option>
                        <option value="WHATSAPP">WhatsApp</option>
                      </select>
                    </div>
                    {contactChannel === 'WHATSAPP' && (
                      <div>
                        <label className="block text-[11px] font-medium text-muted-foreground mb-1">WhatsApp Number</label>
                        <input
                          type="text"
                          value={whatsappNumber}
                          onChange={(e) => setWhatsappNumber(e.target.value)}
                          placeholder="Same as phone if blank"
                          className="input-field text-xs font-mono"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3 border-t border-border">
                  <button type="button" onClick={() => setIsEnrolModalOpen(false)} className="btn-secondary text-xs py-2 px-4">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn-primary text-xs py-2 px-4 font-bold">
                    {submitting ? 'Saving...' : 'Save & Schedule Check-ins'}
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

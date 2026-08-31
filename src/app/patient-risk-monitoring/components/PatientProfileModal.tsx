'use client';

import React from 'react';
import Modal from '@/components/ui/Modal';
import StatusBadge from '@/components/ui/StatusBadge';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'sonner';

export interface PatientRecord {
  id: string;
  name: string;
  phone: string;
  gestationalWeek: number;
  riskScore: number;
  triageLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  clinic: string;
  lastCallDate: string;
  lastCallOutcome: string;
  symptoms: string[];
  flaggedAt: string;
}

interface PatientProfileModalProps {
  patient: PatientRecord | null;
  open: boolean;
  onClose: () => void;
  onTriggerCall: (patient: PatientRecord) => void;
}

export default function PatientProfileModal({
  patient,
  open,
  onClose,
  onTriggerCall,
}: PatientProfileModalProps) {
  if (!patient) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={patient.name}
      description={`Maternal ANC File · National Registry ID: 33190822 · ${patient.clinic}`}
      size="lg"
    >
      <div className="space-y-4 text-xs">
        {/* Quick Triage Banner */}
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 ${
            patient.riskScore >= 7
              ? 'bg-critical/10 border-critical/30 text-critical'
              : patient.riskScore >= 5
              ? 'bg-high/10 border-high/30 text-high'
              : 'bg-primary/10 border-primary/30 text-primary'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Icon
              name={patient.riskScore >= 7 ? 'ExclamationCircleIcon' : 'ShieldCheckIcon'}
              size={20}
              variant="solid"
            />
            <div>
              <p className="font-bold uppercase tracking-wide text-xs">
                {patient.triageLevel} TRIAGE RISK ({patient.riskScore.toFixed(1)} / 10)
              </p>
              <p className="text-[11px] opacity-90">
                {patient.riskScore >= 7
                  ? 'Red flag danger signs present — Clinical transfer recommended'
                  : 'Routine antenatal monitoring in progress'}
              </p>
            </div>
          </div>
          <StatusBadge status={patient.triageLevel} />
        </div>

        {/* Clinical Parameters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-muted/40 p-3 rounded-xl">
            <p className="stat-label text-[10px]">Gestational Age</p>
            <p className="text-sm font-bold text-foreground mt-0.5 font-tabular">
              Week {patient.gestationalWeek}
            </p>
            <p className="text-[10px] text-muted-foreground">3rd Trimester</p>
          </div>

          <div className="bg-muted/40 p-3 rounded-xl">
            <p className="stat-label text-[10px]">Blood Type</p>
            <p className="text-sm font-bold text-primary mt-0.5 font-tabular">O-Negative</p>
            <p className="text-[10px] text-muted-foreground">Rh-D Incompatibility Risk</p>
          </div>

          <div className="bg-muted/40 p-3 rounded-xl">
            <p className="stat-label text-[10px]">Gravida / Parity</p>
            <p className="text-sm font-bold text-foreground mt-0.5 font-tabular">G2 P1</p>
            <p className="text-[10px] text-muted-foreground">1 Previous live birth</p>
          </div>

          <div className="bg-muted/40 p-3 rounded-xl">
            <p className="stat-label text-[10px]">Primary ANC Clinic</p>
            <p className="text-xs font-bold text-foreground mt-0.5 truncate">{patient.clinic}</p>
            <p className="text-[10px] text-muted-foreground">Level 3 Health Centre</p>
          </div>
        </div>

        {/* Flagged Symptoms */}
        <div className="bg-card border border-border p-3.5 rounded-xl space-y-2">
          <p className="stat-label text-[10px]">Recent Clinical Danger Signs Reported:</p>
          <div className="flex flex-wrap gap-1.5">
            {patient.symptoms.length === 0 ? (
              <span className="text-muted-foreground text-xs">No active danger signs recorded</span>
            ) : (
              patient.symptoms.map((s, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-critical/15 text-critical text-[11px] font-bold rounded-lg border border-critical/30 flex items-center gap-1"
                >
                  <Icon name="ExclamationTriangleIcon" size={12} variant="solid" />
                  {s}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Latest Voice AI Call Transcript */}
        <div className="bg-muted/30 border border-border p-3.5 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <Icon name="PhoneIcon" size={13} variant="outline" className="text-primary" />
              Latest Voice AI Telephony Session ({patient.lastCallDate})
            </span>
            <span className="text-primary font-mono text-[10px]">AUDIO VERIFIED</span>
          </div>
          <p className="text-xs text-muted-foreground italic leading-relaxed bg-background/50 p-2.5 rounded-lg border border-border/50">
            "Mama alieleza maumivu makali ya kichwa tangu asubuhi, kutoona vizuri (ukungu machoni), na uvimbe miguuni na usoni. Alisema mtoto hachezi vizuri."
          </p>
          <p className="text-[10px] text-muted-foreground">
            Extracted Clinical Entities: <strong>Severe Scotoma, Refractory Headache, Bilateral Edema, Fetal Inactivity</strong>
          </p>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-border gap-3">
          <button
            onClick={() => {
              onClose();
              onTriggerCall(patient);
            }}
            className="btn-primary text-xs flex-1"
          >
            <Icon name="PhoneIcon" size={14} variant="outline" />
            Trigger Outbound Voice AI Call
          </button>
          <button
            onClick={() => {
              toast.success(`EHR exported for ${patient.name}`);
              onClose();
            }}
            className="btn-secondary text-xs"
          >
            <Icon name="ArrowDownTrayIcon" size={14} variant="outline" />
            Export Patient EHR
          </button>
        </div>
      </div>
    </Modal>
  );
}

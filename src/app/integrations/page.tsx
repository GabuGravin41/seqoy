'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { CONNECTED_SYSTEMS, ConnectedSystem } from '@/lib/interoperability/adapters';
import Icon from '@/components/ui/AppIcon';
import Modal from '@/components/ui/Modal';
import { toast } from 'sonner';

export default function IntegrationsPage() {
  const [systems, setSystems] = useState<ConnectedSystem[]>(CONNECTED_SYSTEMS);
  const [selectedSystem, setSelectedSystem] = useState<ConnectedSystem | null>(null);
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [fhirModalOpen, setFhirModalOpen] = useState(false);
  const [fhirPayload, setFhirPayload] = useState<any>(null);
  const [loadingFhir, setLoadingFhir] = useState(false);

  const handleTestAdmissionSync = async () => {
    setTestingWebhook(true);
    try {
      const res = await fetch('/api/interoperability/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityMflCode: '13044',
          eventType: 'PATIENT_ADMITTED',
          wardType: 'ICU',
          patientId: 'EHR-MOH-9021',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('HIMS Webhook Received & Processed', {
          description: 'Funsoft/OpenMRS event processed: ICU capacity automatically updated with 0 human data entry.',
        });
      }
    } catch (e) {
      toast.error('Webhook simulation failed');
    } finally {
      setTestingWebhook(false);
    }
  };

  const handleInspectFHIR = async () => {
    setLoadingFhir(true);
    setFhirModalOpen(true);
    try {
      const res = await fetch('/api/interoperability/fhir?referralId=1');
      const data = await res.json();
      setFhirPayload(data);
    } catch (e) {
      toast.error('Failed to load FHIR bundle');
    } finally {
      setLoadingFhir(false);
    }
  };

  return (
    <AppLayout>
      <div className="px-6 lg:px-8 py-6 max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                HIMS & National Health Stack Interoperability
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                Non-Disruptive Middleware
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Zero double-entry: SEQOY integrates on top of existing EHRs (KenyaEMR, Funsoft), Smart Triage, KHIS2/DHIS2, and Blood Banks.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleInspectFHIR}
              className="btn-secondary text-xs"
            >
              <Icon name="CodeBracketIcon" size={14} variant="outline" className="text-primary" />
              Inspect HL7 FHIR Bundle
            </button>
            <button
              onClick={handleTestAdmissionSync}
              disabled={testingWebhook}
              className="btn-primary text-xs"
            >
              <Icon name="ArrowPathIcon" size={14} variant="outline" />
              {testingWebhook ? 'Simulating...' : 'Simulate Inbound HIMS Webhook'}
            </button>
          </div>
        </div>

        {/* Value Proposition Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border p-4 rounded-xl card-glow-primary space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold">
              ⚡
            </div>
            <h3 className="text-xs font-bold text-foreground">Zero Workflow Disruption</h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Clinicians keep using their current systems (KenyaEMR, Funsoft). SEQOY silently synchronizes beds, vitals, and transfer orders in the background.
            </p>
          </div>

          <div className="bg-card border border-border p-4 rounded-xl card-glow-primary space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              🌐
            </div>
            <h3 className="text-xs font-bold text-foreground">HL7 FHIR R4 Standard</h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Standardized Patient, Observation, and ServiceRequest schemas ensure instant compliance with Ministry of Health (MOH) digital health guidelines.
            </p>
          </div>

          <div className="bg-card border border-border p-4 rounded-xl card-glow-primary space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              📊
            </div>
            <h3 className="text-xs font-bold text-foreground">Automated KHIS2 / DHIS2 Reporting</h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              MOH 711 & 105 maternal audit indicators are mapped automatically to DHIS2, cutting hours of manual paper tallying for health records officers.
            </p>
          </div>
        </div>

        {/* Connected Systems Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="section-header text-sm">Active Connected Systems & Gateways</h2>
            <span className="text-xs text-muted-foreground">{systems.length} Active Adapters</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {systems.map((sys) => (
              <div
                key={sys.id}
                className="bg-card border border-border rounded-xl p-5 card-glow-primary flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">{sys.name}</h3>
                      <p className="text-[11px] text-muted-foreground font-medium">Vendor: {sys.vendor}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {sys.status}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed mt-2">
                    {sys.description}
                  </p>
                </div>

                <div className="border-t border-border pt-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                    <span>Protocol / Spec:</span>
                    <span className="font-mono font-semibold text-primary">{sys.protocol}</span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                    <span>Active Facilities:</span>
                    <span className="font-bold text-foreground font-tabular">{sys.activeFacilitiesCount} Hospitals</span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                    <span>Last Heartbeat:</span>
                    <span className="text-foreground">{sys.lastSync}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FHIR Payload Inspector Modal */}
      <Modal
        open={fhirModalOpen}
        onClose={() => setFhirModalOpen(false)}
        title="HL7 FHIR R4 Referral Bundle Inspector"
        description="Standardized JSON FHIR bundle transmitted to receiving hospital HIMS / EHR"
        size="lg"
      >
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between bg-muted/40 p-2.5 rounded-xl border border-border">
            <span className="font-mono text-[11px] text-muted-foreground">
              GET /api/interoperability/fhir?referralId=1
            </span>
            <span className="px-2 py-0.5 bg-primary/20 text-primary font-bold rounded text-[10px]">
              200 OK · application/fhir+json
            </span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-border max-h-[50vh] overflow-y-auto font-mono text-[11px] text-emerald-400 scrollbar-thin">
            {loadingFhir ? (
              <p className="text-slate-400">Loading FHIR payload...</p>
            ) : (
              <pre>{JSON.stringify(fhirPayload, null, 2)}</pre>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(fhirPayload, null, 2));
                toast.success('FHIR bundle copied to clipboard');
              }}
              className="btn-secondary text-xs"
            >
              Copy JSON
            </button>
            <button onClick={() => setFhirModalOpen(false)} className="btn-primary text-xs">
              Close
            </button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}

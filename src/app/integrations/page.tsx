'use client';

import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import Modal from '@/components/ui/Modal';
import { toast } from 'sonner';

interface CapacityRow {
  facilityId: number;
  facilityName: string;
  syncMode: 'EHR_WEBHOOK' | 'MANUAL';
  lastWebhookSyncAt?: string;
  lastUpdated: string;
}

export default function IntegrationsPage() {
  const [facilities, setFacilities] = useState<CapacityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [fhirModalOpen, setFhirModalOpen] = useState(false);
  const [fhirPayload, setFhirPayload] = useState<any>(null);
  const [loadingFhir, setLoadingFhir] = useState(false);

  const fetchFacilities = async () => {
    try {
      const res = await fetch('/api/hospitals/capacity');
      const data = await res.json();
      setFacilities(data.capacities ?? []);
    } catch (e) {
      console.warn('Failed to load facility sync status', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const handleTestAdmissionSync = async (facilityId: number) => {
    setTestingWebhook(true);
    try {
      const res = await fetch('/api/interoperability/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facilityId, eventType: 'PATIENT_ADMITTED', wardType: 'ICU' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('HIMS webhook applied', {
          description: `ICU capacity for this facility was decremented for real — this is what happens when a hospital's own EHR calls this endpoint.`,
        });
        fetchFacilities();
      } else {
        toast.error(data.message || data.error || 'Webhook test failed');
      }
    } catch (e) {
      toast.error('Webhook test failed');
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

  const webhookConnected = facilities.filter((f) => f.syncMode === 'EHR_WEBHOOK').length;

  return (
    <AppLayout>
      <div className="px-6 lg:px-8 py-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Facility Readiness Integration</h1>
            <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
              Delay 3 works two ways: a hospital's own EHR/HIMS can push live bed/theatre updates through the webhook
              below, or — for facilities without that integration yet — a bed manager updates capacity directly in
              SEQOY. Both are shown honestly per facility; nothing here claims a live vendor connection that doesn't exist.
            </p>
          </div>
          <button onClick={handleInspectFHIR} className="btn-secondary text-xs">
            <Icon name="CodeBracketIcon" size={14} variant="outline" className="text-primary" />
            Inspect HL7 FHIR Bundle
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border p-4 rounded-xl card-glow-primary space-y-1.5">
            <h3 className="text-xs font-bold text-foreground">EHR Webhook (Zero Re-typing)</h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              A hospital's EHR/HIMS calls <code className="font-mono">/api/interoperability/webhooks</code> on every
              admission/discharge — no one re-types anything.
            </p>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl card-glow-primary space-y-1.5">
            <h3 className="text-xs font-bold text-foreground">Manual Update Fallback</h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Facilities without EHR integration use the Capacity page's bed manager screen — a 10-second update, not
              a new system to learn.
            </p>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl card-glow-primary space-y-1.5">
            <h3 className="text-xs font-bold text-foreground">HL7 FHIR R4 Shapes</h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Referral data is transformed into standard Patient/Observation/ServiceRequest resources for any EHR that
              can ingest FHIR.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="section-header text-sm">Facility Sync Status</h2>
            <span className="text-xs text-muted-foreground">
              {webhookConnected} of {facilities.length} facilities on live EHR webhook
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {!loading && facilities.length === 0 && (
              <p className="text-xs text-muted-foreground col-span-3 text-center py-8">No referral facilities configured yet.</p>
            )}
            {facilities.map((f) => (
              <div key={f.facilityId} className="bg-card border border-border rounded-xl p-5 card-glow-primary flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-sm font-bold text-foreground">{f.facilityName}</h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                        f.syncMode === 'EHR_WEBHOOK'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-muted text-muted-foreground border-border'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${f.syncMode === 'EHR_WEBHOOK' ? 'bg-emerald-400 animate-pulse' : 'bg-muted-foreground'}`} />
                      {f.syncMode === 'EHR_WEBHOOK' ? 'EHR Webhook' : 'Manual Update'}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {f.syncMode === 'EHR_WEBHOOK' && f.lastWebhookSyncAt
                      ? `Last webhook sync: ${new Date(f.lastWebhookSyncAt).toLocaleString()}`
                      : `Last manual update: ${new Date(f.lastUpdated).toLocaleString()}`}
                  </p>
                </div>
                <button
                  onClick={() => handleTestAdmissionSync(f.facilityId)}
                  disabled={testingWebhook}
                  className="btn-secondary text-xs"
                >
                  <Icon name="ArrowPathIcon" size={13} variant="outline" />
                  Send Test Admission Webhook
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Kenya Health Architecture & Strike Contingency */}
        <div className="bg-card border border-border rounded-xl p-6 card-glow-primary space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
              <Icon name="ShieldCheckIcon" size={18} variant="outline" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                Zero-Friction Hospital Integration & Strike Contingency Architecture
              </h2>
              <p className="text-xs text-muted-foreground">
                Engineered for overwhelmed clinicians, frequent government system transitions (NHIF → SHA), and strike disruptions.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <Icon name="ArrowPathRoundedSquareIcon" size={16} variant="outline" className="text-primary" />
                KenyaEMR / OpenMRS REST Sync
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Connects directly to the OpenMRS REST API (<code className="font-mono">/ws/rest/v1/encounter</code>) using
                standard CIEL medical concepts (113054 Pre-eclampsia, 230 PPH, 160085 Gestational Age). Doctors on duty
                see pre-populated triage encounters in their existing EMR without learning new software.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <Icon name="BuildingOffice2Icon" size={16} variant="outline" className="text-emerald-400" />
                Strike-Resilient Referral Corridors
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                During public hospital doctor strikes (KMPDU/KUCO) or county industrial actions, SEQOY dynamically routes
                critically ill mothers to open faith-based facilities (CHAK / KCCB: Tenwek, Kijabe, St. Luke’s) with verified
                theatre and blood availability, covered under SHA reimbursement.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <Icon name="DocumentTextIcon" size={16} variant="outline" className="text-amber-400" />
                Physical MOH 268 Referral Slips
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                For exhausted nurses who don't want to look at screens, SEQOY generates a standardized, 1-click printable
                Ministry of Health (MOH 268) referral slip carried in the ambulance. Doctors read it in 10 seconds with
                zero login requirement.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={fhirModalOpen}
        onClose={() => setFhirModalOpen(false)}
        title="HL7 FHIR R4 Referral Bundle Inspector"
        description="Standardized JSON FHIR bundle shape for a receiving hospital's EHR"
        size="lg"
      >
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between bg-muted/40 p-2.5 rounded-xl border border-border">
            <span className="font-mono text-[11px] text-muted-foreground">GET /api/interoperability/fhir?referralId=1</span>
            <span className="px-2 py-0.5 bg-primary/20 text-primary font-bold rounded text-[10px]">200 OK · application/fhir+json</span>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-border max-h-[50vh] overflow-y-auto font-mono text-[11px] text-emerald-400 scrollbar-thin">
            {loadingFhir ? <p className="text-slate-400">Loading FHIR payload...</p> : <pre>{JSON.stringify(fhirPayload, null, 2)}</pre>}
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

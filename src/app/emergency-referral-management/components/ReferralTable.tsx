'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import { toast } from 'sonner';

type ReferralStatus = 'REQUESTED' | 'ACKNOWLEDGED' | 'ACCEPTED' | 'ADMITTED' | 'COMPLETED' | 'DECLINED';

interface Referral {
  id: number;
  referralCode: string;
  patientName?: string;
  referringFacilityName?: string;
  receivingFacilityName?: string;
  clinicalIndication: string;
  bloodTypeReserved?: string;
  unreservedBloodReserved?: number;
  isAcuityOverride?: boolean;
  acuityOverrideReason?: string;
  whatsappDispatchStatus?: string;
  status: ReferralStatus;
  initiatedAt: string;
  acknowledgedAt?: string;
  admittedAt?: string;
  preArrivalHandoverNote?: string;
}

const statusFilters: (ReferralStatus | 'ALL')[] = ['ALL', 'REQUESTED', 'ACKNOWLEDGED', 'ACCEPTED', 'ADMITTED', 'COMPLETED', 'DECLINED'];

export default function ReferralTable() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ReferralStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [detailModal, setDetailModal] = useState<Referral | null>(null);
  const [dispatchingId, setDispatchingId] = useState<number | null>(null);
  const perPage = 6;

  useEffect(() => {
    fetch('/api/referrals')
      .then((res) => (res.ok ? res.json() : { referrals: [] }))
      .then((data) => setReferrals(data.referrals ?? []))
      .catch(() => setReferrals([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSendWhatsAppAlert = async (ref: Referral) => {
    setDispatchingId(ref.id);
    try {
      const res = await fetch('/api/referrals/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referralId: ref.id,
          channel: 'WHATSAPP',
          estimatedMinutes: 35,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to dispatch WhatsApp alert');
        return;
      }
      toast.success(`WhatsApp Pre-Arrival Alert Sent!`, {
        description: `Delivered to ${ref.receivingFacilityName} triage desk. Senior registrar alerted.`,
      });
      setReferrals((prev) =>
        prev.map((r) => (r.id === ref.id ? { ...r, whatsappDispatchStatus: 'DISPATCHED' } : r))
      );
      if (detailModal && detailModal.id === ref.id) {
        setDetailModal((prev) => (prev ? { ...prev, whatsappDispatchStatus: 'DISPATCHED' } : null));
      }
    } catch (e: any) {
      toast.error('Network error during dispatch', { description: e.message });
    } finally {
      setDispatchingId(null);
    }
  };

  const filtered = useMemo(() => {
    return referrals.filter((r) => {
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
      if (
        search &&
        !r.patientName?.toLowerCase().includes(search.toLowerCase()) &&
        !r.referralCode.toLowerCase().includes(search.toLowerCase()) &&
        !r.receivingFacilityName?.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [referrals, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const statusChipStyle = (s: ReferralStatus | 'ALL', active: boolean) => {
    if (!active) return 'bg-muted text-muted-foreground hover:bg-muted/80';
    const map: Record<string, string> = {
      ALL: 'bg-foreground text-background',
      REQUESTED: 'bg-info text-white',
      ACKNOWLEDGED: 'bg-high text-white',
      ACCEPTED: 'bg-primary text-primary-foreground',
      ADMITTED: 'bg-primary text-primary-foreground',
      COMPLETED: 'bg-emerald-500 text-white',
      DECLINED: 'bg-critical text-white',
    };
    return map[s] ?? 'bg-foreground text-background';
  };

  return (
    <>
      <div className="bg-card border border-border rounded-xl card-glow-primary">
        <div className="p-5 border-b border-border flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="flex-1">
            <h2 className="section-header text-base">All Facility Referrals</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{filtered.length} records matching filters</p>
          </div>
          <div className="relative">
            <Icon name="MagnifyingGlassIcon" size={14} variant="outline" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              className="input-field pl-8 w-56 text-xs h-8"
              placeholder="Search patient, code, hospital..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        <div className="px-5 py-3 border-b border-border flex items-center gap-2 overflow-x-auto scrollbar-thin">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Status:</span>
          {statusFilters.map((s) => (
            <button
              key={`refchip-${s}`}
              onClick={() => {
                setStatusFilter(s);
                setPage(1);
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-150 active:scale-95 ${statusChipStyle(s, statusFilter === s)}`}
            >
              {s === 'ALL' ? 'All Status' : s}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-xs min-w-[900px]">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left stat-label">Ref Code</th>
                <th className="px-4 py-3 text-left stat-label">Patient</th>
                <th className="px-4 py-3 text-left stat-label">Origin Clinic</th>
                <th className="px-4 py-3 text-left stat-label">Destination</th>
                <th className="px-4 py-3 text-left stat-label">Indication</th>
                <th className="px-4 py-3 text-left stat-label">Blood</th>
                <th className="px-4 py-3 text-left stat-label">WhatsApp Alert</th>
                <th className="px-4 py-3 text-left stat-label">Status</th>
                <th className="px-4 py-3 text-left stat-label">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!loading && paged.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">
                    No referrals match these filters
                  </td>
                </tr>
              )}
              {paged.map((ref) => (
                <tr key={ref.id} className="border-b border-border/50 transition-colors duration-100 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <span className="text-[11px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{ref.referralCode}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-foreground whitespace-nowrap">{ref.patientName ?? 'Enrolled Mother'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-foreground max-w-[130px] truncate">{ref.referringFacilityName}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-semibold text-foreground whitespace-nowrap">{ref.receivingFacilityName}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="px-2 py-0.5 bg-critical/10 text-critical text-[10px] font-semibold rounded-full whitespace-nowrap w-fit">
                        {ref.clinicalIndication}
                      </span>
                      {ref.isAcuityOverride && (
                        <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-black rounded uppercase w-fit">
                          ⚠️ Apex Override
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs font-bold font-tabular rounded">
                      {ref.bloodTypeReserved ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        ref.whatsappDispatchStatus === 'DISPATCHED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {ref.whatsappDispatchStatus === 'DISPATCHED' ? '✓ Dispatched' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={ref.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleSendWhatsAppAlert(ref)}
                        disabled={dispatchingId === ref.id}
                        className="p-1.5 rounded-md hover:bg-muted text-emerald-400 hover:text-emerald-300 transition-colors"
                        title="Send WhatsApp Pre-Arrival Triage Alert to Hospital Desk"
                      >
                        <Icon name="ChatBubbleLeftRightIcon" size={14} variant="outline" />
                      </button>
                      <Link
                        href={`/referrals/${ref.id}/print`}
                        target="_blank"
                        className="p-1.5 rounded-md hover:bg-muted text-emerald-400 hover:text-emerald-300 transition-colors"
                        title="Print MOH 268 Physical Referral Slip (Strike/Offline Handover)"
                      >
                        <Icon name="PrinterIcon" size={14} variant="outline" />
                      </Link>
                      <a
                        href={`/api/interoperability/fhir?referralId=${ref.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-md hover:bg-muted text-primary hover:text-primary/80 transition-colors"
                        title="View HL7 FHIR R4 Bundle (KenyaEMR Handshake)"
                      >
                        <Icon name="CodeBracketIcon" size={14} variant="outline" />
                      </a>
                      <button
                        onClick={() => setDetailModal(ref)}
                        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="View details"
                      >
                        <Icon name="EyeIcon" size={14} variant="outline" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={!!detailModal}
        onClose={() => setDetailModal(null)}
        title={`Referral ${detailModal?.referralCode}`}
        description={`${detailModal?.patientName ?? 'Enrolled Mother'} — ${detailModal?.clinicalIndication}`}
        size="lg"
      >
        {detailModal && (
          <div className="space-y-4">
            {detailModal.isAcuityOverride && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs space-y-1">
                <p className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">
                  ⚠️ Level 6 Apex Acuity Override Activated
                </p>
                <p className="text-amber-200/90 leading-relaxed">
                  {detailModal.acuityOverrideReason ||
                    'Catastrophic maternal emergency requiring Level 6 tertiary intervention (hemodialysis/sub-specialist reconstruction). Bypassed census limits under Kenya National Emergency Obstetric Protocol.'}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-[10px] text-muted-foreground uppercase mb-1">Destination Facility</p>
                <p className="font-semibold text-foreground">{detailModal.receivingFacilityName}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-[10px] text-muted-foreground uppercase mb-1">Blood Units Hold</p>
                <p className="font-semibold text-foreground">
                  {detailModal.bloodTypeReserved ?? 'Not specified'} · {detailModal.unreservedBloodReserved ? `${detailModal.unreservedBloodReserved} Emergency O- Hold` : 'Standard'}
                </p>
              </div>
            </div>

            {detailModal.preArrivalHandoverNote && (
              <div className="bg-muted/30 rounded-lg p-3 text-xs">
                <p className="text-[10px] text-muted-foreground uppercase mb-1">Handover Note</p>
                <p className="font-semibold text-foreground leading-relaxed">{detailModal.preArrivalHandoverNote}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-3 border-t border-border">
              <button
                onClick={() => handleSendWhatsAppAlert(detailModal)}
                disabled={dispatchingId === detailModal.id}
                className="btn-primary text-xs flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                <Icon name="ChatBubbleLeftRightIcon" size={14} variant="outline" />
                {detailModal.whatsappDispatchStatus === 'DISPATCHED' ? 'Resend WhatsApp Alert' : 'Send WhatsApp Triage Alert'}
              </button>
              <Link
                href={`/referrals/${detailModal.id}/print`}
                target="_blank"
                className="btn-secondary text-xs flex-1 flex items-center justify-center gap-1.5"
              >
                <Icon name="PrinterIcon" size={14} variant="outline" className="text-emerald-400" />
                Print MOH 268 Slip
              </Link>
              <a
                href={`/api/interoperability/fhir?referralId=${detailModal.id}`}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary text-xs flex-1 flex items-center justify-center gap-1.5"
              >
                <Icon name="CodeBracketIcon" size={14} variant="outline" className="text-primary" />
                FHIR R4 Bundle
              </a>
              <button onClick={() => setDetailModal(null)} className="btn-secondary text-xs px-4">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

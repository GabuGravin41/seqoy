'use client';

import React, { useState, useMemo } from 'react';
import Icon from '@/components/ui/AppIcon';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import { toast } from 'sonner';

type ReferralStatus = 'DISPATCHED' | 'IN_TRANSIT' | 'ARRIVED' | 'COMPLETED' | 'FAILED';

interface Referral {
  id: string;
  patientName: string;
  patientId: string;
  originClinic: string;
  destinationHospital: string;
  reason: string;
  bloodTypeNeeded: string;
  status: ReferralStatus;
  dispatchedAt: string;
  arrivedAt: string | null;
  eta: string | null;
  transitMinutes: number | null;
  transportProvider: string;
  preArrivalSent: boolean;
  mpdsrAuditFlagged: boolean;
  outcome: string;
  referringNurse: string;
}

const initialReferrals: Referral[] = [
  {
    id: 'SEQ-REF-2026-001',
    patientName: 'Amina Wanjiku Mwangi',
    patientId: 'pat-001',
    originClinic: 'Kangemi Health Centre',
    destinationHospital: 'Kiambu County Referral Hospital',
    reason: 'Severe Preeclampsia',
    bloodTypeNeeded: 'O-',
    status: 'IN_TRANSIT',
    dispatchedAt: '30/08/2026 16:21',
    arrivedAt: null,
    eta: '~18 min',
    transitMinutes: null,
    transportProvider: 'Ambulance (MEDIC-04)',
    preArrivalSent: true,
    mpdsrAuditFlagged: false,
    outcome: 'En route with MgSO4 administered',
    referringNurse: 'Nurse Kamau',
  },
  {
    id: 'SEQ-REF-2026-002',
    patientName: 'Achieng Otieno',
    patientId: 'pat-002',
    originClinic: 'Mathare North Clinic',
    destinationHospital: 'Pumwani Maternity Hospital',
    reason: 'Postpartum Hemorrhage',
    bloodTypeNeeded: 'A-',
    status: 'IN_TRANSIT',
    dispatchedAt: '30/08/2026 16:10',
    arrivedAt: null,
    eta: '~12 min',
    transitMinutes: null,
    transportProvider: 'Ambulance (MEDIC-01)',
    preArrivalSent: true,
    mpdsrAuditFlagged: true,
    outcome: 'IV fluids running, 2 units blood reserved',
    referringNurse: 'Nurse Waweru',
  },
  {
    id: 'SEQ-REF-2026-003',
    patientName: 'Njeri Kamau',
    patientId: 'pat-003',
    originClinic: 'Korogocho Dispensary',
    destinationHospital: 'Mama Lucy Kibaki Hospital',
    reason: 'Maternal Sepsis',
    bloodTypeNeeded: 'B+',
    status: 'DISPATCHED',
    dispatchedAt: '30/08/2026 16:28',
    arrivedAt: null,
    eta: '~25 min',
    transitMinutes: null,
    transportProvider: 'Ambulance (MEDIC-07)',
    preArrivalSent: true,
    mpdsrAuditFlagged: false,
    outcome: 'Ambulance mobilized',
    referringNurse: 'Nurse Omondi',
  },
  {
    id: 'SEQ-REF-2026-004',
    patientName: 'Fatuma Osman',
    patientId: 'pat-004',
    originClinic: 'Eastleigh Community Clinic',
    destinationHospital: 'Pumwani Maternity Hospital',
    reason: 'Severe Preeclampsia',
    bloodTypeNeeded: 'O+',
    status: 'ARRIVED',
    dispatchedAt: '30/08/2026 14:05',
    arrivedAt: '30/08/2026 14:38',
    eta: null,
    transitMinutes: 33,
    transportProvider: 'Ambulance (MEDIC-02)',
    preArrivalSent: true,
    mpdsrAuditFlagged: false,
    outcome: 'Admitted to HDU Bed #3',
    referringNurse: 'Nurse Mugo',
  },
  {
    id: 'SEQ-REF-2026-005',
    patientName: 'Grace Waweru',
    patientId: 'pat-005',
    originClinic: 'Kangemi Health Centre',
    destinationHospital: 'Kiambu County Referral Hospital',
    reason: 'Eclampsia',
    bloodTypeNeeded: 'O-',
    status: 'COMPLETED',
    dispatchedAt: '30/08/2026 11:14',
    arrivedAt: '30/08/2026 11:42',
    eta: null,
    transitMinutes: 28,
    transportProvider: 'Ambulance (MEDIC-05)',
    preArrivalSent: true,
    mpdsrAuditFlagged: true,
    outcome: 'Successful delivery in Theatre #2, mother stable',
    referringNurse: 'Nurse Njeri',
  },
];

const statusFilters = ['ALL', 'DISPATCHED', 'IN_TRANSIT', 'ARRIVED', 'COMPLETED', 'FAILED'] as const;
type StatusFilter = typeof statusFilters[number];

const reasonFilters = [
  'All Reasons',
  'Severe Preeclampsia',
  'Postpartum Hemorrhage',
  'Maternal Sepsis',
  'Eclampsia',
  'Obstructed Labour',
];

export default function ReferralTable() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [reasonFilter, setReasonFilter] = useState('All Reasons');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailModal, setDetailModal] = useState<Referral | null>(null);
  const perPage = 6;

  const filtered = useMemo(() => {
    return initialReferrals.filter((r) => {
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
      if (reasonFilter !== 'All Reasons' && r.reason !== reasonFilter) return false;
      if (
        search &&
        !r.patientName.toLowerCase().includes(search.toLowerCase()) &&
        !r.id.toLowerCase().includes(search.toLowerCase()) &&
        !r.destinationHospital.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [statusFilter, reasonFilter, search]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleAll = () => {
    if (selectedIds.length === paged.length) setSelectedIds([]);
    else setSelectedIds(paged.map((r) => r.id));
  };

  const statusChipStyle = (s: StatusFilter, active: boolean) => {
    if (!active) return 'bg-muted text-muted-foreground hover:bg-muted/80';
    const map: Record<string, string> = {
      ALL: 'bg-foreground text-background',
      DISPATCHED: 'bg-info text-white',
      IN_TRANSIT: 'bg-high text-white',
      ARRIVED: 'bg-primary text-primary-foreground',
      COMPLETED: 'bg-primary text-primary-foreground',
      FAILED: 'bg-critical text-white',
    };
    return map[s] ?? 'bg-foreground text-background';
  };

  return (
    <>
      <div className="bg-card border border-border rounded-xl card-glow-primary">
        {/* Header */}
        <div className="p-5 border-b border-border flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="flex-1">
            <h2 className="section-header text-base">All Emergency Referrals</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{filtered.length} records matching filters</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Icon
                name="MagnifyingGlassIcon"
                size={14}
                variant="outline"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                className="input-field pl-8 w-52 text-xs h-8"
                placeholder="Search patient, ID, hospital..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <select
              className="input-field text-xs h-8 w-44"
              value={reasonFilter}
              onChange={(e) => {
                setReasonFilter(e.target.value);
                setPage(1);
              }}
            >
              {reasonFilters.map((r) => (
                <option key={`reason-${r}`} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status filter chips */}
        <div className="px-5 py-3 border-b border-border flex items-center gap-2 overflow-x-auto scrollbar-thin">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Status:</span>
          {statusFilters.map((s) => (
            <button
              key={`refchip-${s}`}
              onClick={() => {
                setStatusFilter(s);
                setPage(1);
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-150 active:scale-95 ${statusChipStyle(
                s,
                statusFilter === s
              )}`}
            >
              {s === 'ALL' ? 'All Status' : s.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-xs min-w-[1100px]">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left w-8">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === paged.length && paged.length > 0}
                    onChange={toggleAll}
                    className="rounded border-border bg-input accent-primary"
                    aria-label="Select all referrals on this page"
                  />
                </th>
                <th className="px-4 py-3 text-left stat-label">Ref Code</th>
                <th className="px-4 py-3 text-left stat-label">Patient</th>
                <th className="px-4 py-3 text-left stat-label">Origin Clinic</th>
                <th className="px-4 py-3 text-left stat-label">Destination</th>
                <th className="px-4 py-3 text-left stat-label">Indication</th>
                <th className="px-4 py-3 text-left stat-label">Blood</th>
                <th className="px-4 py-3 text-left stat-label">Status</th>
                <th className="px-4 py-3 text-left stat-label">Dispatched</th>
                <th className="px-4 py-3 text-left stat-label">Transit Time</th>
                <th className="px-4 py-3 text-left stat-label">Outcome</th>
                <th className="px-4 py-3 text-left stat-label">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((ref) => (
                <tr
                  key={ref.id}
                  className={`border-b border-border/50 transition-colors duration-100 hover:bg-muted/30 ${
                    selectedIds.includes(ref.id) ? 'bg-primary/5' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(ref.id)}
                      onChange={() => toggleSelect(ref.id)}
                      className="rounded border-border bg-input accent-primary"
                      aria-label={`Select referral ${ref.id}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {ref.id}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-foreground whitespace-nowrap">{ref.patientName}</p>
                    <p className="text-[10px] text-muted-foreground">{ref.referringNurse}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-foreground max-w-[130px] truncate">{ref.originClinic}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-semibold text-foreground whitespace-nowrap">
                      {ref.destinationHospital}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-critical/10 text-critical text-[10px] font-semibold rounded-full whitespace-nowrap">
                      {ref.reason}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs font-bold font-tabular rounded">
                      {ref.bloodTypeNeeded}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={ref.status} label={ref.status.replace('_', ' ')} />
                    {ref.eta && <p className="text-[10px] text-accent font-tabular mt-0.5">ETA {ref.eta}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-foreground font-tabular whitespace-nowrap">
                      {ref.dispatchedAt.split(' ')[1]}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    {ref.transitMinutes !== null ? (
                      <span className="text-xs font-bold text-primary font-tabular">{ref.transitMinutes} min</span>
                    ) : (
                      <span className="text-xs text-muted-foreground font-tabular">In Transit</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-foreground max-w-[180px] truncate">{ref.outcome}</p>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setDetailModal(ref)}
                      className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      title="View details"
                    >
                      <Icon name="EyeIcon" size={14} variant="outline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        open={!!detailModal}
        onClose={() => setDetailModal(null)}
        title={`Referral ${detailModal?.id}`}
        description={`${detailModal?.patientName} — ${detailModal?.reason}`}
        size="lg"
      >
        {detailModal && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-[10px] text-muted-foreground uppercase mb-1">Patient</p>
                <p className="font-semibold text-foreground">{detailModal.patientName}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-[10px] text-muted-foreground uppercase mb-1">Destination Facility</p>
                <p className="font-semibold text-foreground">{detailModal.destinationHospital}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-[10px] text-muted-foreground uppercase mb-1">Required Blood</p>
                <p className="font-semibold text-foreground">{detailModal.bloodTypeNeeded}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-[10px] text-muted-foreground uppercase mb-1">Transport Provider</p>
                <p className="font-semibold text-foreground">{detailModal.transportProvider}</p>
              </div>
            </div>

            <div className="bg-muted/30 rounded-lg p-3 text-xs">
              <p className="text-[10px] text-muted-foreground uppercase mb-1">Clinical Outcome & Care Note</p>
              <p className="font-semibold text-foreground leading-relaxed">{detailModal.outcome}</p>
            </div>

            <div className="flex gap-3 pt-2 border-t border-border">
              <button onClick={() => setDetailModal(null)} className="btn-secondary flex-1 text-xs">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

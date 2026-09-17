'use client';

import React, { useState } from 'react';
import { useCurrentUser } from '@/context/AuthContext';
import Icon from '@/components/ui/AppIcon';
import Modal from '@/components/ui/Modal';
import { toast } from 'sonner';

interface BloodEntry {
  type: string;
  hospitals: { name: string; units: number }[];
}

const initialBloodData: BloodEntry[] = [
  {
    type: 'O−',
    hospitals: [
      { name: 'KNH', units: 0 },
      { name: 'Pumwani', units: 8 },
      { name: 'Mama Lucy', units: 1 },
      { name: 'Kiambu Level 5', units: 6 },
      { name: 'Mbagathi', units: 2 },
    ],
  },
  {
    type: 'O+',
    hospitals: [
      { name: 'KNH', units: 5 },
      { name: 'Pumwani', units: 18 },
      { name: 'Mama Lucy', units: 11 },
      { name: 'Kiambu Level 5', units: 16 },
      { name: 'Mbagathi', units: 9 },
    ],
  },
  {
    type: 'A−',
    hospitals: [
      { name: 'KNH', units: 0 },
      { name: 'Pumwani', units: 4 },
      { name: 'Mama Lucy', units: 2 },
      { name: 'Kiambu Level 5', units: 3 },
      { name: 'Mbagathi', units: 1 },
    ],
  },
  {
    type: 'A+',
    hospitals: [
      { name: 'KNH', units: 2 },
      { name: 'Pumwani', units: 11 },
      { name: 'Mama Lucy', units: 5 },
      { name: 'Kiambu Level 5', units: 8 },
      { name: 'Mbagathi', units: 4 },
    ],
  },
  {
    type: 'B−',
    hospitals: [
      { name: 'KNH', units: 0 },
      { name: 'Pumwani', units: 3 },
      { name: 'Mama Lucy', units: 2 },
      { name: 'Kiambu Level 5', units: 2 },
      { name: 'Mbagathi', units: 1 },
    ],
  },
  {
    type: 'B+',
    hospitals: [
      { name: 'KNH', units: 3 },
      { name: 'Pumwani', units: 7 },
      { name: 'Mama Lucy', units: 7 },
      { name: 'Kiambu Level 5', units: 6 },
      { name: 'Mbagathi', units: 5 },
    ],
  },
  {
    type: 'AB−',
    hospitals: [
      { name: 'KNH', units: 0 },
      { name: 'Pumwani', units: 2 },
      { name: 'Mama Lucy', units: 1 },
      { name: 'Kiambu Level 5', units: 2 },
      { name: 'Mbagathi', units: 0 },
    ],
  },
  {
    type: 'AB+',
    hospitals: [
      { name: 'KNH', units: 1 },
      { name: 'Pumwani', units: 6 },
      { name: 'Mama Lucy', units: 3 },
      { name: 'Kiambu Level 5', units: 4 },
      { name: 'Mbagathi', units: 2 },
    ],
  },
];

function getCellStyle(units: number): string {
  if (units === 0) return 'bg-critical/25 text-critical font-bold border border-critical/30';
  if (units <= 2) return 'bg-moderate/20 text-moderate font-semibold border border-moderate/30';
  if (units <= 6) return 'bg-primary/10 text-primary border border-primary/20';
  return 'bg-primary/20 text-primary font-semibold border border-primary/30';
}

const hospitalShortNames = ['KNH', 'Pumwani', 'Mama Lucy', 'Kiambu L5', 'Mbagathi'];

export default function BloodBankHeatmap() {
  const currentUser = useCurrentUser();
  const [data, setData] = useState<BloodEntry[]>(initialBloodData);
  const [editModal, setEditModal] = useState<{ type: string; hospitalName: string; units: number } | null>(null);

  const handleUpdateUnits = (delta: number) => {
    if (!editModal) return;
    const newUnits = Math.max(0, editModal.units + delta);
    setEditModal({ ...editModal, units: newUnits });

    setData((prev) =>
      prev.map((row) => {
        if (row.type === editModal.type) {
          return {
            ...row,
            hospitals: row.hospitals.map((h) =>
              h.name === editModal.hospitalName ? { ...h, units: newUnits } : h
            ),
          };
        }
        return row;
      })
    );
  };

  const handleBroadcastShortage = () => {
    if (!editModal) return;
    toast.error(`Emergency Blood Broadcast: ${editModal.type} Shortage Alert`, {
      description: `Dispatched to Kenya National Blood Transfusion Service (KNBTS) and surrounding Nairobi blood banks.`,
    });
    setEditModal(null);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5 card-glow-primary h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="section-header">Blood Bank Inventory</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Units available by blood group across facilities</p>
          </div>
          {currentUser.permissions.canUpdateBloodStock && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">
              🩸 Lab Officer Mode
            </span>
          )}
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left pb-2 pr-3 stat-label w-10">Type</th>
                {hospitalShortNames.map((h) => (
                  <th key={`bh-${h}`} className="text-center pb-2 px-1 stat-label whitespace-nowrap text-[10px]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="space-y-1">
              {data.map((row) => (
                <tr key={`blood-${row.type}`} className="border-t border-border/50">
                  <td className="py-1.5 pr-3 font-bold text-foreground font-tabular">{row.type}</td>
                  {row.hospitals.map((cell) => (
                    <td key={`blood-${row.type}-${cell.name}`} className="py-1.5 px-1 text-center">
                      <button
                        onClick={() => {
                          if (currentUser.permissions.canUpdateBloodStock) {
                            setEditModal({ type: row.type, hospitalName: cell.name, units: cell.units });
                          }
                        }}
                        disabled={!currentUser.permissions.canUpdateBloodStock}
                        className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-tabular min-w-[32px] transition ${
                          currentUser.permissions.canUpdateBloodStock
                            ? 'cursor-pointer hover:ring-2 hover:ring-primary'
                            : ''
                        } ${getCellStyle(cell.units)}`}
                        title={
                          currentUser.permissions.canUpdateBloodStock
                            ? `Click to edit ${row.type} units at ${cell.name}`
                            : `${cell.units} units`
                        }
                      >
                        {cell.units === 0 ? '0' : cell.units}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border flex-wrap gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Status:</p>
          <span className="flex items-center gap-1 text-[10px] text-critical">
            <span className="w-2.5 h-2.5 rounded bg-critical/25 border border-critical/40" />
            Out of stock (0)
          </span>
          <span className="flex items-center gap-1 text-[10px] text-moderate">
            <span className="w-2.5 h-2.5 rounded bg-moderate/20 border border-moderate/40" />
            Low (≤2)
          </span>
          <span className="flex items-center gap-1 text-[10px] text-primary">
            <span className="w-2.5 h-2.5 rounded bg-primary/20 border border-primary/40" />
            Adequate (3+)
          </span>
        </div>
      </div>

      {/* Blood Edit Modal for Lab Officer */}
      <Modal
        open={!!editModal}
        onClose={() => setEditModal(null)}
        title={`Update ${editModal?.type} Stock`}
        description={`Facility: ${editModal?.hospitalName} Blood Transfusion Unit`}
        size="sm"
      >
        {editModal && (
          <div className="space-y-4 text-xs">
            <div className="bg-muted/40 p-4 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground uppercase">Available Units</p>
                <p className="text-2xl font-bold font-tabular text-primary">{editModal.units}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdateUnits(-1)}
                  disabled={editModal.units <= 0}
                  className="w-9 h-9 bg-muted hover:bg-muted/80 disabled:opacity-30 rounded-lg text-sm font-bold border border-border flex items-center justify-center text-foreground"
                >
                  -1
                </button>
                <button
                  onClick={() => handleUpdateUnits(1)}
                  className="w-9 h-9 bg-primary/20 hover:bg-primary/30 rounded-lg text-sm font-bold border border-primary/30 flex items-center justify-center text-primary"
                >
                  +1
                </button>
              </div>
            </div>

            {editModal.units <= 1 && (
              <div className="bg-critical/10 border border-critical/30 p-3 rounded-xl space-y-2">
                <p className="text-critical font-bold flex items-center gap-1.5">
                  <Icon name="ExclamationTriangleIcon" size={14} variant="solid" />
                  Critical Blood Shortage Alert
                </p>
                <p className="text-muted-foreground text-[11px]">
                  {editModal.type} blood is critically low. Broadcast emergency replenishment request across county facilities.
                </p>
                <button
                  onClick={handleBroadcastShortage}
                  className="btn-danger w-full text-xs py-1.5"
                >
                  Broadcast Shortage to KNBTS
                </button>
              </div>
            )}

            <div className="pt-2 border-t border-border flex justify-end">
              <button onClick={() => setEditModal(null)} className="btn-primary text-xs py-1.5 px-4">
                Done
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

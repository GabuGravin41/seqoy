'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const data = [
  { reason: 'Preeclampsia', count: 11, color: 'var(--critical)' },
  { reason: 'PPH', count: 8, color: 'var(--high)' },
  { reason: 'Obstructed Labour', count: 6, color: 'var(--moderate)' },
  { reason: 'Maternal Sepsis', count: 5, color: 'var(--accent)' },
  { reason: 'Eclampsia', count: 3, color: 'var(--critical)' },
  { reason: 'Fetal Distress', count: 2, color: 'var(--primary)' },
];

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-xs">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      <p className="text-muted-foreground">
        <span className="font-bold text-foreground font-tabular">{payload[0].value}</span> referrals this month
      </p>
    </div>
  );
}

export default function ReferralVolumeChartInner() {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="reason"
          tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
          axisLine={false}
          tickLine={false}
          width={115}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={16}>
          {data.map((entry) => (
            <Cell key={`ref-cell-${entry.reason}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

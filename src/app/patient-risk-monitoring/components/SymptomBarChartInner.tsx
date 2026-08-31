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
  { symptom: 'Severe Headache', count: 38, severity: 'high' },
  { symptom: 'Swelling (Oedema)', count: 52, severity: 'moderate' },
  { symptom: 'Blurred Vision', count: 21, severity: 'critical' },
  { symptom: 'Reduced Fetal Movement', count: 29, severity: 'high' },
  { symptom: 'Vaginal Bleeding', count: 14, severity: 'critical' },
  { symptom: 'Severe Abdominal Pain', count: 17, severity: 'critical' },
  { symptom: 'High BP (Self-reported)', count: 44, severity: 'high' },
  { symptom: 'Fever / Chills', count: 23, severity: 'moderate' },
];

const severityColors: Record<string, string> = {
  critical: 'var(--critical)',
  high: 'var(--high)',
  moderate: 'var(--moderate)',
};

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-xs">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      <p className="text-muted-foreground">
        Reported by <span className="font-bold text-foreground font-tabular">{payload[0].value}</span> patients
      </p>
    </div>
  );
}

export default function SymptomBarChartInner() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="symptom"
          tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
          axisLine={false}
          tickLine={false}
          width={130}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={14}>
          {data.map((entry) => (
            <Cell key={`cell-symptom-${entry.symptom}`} fill={severityColors[entry.severity]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

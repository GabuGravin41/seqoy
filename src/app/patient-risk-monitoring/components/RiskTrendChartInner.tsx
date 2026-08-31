'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

const data = [
  { date: '17 Aug', avgRisk: 3.1 },
  { date: '18 Aug', avgRisk: 3.2 },
  { date: '19 Aug', avgRisk: 3.0 },
  { date: '20 Aug', avgRisk: 3.3 },
  { date: '21 Aug', avgRisk: 3.5 },
  { date: '22 Aug', avgRisk: 3.4 },
  { date: '23 Aug', avgRisk: 3.6 },
  { date: '24 Aug', avgRisk: 3.8 },
  { date: '25 Aug', avgRisk: 3.5 },
  { date: '26 Aug', avgRisk: 3.7 },
  { date: '27 Aug', avgRisk: 3.9 },
  { date: '28 Aug', avgRisk: 3.8 },
  { date: '29 Aug', avgRisk: 4.1 },
  { date: '30 Aug', avgRisk: 3.7 },
];

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-xs">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      <p className="text-muted-foreground">
        Avg risk score:{' '}
        <span className="font-bold text-foreground font-tabular">{payload[0].value.toFixed(1)}</span> / 10
      </p>
    </div>
  );
}

export default function RiskTrendChartInner() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 4, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
          axisLine={false}
          tickLine={false}
          interval={2}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
          axisLine={false}
          tickLine={false}
          domain={[2, 6]}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine
          y={5}
          stroke="var(--critical)"
          strokeDasharray="4 4"
          strokeWidth={1}
          label={{ value: 'HIGH threshold', fontSize: 9, fill: 'var(--critical)' }}
        />
        <ReferenceLine y={3} stroke="var(--moderate)" strokeDasharray="4 4" strokeWidth={1} />
        <Line
          type="monotone"
          dataKey="avgRisk"
          stroke="var(--primary)"
          strokeWidth={2}
          dot={{ r: 3, fill: 'var(--primary)', strokeWidth: 0 }}
          activeDot={{ r: 5, fill: 'var(--primary)' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

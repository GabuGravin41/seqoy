'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { time: '04:00', pumwani: 8, kiambu: 6, knh: 2 },
  { time: '06:00', pumwani: 7, kiambu: 6, knh: 1 },
  { time: '08:00', pumwani: 5, kiambu: 5, knh: 1 },
  { time: '10:00', pumwani: 6, kiambu: 5, knh: 0 },
  { time: '12:00', pumwani: 4, kiambu: 4, knh: 0 },
  { time: '14:00', pumwani: 4, kiambu: 5, knh: 0 },
  { time: '16:00', pumwani: 4, kiambu: 4, knh: 0 },
];

interface TooltipPayload {
  name: string;
  value: number;
  color: string;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-xs space-y-1.5">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      {payload.map((p) => (
        <div key={`tip-${p.name}`} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            {p.name}
          </span>
          <span className="font-bold font-tabular" style={{ color: p.color }}>
            {p.value} beds
          </span>
        </div>
      ))}
    </div>
  );
}

export default function CapacityTrendChartInner() {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="gradPumwani" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25} />
            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradKiambu" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--info)" stopOpacity={0.2} />
            <stop offset="95%" stopColor="var(--info)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradKnh" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--critical)" stopOpacity={0.2} />
            <stop offset="95%" stopColor="var(--critical)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
          axisLine={false}
          tickLine={false}
          domain={[0, 10]}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="pumwani"
          name="Pumwani"
          stroke="var(--primary)"
          strokeWidth={2}
          fill="url(#gradPumwani)"
          dot={false}
          activeDot={{ r: 4, fill: 'var(--primary)' }}
        />
        <Area
          type="monotone"
          dataKey="kiambu"
          name="Kiambu L5"
          stroke="var(--info)"
          strokeWidth={2}
          fill="url(#gradKiambu)"
          dot={false}
          activeDot={{ r: 4, fill: 'var(--info)' }}
        />
        <Area
          type="monotone"
          dataKey="knh"
          name="KNH"
          stroke="var(--critical)"
          strokeWidth={2}
          fill="url(#gradKnh)"
          dot={false}
          activeDot={{ r: 4, fill: 'var(--critical)' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

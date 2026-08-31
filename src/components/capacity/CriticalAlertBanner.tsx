'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

const alerts = [
  {
    id: 'alert-001',
    type: 'critical' as const,
    message:
      'KNH ICU at 100% capacity (0 beds available) — redirect all emergency obstetric referrals to Pumwani or Kiambu County Referral Hospital',
  },
  {
    id: 'alert-002',
    type: 'warning' as const,
    message:
      'O-Negative blood stock critically low at Mama Lucy Kibaki Hospital — 1 unit remaining in blood bank',
  },
];

export default function CriticalAlertBanner() {
  const [dismissed, setDismissed] = useState<string[]>([]);

  const visible = alerts.filter((a) => !dismissed.includes(a.id));
  if (visible.length === 0) return null;

  return (
    <div className="space-y-2">
      {visible.map((alert) => (
        <div
          key={alert.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-xs font-medium fade-in ${
            alert.type === 'critical'
              ? 'bg-critical/10 border-critical/30 text-critical'
              : 'bg-accent/10 border-accent/30 text-accent'
          }`}
        >
          <Icon
            name={alert.type === 'critical' ? 'ExclamationCircleIcon' : 'ExclamationTriangleIcon'}
            size={18}
            variant="solid"
            className="flex-shrink-0 mt-0.5"
          />
          <p className="flex-1 leading-relaxed">{alert.message}</p>
          <button
            onClick={() => setDismissed((d) => [...d, alert.id])}
            className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Dismiss alert"
          >
            <Icon name="XMarkIcon" size={16} variant="outline" />
          </button>
        </div>
      ))}
    </div>
  );
}

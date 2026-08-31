import React from 'react';
import MetricCard from '@/components/ui/MetricCard';

export default function PatientKPICards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <MetricCard
        label="Critical Risk Patients"
        value="5"
        subtext="Require immediate clinical review"
        trend={{ value: '+2 since yesterday', direction: 'up', positive: false }}
        icon="ExclamationCircleIcon"
        iconVariant="solid"
        variant="critical"
      />
      <MetricCard
        label="Unreachable (48h+)"
        value="11"
        subtext="No Voice AI or USSD response"
        trend={{ value: '4.5% of enrolled', direction: 'neutral', positive: false }}
        icon="PhoneXMarkIcon"
        variant="warning"
      />
      <MetricCard
        label="Call Completion Rate"
        value="83.2%"
        subtext="Last 7 days — 206 / 247 calls answered"
        trend={{ value: '+1.4% vs last week', direction: 'up', positive: true }}
        icon="PhoneArrowUpRightIcon"
        variant="positive"
      />
      <MetricCard
        label="Avg Risk Score"
        value="3.7"
        subtext="Scale 1–10 across active patients"
        trend={{ value: '+0.3 this week', direction: 'up', positive: false }}
        icon="ChartBarIcon"
        variant="default"
      />
    </div>
  );
}

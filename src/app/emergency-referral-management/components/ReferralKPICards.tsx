import React from 'react';
import MetricCard from '@/components/ui/MetricCard';

export default function ReferralKPICards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <MetricCard
        label="Active Referrals (In Transit)"
        value="3"
        subtext="Patients currently en route via Emergency Transport"
        trend={{ value: '2 dispatched this hour', direction: 'up', positive: false }}
        icon="TruckIcon"
        variant="warning"
      />
      <MetricCard
        label="Avg Transit Time (30d)"
        value="28 min"
        subtext="Clinic to hospital door-to-door"
        trend={{ value: '−4 min vs last month', direction: 'down', positive: true }}
        icon="ClockIcon"
        variant="positive"
      />
      <MetricCard
        label="Referral Success Rate (30d)"
        value="91.4%"
        subtext="32 of 35 referrals resulted in timely admission"
        trend={{ value: '+3.2% vs prior month', direction: 'up', positive: true }}
        icon="CheckCircleIcon"
        variant="positive"
      />
    </div>
  );
}

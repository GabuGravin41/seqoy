import React from 'react';
import MetricCard from '@/components/ui/MetricCard';

export default function ReferralKPICards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <MetricCard
        label="Active Referrals"
        value="3"
        subtext="Awaiting acknowledgement from the receiving facility"
        trend={{ value: '2 sent this hour', direction: 'up', positive: false }}
        icon="ArrowsRightLeftIcon"
        variant="warning"
      />
      <MetricCard
        label="Avg. Time to Admission (30d)"
        value="14 min"
        subtext="From facility acknowledgement to patient admitted"
        trend={{ value: '−3 min vs last month', direction: 'down', positive: true }}
        icon="ClockIcon"
        variant="positive"
      />
      <MetricCard
        label="Referral Acceptance Rate (30d)"
        value="91.4%"
        subtext="32 of 35 referrals accepted by the receiving facility"
        trend={{ value: '+3.2% vs prior month', direction: 'up', positive: true }}
        icon="CheckCircleIcon"
        variant="positive"
      />
    </div>
  );
}

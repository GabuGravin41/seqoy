import React from 'react';
import AppLayout from '@/components/AppLayout';
import ReferralHeader from './components/ReferralHeader';
import ReferralKPICards from './components/ReferralKPICards';
import ReferralPipeline from './components/ReferralPipeline';
import ReferralTable from './components/ReferralTable';
import ReferralVolumeChart from './components/ReferralVolumeChart';

export default function EmergencyReferralManagementPage() {
  return (
    <AppLayout>
      <div className="px-6 lg:px-8 py-6 max-w-screen-2xl mx-auto space-y-6">
        <ReferralHeader />
        <ReferralKPICards />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2">
            <ReferralPipeline />
          </div>
          <div className="xl:col-span-1">
            <ReferralVolumeChart />
          </div>
        </div>
        <ReferralTable />
      </div>
    </AppLayout>
  );
}

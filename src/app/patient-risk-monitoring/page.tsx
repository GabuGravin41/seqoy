import React from 'react';
import AppLayout from '@/components/AppLayout';
import PatientMonitoringHeader from './components/PatientMonitoringHeader';
import PatientKPICards from './components/PatientKPICards';
import PatientRiskCharts from './components/PatientRiskCharts';
import PatientTable from './components/PatientTable';
import HealthCheckInPanel from './components/HealthCheckInPanel';

export default function PatientRiskMonitoringPage() {
  return (
    <AppLayout>
      <div className="px-6 lg:px-8 py-6 max-w-screen-2xl mx-auto space-y-6">
        <PatientMonitoringHeader />
        <PatientKPICards />
        <PatientRiskCharts />
        {/* Conversational AI Health Check-In Panel */}
        <HealthCheckInPanel
          patientName="Amina Wanjiku"
          gestationalWeek={34}
        />
        <PatientTable />
      </div>
    </AppLayout>
  );
}

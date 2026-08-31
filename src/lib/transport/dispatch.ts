// SEQOY Emergency Transport & Ambulance Dispatch Engine

export interface DispatchRequest {
  referralId: number;
  referringFacilityId: number;
  referringFacilityName: string;
  receivingFacilityId: number;
  receivingFacilityName: string;
  patientName: string;
  clinicalIndication: string;
  urgencyLevel: 'CRITICAL_STAT' | 'HIGH' | 'ROUTINE';
  requiredEquipment?: string[];
}

export interface DispatchResult {
  dispatchId: string;
  ambulanceCallSign: string;
  driverName: string;
  driverPhone: string;
  estimatedArrivalMinutes: number;
  status: 'DISPATCHED' | 'EN_ROUTE_TO_PICKUP' | 'PATIENT_LOADED' | 'ARRIVED_DESTINATION';
  liveTrackingUrl: string;
  dispatchedAt: string;
}

const activeFleet = [
  { callSign: 'MEDIC-01', driver: 'Otieno James', phone: '+254 711 001 002', baseLocation: 'Westlands Station' },
  { callSign: 'MEDIC-04', driver: 'Mwangi Peter', phone: '+254 722 004 005', baseLocation: 'Pumwani Standby' },
  { callSign: 'MEDIC-07', driver: 'Kiprono Eric', phone: '+254 733 007 008', baseLocation: 'Thika Road Depot' },
];

export async function dispatchEmergencyAmbulance(request: DispatchRequest): Promise<DispatchResult> {
  const selectedVehicle = activeFleet[Math.floor(Math.random() * activeFleet.length)];
  const estimatedMinutes = request.urgencyLevel === 'CRITICAL_STAT' ? 14 : 22;
  const dispatchId = `DISPATCH-${Date.now().toString().slice(-6)}`;

  return {
    dispatchId,
    ambulanceCallSign: selectedVehicle.callSign,
    driverName: selectedVehicle.driver,
    driverPhone: selectedVehicle.phone,
    estimatedArrivalMinutes: estimatedMinutes,
    status: 'DISPATCHED',
    liveTrackingUrl: `https://track.seqoy.health/dispatch/${dispatchId}`,
    dispatchedAt: new Date().toISOString(),
  };
}

'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { initialPatients } from '@/db/mock-store';
import { toast } from 'sonner';

export default function MotherPassPage() {
  const params = useParams();
  const patientId = params.id ? parseInt(params.id as string) : 1;
  const mother = initialPatients.find((p) => p.id === patientId) || initialPatients[0];

  const handleCallEmergency = () => {
    window.location.href = 'tel:0711000202';
  };

  const handleDialUSSD = () => {
    window.location.href = 'tel:*384%23';
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-6">
        {/* Header Branding */}
        <div className="flex items-center justify-between border-b border-slate-700 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold">
              🌸
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">Kadi ya Wazazi (SEQOY)</h1>
              <p className="text-[10px] text-teal-400 font-semibold">Kliniki ya Afya ya Mama na Mtoto</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
            MFL-13044
          </span>
        </div>

        {/* Mother Profile Card */}
        <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-bold text-white">{mother.fullName}</h2>
              <p className="text-xs text-slate-400">{mother.phoneNumber}</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">
              {mother.bloodType || 'O+'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/40 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase">Umri wa Mimba:</span>
              <p className="font-bold text-teal-400 text-sm">Wiki {mother.gestationalWeeks}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase">Tarehe ya Kujifungua:</span>
              <p className="font-semibold text-slate-200 text-xs">{mother.estimatedDeliveryDate}</p>
            </div>
          </div>
        </div>

        {/* Next Clinic Date Reminder */}
        <div className="p-3.5 rounded-2xl bg-teal-950/40 border border-teal-500/30 flex items-center gap-3 text-xs">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0">
            <Icon name="CalendarDaysIcon" size={20} variant="outline" />
          </div>
          <div>
            <p className="font-bold text-teal-200">Tarehe ya Kliniki Ijayo</p>
            <p className="text-slate-300 text-[11px]">Jumanne, 15 Septemba 2026 (Kangemi)</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <button
            onClick={handleCallEmergency}
            className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition"
          >
            <Icon name="PhoneIcon" size={18} variant="solid" />
            Piga Simu ya Dharura (Ambulance)
          </button>

          <button
            onClick={handleDialUSSD}
            className="w-full py-3 rounded-2xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold text-xs border border-slate-600 flex items-center justify-center gap-2 transition"
          >
            <Icon name="RadioIcon" size={16} variant="outline" />
            Fungua Menyu ya USSD (*384#)
          </button>
        </div>

        {/* Saturday Call Indicator */}
        <div className="text-center pt-2 border-t border-slate-700/60">
          <p className="text-[11px] text-slate-400">
            📞 Simu yako ya kila Jumamosi itapigwa saa <strong className="text-teal-400">2:00 Alasiri (14:00 EAT)</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}

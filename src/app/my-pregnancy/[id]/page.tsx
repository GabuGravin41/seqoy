'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { initialPatients } from '@/db/mock-store';
import { toast } from 'sonner';

interface Message {
  role: 'assistant' | 'user';
  text: string;
  isDanger?: boolean;
}

export default function MotherPassPage() {
  const params = useParams();
  const patientId = params.id ? parseInt(params.id as string) : 1;
  const mother = initialPatients.find((p) => p.id === patientId) || initialPatients[0];

  const [language, setLanguage] = useState<'SWAHILI' | 'ENGLISH'>('SWAHILI');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text:
        language === 'SWAHILI'
          ? `Habari Mama ${mother.fullName.split(' ')[0]}! Jina langu ni Daktari AI kutoka SEQOY. Unaendeleaje leo? Ikiwa unahisi dalili yoyote au unahitaji ushauri kuhusu mimba yako, niambie hapa chini au bonyeza dalili zilizo hapa chini.`
          : `Hello Mama ${mother.fullName.split(' ')[0]}! I am Daktari AI from SEQOY. How are you feeling today? If you are experiencing any symptoms or need pregnancy advice, type below or tap one of the common signs.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasDangerFlag, setHasDangerFlag] = useState(false);

  const quickSymptoms =
    language === 'SWAHILI'
      ? [
          { label: '🤕 Kichwa Kinauma Sana', text: 'Nina maumivu makali ya kichwa yasiyoisha na kizunguzungu' },
          { label: '👁️ Macho Yana Ukungu', text: 'Naona ukungu na madoa meusi machoni' },
          { label: '🦶 Miguu Imevimba', text: 'Miguu na mikono yangu imevimba ghafla sana' },
          { label: '🩸 Kutoka Damu', text: 'Ninaona damu inatoka ukeni' },
          { label: '👶 Mtoto Hatikisiki', text: 'Mtoto wangu hatikisiki wala kucheza tangu asubuhi' },
          { label: '💧 Maji Yanavuja', text: 'Ninahisi maji yanavuja bila kukoma' },
        ]
      : [
          { label: '🤕 Severe Headache', text: 'I have a persistent severe headache and dizziness' },
          { label: '👁️ Blurred Vision', text: 'I am seeing dark spots and flashes of light' },
          { label: '🦶 Swollen Feet/Face', text: 'My feet and face are swelling suddenly' },
          { label: '🩸 Vaginal Bleeding', text: 'I noticed vaginal bleeding' },
          { label: '👶 Reduced Movement', text: 'My baby has stopped kicking today' },
          { label: '💧 Fluid Leakage', text: 'I feel clear watery fluid leaking' },
        ];

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: Message = { role: 'user', text: query };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    const lower = query.toLowerCase();
    const isSeverePreeclampsia =
      lower.includes('kichwa') ||
      lower.includes('headache') ||
      lower.includes('macho') ||
      lower.includes('vision') ||
      lower.includes('miguu') ||
      lower.includes('swelling') ||
      lower.includes('uvimbe');
    const isBleeding = lower.includes('damu') || lower.includes('bleeding');
    const isReducedFetal = lower.includes('hatikisiki') || lower.includes('kicking') || lower.includes('movement');

    setTimeout(() => {
      let reply = '';
      let danger = false;

      if (isSeverePreeclampsia) {
        danger = true;
        setHasDangerFlag(true);
        reply =
          language === 'SWAHILI'
            ? '⚠️ Pole sana Mama! Maumivu makali ya kichwa pamoja na ukungu machoni au miguu kuvimba ni dalili za hatari za Shinikizo la Juu la Damu (Preeclampsia). Tafadhali usisubiri! Nenda kwenye kituo cha afya kilicho karibu haraka sana, au bonyeza kitufe chekundu cha dharura hapa chini kupata msaada wa gari la wagonjwa.'
            : '⚠️ Attention Mama! Severe headache with visual changes or sudden swelling are critical warning signs of Preeclampsia (high blood pressure). Please do not wait! Go to your nearest health centre immediately or tap the red emergency button below for ambulance transport.';
      } else if (isBleeding) {
        danger = true;
        setHasDangerFlag(true);
        reply =
          language === 'SWAHILI'
            ? '⚠️ Kutoka damu wakati wowote wa ujauzito ni dharura inayohitaji uchunguzi wa daktari mara moja. Tafadhali lala chini kwa utulivu na piga simu ya dharura ya ambulance mara moja.'
            : '⚠️ Vaginal bleeding during pregnancy is a medical emergency that requires prompt evaluation. Please lie down and call the emergency ambulance hotline immediately.';
      } else if (isReducedFetal) {
        danger = true;
        setHasDangerFlag(true);
        reply =
          language === 'SWAHILI'
            ? 'Mtoto kupunguza mwendo ni sababu ya kwenda kliniki mara moja ili wauguzi wapime mapigo ya moyo wa mtoto (fetal heart rate). Fika katika Kangemi Health Centre leo.'
            : 'Reduced fetal movement requires immediate clinical monitoring of the fetal heartbeat. Please visit Kangemi Health Centre today without delay.';
      } else {
        reply =
          language === 'SWAHILI'
            ? 'Asante kwa kueleza Mama. Dalili hii inaonekana ya kawaida, lakini ni muhimu kunywa maji ya kutosha na kupumzika. Ikiwa utahisi kizunguzungu au maumivu makali, tuambie mara moja.'
            : 'Thank you for sharing Mama. This symptom appears manageable, but please stay hydrated and rest. If you experience severe pain or visual spots, alert us immediately.';
      }

      setMessages((prev) => [...prev, { role: 'assistant', text: reply, isDanger: danger }]);
      setLoading(false);
    }, 800);
  };

  const handleCallEmergency = () => {
    window.location.href = 'tel:0711000202';
  };

  const handleDialUSSD = () => {
    window.location.href = 'tel:*384%23';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col items-center py-6 px-3 sm:px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-5">
        {/* Top Header & Language Toggle */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center text-lg">
              🌸
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">Kadi ya Wazazi (Mother Pass)</h1>
              <p className="text-[10px] text-teal-400 font-semibold">SEQOY Maternal Network · Kangemi</p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setLanguage('SWAHILI')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${
                language === 'SWAHILI' ? 'bg-teal-500 text-slate-950' : 'text-slate-400'
              }`}
            >
              SW
            </button>
            <button
              onClick={() => setLanguage('ENGLISH')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${
                language === 'ENGLISH' ? 'bg-teal-500 text-slate-950' : 'text-slate-400'
              }`}
            >
              EN
            </button>
          </div>
        </div>

        {/* Clinical Portal Breadcrumb (For Clinicians / Stakeholders) */}
        <div className="flex items-center justify-between text-[11px] px-2 text-slate-400">
          <span>Kitambulisho: MFL-13044-ANC</span>
          <Link href="/mothers" className="text-teal-400 hover:underline flex items-center gap-1">
            <span>← Rudi Kliniki (Back to Staff Portal)</span>
          </Link>
        </div>

        {/* Mother Profile Card */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-bold text-white">{mother.fullName}</h2>
              <p className="text-xs text-slate-400">{mother.phoneNumber}</p>
            </div>
            <div className="text-right">
              <span className="px-2.5 py-1 rounded-full text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Kundi la Damu: {mother.bloodType || 'O+'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/60 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase">
                {language === 'SWAHILI' ? 'Umri wa Mimba:' : 'Gestational Age:'}
              </span>
              <p className="font-bold text-teal-400 text-sm">Wiki {mother.gestationalWeeks}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase">
                {language === 'SWAHILI' ? 'Tarehe ya Kujifungua:' : 'Estimated Delivery:'}
              </span>
              <p className="font-semibold text-slate-200 text-xs">{mother.estimatedDeliveryDate}</p>
            </div>
          </div>
        </div>

        {/* Next Clinic Date Reminder */}
        <div className="p-3 rounded-2xl bg-teal-950/40 border border-teal-500/30 flex items-center gap-3 text-xs">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0">
            <Icon name="CalendarDaysIcon" size={20} variant="outline" />
          </div>
          <div>
            <p className="font-bold text-teal-200">
              {language === 'SWAHILI' ? 'Tarehe ya Kliniki Ijayo' : 'Next ANC Clinic Appointment'}
            </p>
            <p className="text-slate-300 text-[11px]">
              {language === 'SWAHILI' ? 'Jumanne, 15 Septemba 2026 (Kangemi)' : 'Tuesday, 15 Sept 2026 (Kangemi Level 3)'}
            </p>
          </div>
        </div>

        {/* Critical Danger Alert Banner if flagged */}
        {hasDangerFlag && (
          <div className="p-3.5 rounded-2xl bg-rose-950/80 border-2 border-rose-500 animate-pulse text-xs space-y-2">
            <div className="flex items-center gap-2 text-rose-300 font-bold">
              <Icon name="ExclamationTriangleIcon" size={18} variant="solid" />
              <span>{language === 'SWAHILI' ? 'Tahadhari ya Hatari ya Kiafya!' : 'Urgent Danger Signs Detected!'}</span>
            </div>
            <p className="text-[11px] text-slate-200">
              {language === 'SWAHILI'
                ? 'Dalili zako zimeashiria hatari ya Preeclampsia. Bonyeza kitufe chekundu mara moja kuwasiliana na huduma ya dharura.'
                : 'Your symptoms match urgent criteria for Preeclampsia. Tap the emergency ambulance button below immediately.'}
            </p>
          </div>
        )}

        {/* Action Buttons: Emergency & USSD */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleCallEmergency}
            className={`w-full py-3 rounded-2xl font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition ${
              hasDangerFlag
                ? 'bg-rose-600 hover:bg-rose-700 text-white ring-2 ring-rose-400 ring-offset-2 ring-offset-slate-900'
                : 'bg-rose-600/90 hover:bg-rose-600 text-white'
            }`}
          >
            <Icon name="PhoneIcon" size={16} variant="solid" />
            <span>{language === 'SWAHILI' ? 'Simu ya Dharura (Ambulance)' : 'Call Ambulance Hotline'}</span>
          </button>

          <button
            onClick={handleDialUSSD}
            className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center justify-center gap-2 transition"
          >
            <Icon name="RadioIcon" size={16} variant="outline" className="text-teal-400" />
            <span>USSD *384*99# (Zero Data)</span>
          </button>
        </div>

        {/* Interactive Mother AI Assistant ("Msaidizi wa Afya ya Mama") */}
        <div className="border-t border-slate-800 pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <h3 className="text-xs font-bold text-teal-300">
                {language === 'SWAHILI' ? 'Ongea na Daktari AI (Msaidizi)' : 'Ask Daktari AI (Maternal Copilot)'}
              </h3>
            </div>
            <span className="text-[10px] text-slate-500">24/7 Free Maternal Support</span>
          </div>

          {/* Quick Symptoms Grid */}
          <div className="flex flex-wrap gap-1.5">
            {quickSymptoms.map((sym, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(sym.text)}
                disabled={loading}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-teal-900/40 hover:border-teal-500/40 border border-slate-700/80 text-[11px] text-slate-300 font-medium transition text-left"
              >
                {sym.label}
              </button>
            ))}
          </div>

          {/* Chat Messages Log */}
          <div className="max-h-60 overflow-y-auto scrollbar-thin space-y-2 p-3 bg-slate-950/60 rounded-2xl border border-slate-800 text-xs">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`p-2.5 rounded-xl ${
                  m.role === 'user'
                    ? 'bg-teal-900/30 text-teal-100 border border-teal-500/20 ml-6 text-right'
                    : m.isDanger
                    ? 'bg-rose-950/50 text-rose-200 border border-rose-500/30 mr-4'
                    : 'bg-slate-800 text-slate-200 mr-4'
                }`}
              >
                <p className="text-[11px] leading-relaxed">{m.text}</p>
              </div>
            ))}
            {loading && (
              <div className="p-2.5 rounded-xl bg-slate-800 text-slate-400 mr-4 text-[11px] flex items-center gap-2">
                <span className="animate-spin text-teal-400">🌀</span>
                <span>{language === 'SWAHILI' ? 'Daktari AI anachambua dalili...' : 'Daktari AI is analyzing...'}</span>
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={
                language === 'SWAHILI'
                  ? 'Eleza vile unavyohisi au uliza swali...'
                  : 'Describe how you feel or ask a question...'
              }
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-400"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || loading}
              className="px-3 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs disabled:opacity-50 transition"
            >
              {language === 'SWAHILI' ? 'Tuma' : 'Send'}
            </button>
          </div>
        </div>

        {/* Telephony Schedule Footnote */}
        <div className="text-center pt-2 border-t border-slate-800/80">
          <p className="text-[11px] text-slate-400">
            📞 Simu yako ya kila Jumamosi itapigwa saa <strong className="text-teal-400">2:00 Alasiri (14:00 EAT)</strong>.
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Unaweza kupiga <strong>*384*99#</strong> bila malipo wakati wowote kwa simu yoyote ya kawaida (Kabambe).
          </p>
        </div>
      </div>
    </div>
  );
}

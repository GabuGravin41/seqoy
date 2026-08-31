'use client';

import React, { useState, useEffect } from 'react';
import { useTelephony } from '@/context/TelephonyContext';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'sonner';

export default function PhoneDrawer() {
  const { isOpen, closeDrawer, activeMode, setActiveMode, selectedPatient } = useTelephony();

  // USSD State
  const [ussdSessionId, setUssdSessionId] = useState(() => `SES-${Math.floor(100000 + Math.random() * 900000)}`);
  const [ussdPhone, setUssdPhone] = useState('+254712345678');
  const [ussdInputSequence, setUssdInputSequence] = useState('');
  const [ussdCurrentInput, setUssdCurrentInput] = useState('');
  const [ussdScreenText, setUssdScreenText] = useState('Dial *384*99# to start USSD check-in');
  const [ussdIsActive, setUssdIsActive] = useState(false);
  const [ussdLoading, setUssdLoading] = useState(false);

  // Voice AI State
  const [voiceLanguage, setVoiceLanguage] = useState<'SWAHILI' | 'ENGLISH'>('SWAHILI');
  const [voiceSampleText, setVoiceSampleText] = useState(
    'Ndio daktari, nina maumivu makali ya kichwa tangu jana, naona ukungu machoni na miguu imevimba sana. Mtoto pia hachezi vizuri leo.'
  );
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [voiceResult, setVoiceResult] = useState<any>(null);

  useEffect(() => {
    if (selectedPatient?.phone) {
      setUssdPhone(selectedPatient.phone);
    }
  }, [selectedPatient]);

  // Handle USSD Dial / Next Step
  const sendUssdStep = async (stepValue?: string) => {
    setUssdLoading(true);
    let nextSeq = ussdInputSequence;

    if (!ussdIsActive) {
      nextSeq = '';
      setUssdIsActive(true);
    } else if (stepValue !== undefined) {
      nextSeq = nextSeq ? `${nextSeq}*${stepValue}` : stepValue;
    } else if (ussdCurrentInput) {
      nextSeq = nextSeq ? `${nextSeq}*${ussdCurrentInput}` : ussdCurrentInput;
    }

    setUssdInputSequence(nextSeq);
    setUssdCurrentInput('');

    try {
      const res = await fetch('/api/telephony/ussd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: ussdSessionId,
          serviceCode: '*384*99#',
          phoneNumber: ussdPhone,
          text: nextSeq,
        }),
      });
      const textResponse = await res.text();
      // Strip technical telecom protocol prefix (CON/END) for authentic feature phone LCD display
      const cleanDisplay = textResponse.replace(/^(CON|END)\s*/i, '');
      setUssdScreenText(cleanDisplay);

      if (textResponse.startsWith('END')) {
        setUssdIsActive(false);
        if (textResponse.includes('HATARI') || textResponse.includes('CRITICAL') || textResponse.includes('DHARURA') || textResponse.includes('EMERGENCY')) {
          toast.error('Critical maternal danger sign recorded via USSD!', {
            description: 'Clinic midwife alerted for emergency transfer.',
          });
        } else {
          toast.success('Maternal check-in logged successfully');
        }
      }
    } catch (e) {
      setUssdScreenText('Mtandao haupatikani kwa sasa. Tafadhali piga tena *384*99#\n\nNetwork unavailable. Please retry.');
      setUssdIsActive(false);
    } finally {
      setUssdLoading(false);
    }
  };

  const resetUssd = () => {
    setUssdSessionId(`SES-${Math.floor(100000 + Math.random() * 900000)}`);
    setUssdInputSequence('');
    setUssdCurrentInput('');
    setUssdIsActive(false);
    setUssdScreenText('Dial *384*99# to start USSD check-in');
  };

  // Run Voice AI Check-in
  const runVoiceAI = async () => {
    setVoiceLoading(true);
    setVoiceResult(null);
    try {
      const res = await fetch('/api/telephony/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatient?.id || 1,
          phoneNumber: ussdPhone,
          transcript: voiceSampleText,
          language: voiceLanguage,
          systolicBp: 165,
          diastolicBp: 110,
        }),
      });
      const data = await res.json();
      setVoiceResult(data);

      if (data.triage?.riskLevel === 'CRITICAL_EMERGENCY') {
        toast.error('Critical Preeclampsia / PPH detected on Voice Call!', {
          description: `Triage Score: ${data.triage.riskScore}/100. Clinic alerted.`,
        });
      } else {
        toast.success('Voice AI check-in processed successfully');
      }
    } catch (e) {
      toast.error('Voice AI analysis failed');
    } finally {
      setVoiceLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={closeDrawer}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Slide-out Panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-screen w-full sm:w-[460px] bg-card border-l border-border shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
              <Icon name="DevicePhoneMobileIcon" size={18} variant="outline" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                Telephony Handset
                <span className="text-[10px] bg-primary/15 text-primary border border-primary/30 px-1.5 py-0.2 rounded font-mono">
                  GSM 2G
                </span>
              </h3>
              <p className="text-[11px] text-muted-foreground">
                {selectedPatient?.name
                  ? `${selectedPatient.name} (Wk ${selectedPatient.gestationalWeek || 34})`
                  : 'Maternal Feature Phone Simulator'}
              </p>
            </div>
          </div>

          <button
            onClick={closeDrawer}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Icon name="XMarkIcon" size={18} variant="outline" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="p-3 border-b border-border flex gap-2 bg-card">
          <button
            onClick={() => setActiveMode('ussd')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              activeMode === 'ussd'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted/60 text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name="RadioIcon" size={14} variant="outline" />
            USSD Session (*384#)
          </button>
          <button
            onClick={() => setActiveMode('voice')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              activeMode === 'voice'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted/60 text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name="PhoneIcon" size={14} variant="outline" />
            Voice AI Call
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {/* --- USSD MODE --- */}
          {activeMode === 'ussd' && (
            <div className="space-y-4 flex flex-col items-center">
              {/* Feature Phone Screen Frame */}
              <div className="w-full max-w-[340px] bg-slate-950 border-4 border-slate-700 rounded-3xl p-4 shadow-xl flex flex-col items-center">
                {/* Speaker Grill */}
                <div className="w-10 h-1 bg-slate-700 rounded-full mb-3" />

                {/* LCD Screen */}
                <div className="w-full bg-[#1b3b22] text-[#86efac] font-mono text-xs p-3 rounded-xl border border-emerald-900/60 min-h-[170px] flex flex-col justify-between shadow-inner whitespace-pre-wrap leading-relaxed">
                  <div>{ussdScreenText}</div>
                  {ussdIsActive && (
                    <div className="mt-2 pt-1.5 border-t border-emerald-800/40 text-[10px] text-emerald-300">
                      Active: {ussdInputSequence || 'Root Menu'}
                    </div>
                  )}
                </div>

                {/* USSD Input Row */}
                <div className="w-full mt-3">
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder={ussdIsActive ? 'Choice (e.g. 1)' : '*384*99#'}
                      value={ussdCurrentInput}
                      onChange={(e) => setUssdCurrentInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendUssdStep()}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary"
                    />
                    <button
                      onClick={() => sendUssdStep()}
                      disabled={ussdLoading}
                      className="bg-primary hover:opacity-90 disabled:opacity-50 text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
                    >
                      {ussdIsActive ? 'Send' : 'Dial'}
                    </button>
                  </div>
                </div>

                {/* Keypad Grid */}
                <div className="grid grid-cols-3 gap-1.5 w-full mt-3">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((key) => (
                    <button
                      key={key}
                      onClick={() => {
                        if (ussdIsActive) {
                          sendUssdStep(key);
                        } else if (key === '*') {
                          setUssdCurrentInput('*384*99#');
                        }
                      }}
                      className="bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 py-1.5 rounded-lg text-xs font-bold border border-slate-700/60 transition shadow-xs"
                    >
                      {key}
                    </button>
                  ))}
                </div>

                <button
                  onClick={resetUssd}
                  className="mt-2.5 text-[11px] text-muted-foreground hover:text-critical transition flex items-center gap-1"
                >
                  <Icon name="ArrowPathIcon" size={12} variant="outline" /> Reset Session
                </button>
              </div>

              {/* Quick Preset Buttons */}
              <div className="w-full space-y-2">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                  Quick Simulation Presets:
                </p>
                <button
                  onClick={() => {
                    resetUssd();
                    setUssdIsActive(true);
                    setUssdInputSequence('1*1*1*1*2');
                    sendUssdStep();
                  }}
                  className="w-full text-left bg-muted/40 hover:bg-muted p-2.5 rounded-xl border border-border transition text-xs space-y-0.5"
                >
                  <span className="font-bold text-critical block">🔴 Simulate Swahili Preeclampsia Alert</span>
                  <span className="text-[11px] text-muted-foreground block">
                    1 (Swahili) → 1 (Check-in) → 1 (Kichwa/Macho) → 1 (Damu) → 2 (Mtoto hachezi)
                  </span>
                </button>

                <button
                  onClick={() => {
                    resetUssd();
                    setUssdIsActive(true);
                    setUssdInputSequence('3');
                    sendUssdStep();
                  }}
                  className="w-full text-left bg-muted/40 hover:bg-muted p-2.5 rounded-xl border border-border transition text-xs space-y-0.5"
                >
                  <span className="font-bold text-accent block">⚡ Emergency SOS Panic Button</span>
                  <span className="text-[11px] text-muted-foreground block">
                    Direct SOS trigger dispatches clinic ambulance
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* --- VOICE AI MODE --- */}
          {activeMode === 'voice' && (
            <div className="space-y-4">
              <div className="bg-muted/40 border border-border p-3.5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary pulse-dot" />
                    Automated Voice Call
                  </span>
                  <div className="flex bg-card p-0.5 rounded-lg border border-border text-[11px]">
                    <button
                      onClick={() => {
                        setVoiceLanguage('SWAHILI');
                        setVoiceSampleText(
                          'Ndio daktari, nina maumivu makali ya kichwa tangu jana, naona ukungu machoni na miguu imevimba sana. Mtoto pia hachezi vizuri leo.'
                        );
                      }}
                      className={`px-2 py-0.5 rounded-md font-medium transition ${
                        voiceLanguage === 'SWAHILI' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      Swahili
                    </button>
                    <button
                      onClick={() => {
                        setVoiceLanguage('ENGLISH');
                        setVoiceSampleText(
                          'Yes doctor, I have severe continuous headaches, blurry vision, and sudden swelling in my feet. The baby has stopped kicking as much.'
                        );
                      }}
                      className={`px-2 py-0.5 rounded-md font-medium transition ${
                        voiceLanguage === 'ENGLISH' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      English
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                    Mother Audio Transcript (Simulated Voice-to-Text):
                  </label>
                  <textarea
                    rows={3}
                    value={voiceSampleText}
                    onChange={(e) => setVoiceSampleText(e.target.value)}
                    className="input-field text-xs leading-relaxed"
                  />
                </div>

                <button
                  onClick={runVoiceAI}
                  disabled={voiceLoading}
                  className="btn-primary w-full text-xs py-2"
                >
                  {voiceLoading ? (
                    <>
                      <Icon name="ArrowPathIcon" size={14} variant="outline" className="animate-spin" />
                      Analyzing Audio Clinical Entities...
                    </>
                  ) : (
                    <>
                      <Icon name="PhoneArrowUpRightIcon" size={14} variant="outline" />
                      Trigger Voice AI Check-In Call
                    </>
                  )}
                </button>
              </div>

              {/* Voice AI Result */}
              {voiceResult && (
                <div className="bg-card border border-border p-4 rounded-2xl space-y-3 fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Clinical Triage Evaluation:</span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        voiceResult.triage.riskLevel === 'CRITICAL_EMERGENCY'
                          ? 'bg-critical/20 text-critical'
                          : 'bg-primary/20 text-primary'
                      }`}
                    >
                      {voiceResult.triage.riskLevel.replace('_', ' ')} ({voiceResult.triage.riskScore}/100)
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {voiceResult.extractedKeywords?.map((kw: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-critical/10 text-critical text-[10px] font-semibold">
                        ✓ {kw}
                      </span>
                    ))}
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 p-2.5 rounded-xl border border-border">
                    {voiceResult.triage.recommendedAction}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

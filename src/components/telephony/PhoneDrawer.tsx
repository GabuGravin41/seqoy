'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTelephony } from '@/context/TelephonyContext';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'sonner';

export default function PhoneDrawer() {
  const { isOpen, closeDrawer, activeMode, setActiveMode, selectedPatient } = useTelephony();

  // Manual Outreach State
  const [manualLang, setManualLang] = useState<'SWAHILI' | 'ENGLISH' | 'SOMALI'>('SWAHILI');
  const [dangerChecks, setDangerChecks] = useState({
    headache: false,
    blurredVision: false,
    bleeding: false,
    swelling: false,
    fetalMovement: false,
    abdominalPain: false,
    fever: false,
  });
  const [manualOutcome, setManualOutcome] = useState<'SAFE' | 'DANGER' | 'UNREACHABLE'>('SAFE');
  const [manualNotes, setManualNotes] = useState('');
  const [manualSubmitting, setManualSubmitting] = useState(false);
  const [manualLoggedResult, setManualLoggedResult] = useState<any>(null);

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

  // Check if any danger sign is selected
  const hasAnyDangerSign =
    dangerChecks.headache ||
    dangerChecks.blurredVision ||
    dangerChecks.bleeding ||
    dangerChecks.swelling ||
    dangerChecks.fetalMovement ||
    dangerChecks.abdominalPain ||
    dangerChecks.fever;

  // Auto-switch outcome if danger signs toggled
  const handleToggleDanger = (key: keyof typeof dangerChecks) => {
    setDangerChecks((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      const anyActive = Object.values(next).some(Boolean);
      if (anyActive) {
        setManualOutcome('DANGER');
      } else if (manualOutcome === 'DANGER') {
        setManualOutcome('SAFE');
      }
      return next;
    });
  };

  // Submit manual call check-in
  const handleSaveManualCheckin = async () => {
    setManualSubmitting(true);
    setManualLoggedResult(null);

    const patientId = selectedPatient?.id || 1;

    try {
      const res = await fetch(`/api/patients/${patientId}/checkins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: 'MANUAL_CALL',
          languageUsed: manualLang,
          hasSevereHeadache: dangerChecks.headache,
          hasBlurredVision: dangerChecks.blurredVision,
          hasSevereSwelling: dangerChecks.swelling,
          hasVaginalBleeding: dangerChecks.bleeding,
          hasHighFever: dangerChecks.fever,
          hasReducedFetalMovement: dangerChecks.fetalMovement,
          hasSevereAbdominalPain: dangerChecks.abdominalPain,
          transcript: `Manual health worker outreach conducted in ${manualLang}. Status: ${manualOutcome}. Notes: ${manualNotes || 'Routine check'}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to save outreach record');
        return;
      }

      setManualLoggedResult(data);

      if (data.triage?.riskLevel === 'CRITICAL_EMERGENCY' || hasAnyDangerSign) {
        toast.error('Emergency Maternal Danger Signs Detected!', {
          description: `Patient flagged for immediate Level 4/5 hospital referral.`,
        });
      } else {
        toast.success('Manual call logged successfully', {
          description: `Patient risk status: NORMAL. Zero toll fees used.`,
        });
      }
    } catch (e: any) {
      toast.error('Failed to log manual outreach', { description: e.message });
    } finally {
      setManualSubmitting(false);
    }
  };

  // Reset manual form
  const handleResetManual = () => {
    setDangerChecks({
      headache: false,
      blurredVision: false,
      bleeding: false,
      swelling: false,
      fetalMovement: false,
      abdominalPain: false,
      fever: false,
    });
    setManualOutcome('SAFE');
    setManualNotes('');
    setManualLoggedResult(null);
  };

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
      const cleanDisplay = textResponse.replace(/^(CON|END)\s*/i, '');
      setUssdScreenText(cleanDisplay);

      if (textResponse.startsWith('END')) {
        setUssdIsActive(false);
        if (
          textResponse.includes('HATARI') ||
          textResponse.includes('CRITICAL') ||
          textResponse.includes('DHARURA') ||
          textResponse.includes('EMERGENCY')
        ) {
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

  const patientName = selectedPatient?.name || 'Wanjiku Muthoni';
  const gestationalWeek = selectedPatient?.gestationalWeek || 34;

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
        className={`fixed top-0 right-0 z-50 h-screen w-full sm:w-[480px] bg-card border-l border-border shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
              <Icon name="PhoneIcon" size={18} variant="outline" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                Maternal Outreach & Triage
                <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono">
                  Zero-Toll Active
                </span>
              </h3>
              <p className="text-[11px] text-muted-foreground">
                {patientName} (Week {gestationalWeek}) • {ussdPhone}
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
        <div className="p-2.5 border-b border-border flex gap-1.5 bg-card">
          <button
            onClick={() => setActiveMode('manual')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              activeMode === 'manual'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-muted/60 text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name="PhoneArrowUpRightIcon" size={14} variant="outline" />
            Manual Call (Zero Cost)
          </button>
          <button
            onClick={() => setActiveMode('ussd')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              activeMode === 'ussd'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted/60 text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name="RadioIcon" size={14} variant="outline" />
            USSD (*384#)
          </button>
          <button
            onClick={() => setActiveMode('voice')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              activeMode === 'voice'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted/60 text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name="CpuChipIcon" size={14} variant="outline" />
            Voice AI
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {/* ============================================================ */}
          {/* --- MANUAL CALL OUTREACH MODE (ZERO TWILIO / HEALTHCARE FRIENDLY) --- */}
          {/* ============================================================ */}
          {activeMode === 'manual' && (
            <div className="space-y-4 fade-in">
              {/* Quick Call Action Card */}
              <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                      Direct Nurse / CHP Calling
                    </span>
                    <h4 className="text-sm font-bold text-foreground mt-0.5">{patientName}</h4>
                    <p className="text-xs text-muted-foreground font-mono">{ussdPhone}</p>
                  </div>
                  <a
                    href={`tel:${ussdPhone.replace(/\s+/g, '')}`}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md inline-flex items-center gap-1.5 transition active:scale-95"
                  >
                    <Icon name="PhoneIcon" size={14} variant="solid" />
                    Dial on Phone
                  </a>
                </div>
                <p className="text-[11px] text-emerald-200/80 leading-relaxed border-t border-emerald-800/40 pt-2">
                  💡 <strong>Zero Setup:</strong> Dials directly via your phone SIM card or facility handset. No Twilio
                  airtime or paid toll-free numbers needed. Takes ~30 seconds.
                </p>
              </div>

              {/* 30-Second Language Script */}
              <div className="bg-card border border-border rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Icon name="ChatBubbleBottomCenterTextIcon" size={14} variant="outline" className="text-primary" />
                    Prompt Script
                  </span>
                  <div className="flex gap-1">
                    {(['SWAHILI', 'ENGLISH', 'SOMALI'] as const).map((l) => (
                      <button
                        key={l}
                        onClick={() => setManualLang(l)}
                        className={`text-[10px] px-2 py-0.5 rounded font-bold transition ${
                          manualLang === l
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {l === 'SWAHILI' ? 'Swahili' : l === 'ENGLISH' ? 'English' : 'Somali'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-muted/40 rounded-xl p-3 text-xs text-foreground/90 italic leading-relaxed border border-border">
                  {manualLang === 'SWAHILI' && (
                    <p>
                      &quot;Hujambo <strong>{patientName}</strong>, ni muuguzi kutoka kliniki. Unajisikiaje leo? Je, una
                      maumivu makali ya kichwa, ukungu machoni, kuvuja damu, uvimbe wa uso/mikono, au mtoto kuacha kucheza?&quot;
                    </p>
                  )}
                  {manualLang === 'ENGLISH' && (
                    <p>
                      &quot;Hello <strong>{patientName}</strong>, this is your clinic nurse. Just checking in: Are you
                      having any severe headaches, blurry vision, bleeding, sudden face/hand swelling, or reduced baby
                      movement?&quot;
                    </p>
                  )}
                  {manualLang === 'SOMALI' && (
                    <p>
                      &quot;Asc <strong>{patientName}</strong>, waa kalkaalisada caafimaadka. Sidee tahay maanta? Ma
                      leedahay madax-xanuun daran, aragga oo xumaada, dhiig-bax, barar wejiga ah, mise ilmuhu waa joojiyay
                      dhaqdhaqaaqa?&quot;
                    </p>
                  )}
                </div>
              </div>

              {/* Rapid Danger Sign Checklist */}
              <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">WHO Danger Signs Checklist</span>
                  <span className="text-[10px] text-muted-foreground">Tap to toggle</span>
                </div>

                <div className="space-y-2">
                  {[
                    {
                      id: 'headache',
                      label: 'Severe Headache / Blurred Vision',
                      subtitle: 'Maumivu makali ya kichwa / Ukungu machoni (Pre-eclampsia)',
                    },
                    {
                      id: 'bleeding',
                      label: 'Vaginal Bleeding / Fluid Gush',
                      subtitle: 'Kuvuja damu / Maji kutoka ukeni (Hemorrhage / PROM)',
                    },
                    {
                      id: 'swelling',
                      label: 'Sudden Face or Hand Swelling',
                      subtitle: 'Uvimbe wa uso au mikono (Edema / Eclampsia risk)',
                    },
                    {
                      id: 'fetalMovement',
                      label: 'Reduced or Absent Fetal Movement',
                      subtitle: 'Mtoto hachezi vizuri au ametulia (Fetal distress)',
                    },
                    {
                      id: 'abdominalPain',
                      label: 'Severe Upper Abdominal Pain',
                      subtitle: 'Maumivu makali ya mbavu au tumbo la juu',
                    },
                    {
                      id: 'fever',
                      label: 'High Fever or Chills / Foul Odor',
                      subtitle: 'Homa kali au baridi (Sepsis / Infection)',
                    },
                  ].map((item) => {
                    const active = (dangerChecks as any)[item.id];
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleToggleDanger(item.id as any)}
                        className={`p-2.5 rounded-xl border cursor-pointer transition flex items-start gap-2.5 select-none ${
                          active
                            ? 'bg-critical/15 border-critical text-critical font-medium'
                            : 'bg-muted/20 border-border hover:bg-muted/40 text-foreground'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center text-white text-[10px] ${
                            active ? 'bg-critical' : 'border border-muted-foreground/40'
                          }`}
                        >
                          {active && '✓'}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold leading-snug">{item.label}</p>
                          <p className="text-[10px] text-muted-foreground">{item.subtitle}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Call Outcome Status */}
              <div className="bg-card border border-border rounded-2xl p-4 space-y-2.5">
                <span className="text-xs font-bold text-foreground">Call Outcome</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setManualOutcome('SAFE');
                      setDangerChecks({
                        headache: false,
                        blurredVision: false,
                        bleeding: false,
                        swelling: false,
                        fetalMovement: false,
                        abdominalPain: false,
                        fever: false,
                      });
                    }}
                    className={`p-2 rounded-xl text-center border text-xs font-bold transition ${
                      manualOutcome === 'SAFE' && !hasAnyDangerSign
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                        : 'bg-muted/30 border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Safe & Well
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualOutcome('DANGER')}
                    className={`p-2 rounded-xl text-center border text-xs font-bold transition ${
                      manualOutcome === 'DANGER' || hasAnyDangerSign
                        ? 'bg-critical/20 border-critical text-critical'
                        : 'bg-muted/30 border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Danger Signs!
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualOutcome('UNREACHABLE')}
                    className={`p-2 rounded-xl text-center border text-xs font-bold transition ${
                      manualOutcome === 'UNREACHABLE'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                        : 'bg-muted/30 border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    No Answer
                  </button>
                </div>

                <div className="mt-2">
                  <input
                    type="text"
                    value={manualNotes}
                    onChange={(e) => setManualNotes(e.target.value)}
                    placeholder="Short nurse note (e.g. Advised to rest, clinic visit tomorrow)"
                    className="input-field text-xs"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={handleResetManual}
                    type="button"
                    className="btn-secondary text-xs px-3 py-2 flex-1"
                  >
                    Reset Form
                  </button>
                  <button
                    onClick={handleSaveManualCheckin}
                    disabled={manualSubmitting}
                    type="button"
                    className="btn-primary text-xs px-4 py-2 font-bold flex-2 flex items-center justify-center gap-1.5"
                  >
                    {manualSubmitting ? (
                      <>
                        <Icon name="ArrowPathIcon" size={14} variant="outline" className="animate-spin" />
                        Logging...
                      </>
                    ) : (
                      <>
                        <Icon name="ClipboardDocumentCheckIcon" size={14} variant="outline" />
                        Save & Log Outreach
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Logged Outcome Result Banner */}
              {manualLoggedResult && (
                <div
                  className={`border rounded-2xl p-4 space-y-3 fade-in ${
                    hasAnyDangerSign || manualLoggedResult.triage?.riskLevel === 'CRITICAL_EMERGENCY'
                      ? 'bg-critical/15 border-critical text-foreground'
                      : 'bg-emerald-950/20 border-emerald-800 text-foreground'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">
                      {hasAnyDangerSign ? '⚠️ High Obstetric Risk' : '✅ Check-in Recorded Safe'}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        hasAnyDangerSign
                          ? 'bg-critical text-white'
                          : 'bg-emerald-500 text-white'
                      }`}
                    >
                      {manualLoggedResult.triage?.riskLevel || (hasAnyDangerSign ? 'CRITICAL_EMERGENCY' : 'NORMAL')}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {manualLoggedResult.triage?.recommendedAction ||
                      (hasAnyDangerSign
                        ? 'Immediate transfer to a Level 4/5 hospital with blood and theatre readiness.'
                        : 'Routine follow-up in 14 days.')}
                  </p>

                  {hasAnyDangerSign && (
                    <div className="pt-2 border-t border-border flex justify-end">
                      <Link
                        href="/emergency-referral-management"
                        onClick={closeDrawer}
                        className="btn-primary bg-critical hover:bg-critical/90 text-white text-xs py-2 px-3.5 font-bold flex items-center gap-1.5 shadow-md"
                      >
                        <Icon name="ArrowsRightLeftIcon" size={14} variant="outline" />
                        Match & Dispatch Referral Now
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* --- USSD MODE --- */}
          {/* ============================================================ */}
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
                      className="bg-slate-900/80 hover:bg-slate-800 active:bg-slate-700 text-slate-200 border border-slate-800 rounded-lg py-2 text-xs font-bold transition flex items-center justify-center font-mono"
                    >
                      {key}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={resetUssd} className="text-xs text-muted-foreground hover:text-foreground">
                  Reset Session
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* --- VOICE AI MODE --- */}
          {/* ============================================================ */}
          {activeMode === 'voice' && (
            <div className="space-y-4">
              <div className="bg-card border border-border p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">Language Model</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setVoiceLanguage('SWAHILI')}
                      className={`text-[11px] px-2.5 py-1 rounded-md font-bold transition ${
                        voiceLanguage === 'SWAHILI'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Swahili
                    </button>
                    <button
                      onClick={() => setVoiceLanguage('ENGLISH')}
                      className={`text-[11px] px-2.5 py-1 rounded-md font-bold transition ${
                        voiceLanguage === 'ENGLISH'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      English
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                    Speech Transcript Audio Simulation
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

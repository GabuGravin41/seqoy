"use client";

import React, { useState, useEffect } from "react";
import {
  Phone,
  Radio,
  Hospital,
  Ambulance,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Send,
  RefreshCw,
  Clock,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Bed,
  Droplet,
  Stethoscope,
} from "lucide-react";

export default function SimulatorPage() {
  const [activeTab, setActiveTab] = useState<"ussd" | "voice" | "capacity" | "referral" | "mpdsr">("ussd");

  // USSD Simulator State
  const [ussdSessionId] = useState(() => `SES-${Math.floor(100000 + Math.random() * 900000)}`);
  const [ussdPhone, setUssdPhone] = useState("+254712345678");
  const [ussdInputSequence, setUssdInputSequence] = useState("");
  const [ussdCurrentInput, setUssdCurrentInput] = useState("");
  const [ussdScreenText, setUssdScreenText] = useState("Dial *384*99# to start USSD check-in");
  const [ussdIsActive, setUssdIsActive] = useState(false);
  const [ussdLoading, setUssdLoading] = useState(false);

  // Voice AI Simulator State
  const [voiceLanguage, setVoiceLanguage] = useState<"SWAHILI" | "ENGLISH">("SWAHILI");
  const [voiceSampleText, setVoiceSampleText] = useState(
    "Ndio daktari, nina maumivu makali ya kichwa tangu jana, naona ukungu machoni na miguu imevimba sana. Mtoto pia hachezi vizuri leo."
  );
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [voiceResult, setVoiceResult] = useState<any>(null);

  // Hospital Capacity State
  const [capacities, setCapacities] = useState<any[]>([]);
  const [capacityLoading, setCapacityLoading] = useState(false);

  // Referral Matcher State
  const [patientBloodType, setPatientBloodType] = useState("O-");
  const [icuNeeded, setIcuNeeded] = useState(true);
  const [theatreNeeded, setTheatreNeeded] = useState(true);
  const [bloodUnitsNeeded, setBloodUnitsNeeded] = useState(2);
  const [referralMatchResult, setReferralMatchResult] = useState<any>(null);
  const [matchLoading, setMatchLoading] = useState(false);
  const [dispatchLoading, setDispatchLoading] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState<any>(null);

  // MPDSR State
  const [mpdsrData, setMpdsrData] = useState<any>(null);

  // Fetch live capacity
  const fetchCapacities = async () => {
    setCapacityLoading(true);
    try {
      const res = await fetch("/api/hospitals/capacity?referringClinicId=1");
      const data = await res.json();
      setCapacities(data.capacities || []);
    } catch (e) {
      console.error(e);
    } finally {
      setCapacityLoading(false);
    }
  };

  const fetchMPDSR = async () => {
    try {
      const res = await fetch("/api/analytics/mpdsr");
      const data = await res.json();
      setMpdsrData(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCapacities();
    fetchMPDSR();
  }, []);

  // USSD Dial Action
  const sendUssdStep = async (stepValue?: string) => {
    setUssdLoading(true);
    let nextSeq = ussdInputSequence;

    if (!ussdIsActive) {
      nextSeq = "";
      setUssdIsActive(true);
    } else if (stepValue !== undefined) {
      nextSeq = nextSeq ? `${nextSeq}*${stepValue}` : stepValue;
    } else if (ussdCurrentInput) {
      nextSeq = nextSeq ? `${nextSeq}*${ussdCurrentInput}` : ussdCurrentInput;
    }

    setUssdInputSequence(nextSeq);
    setUssdCurrentInput("");

    try {
      const res = await fetch("/api/telephony/ussd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: ussdSessionId,
          serviceCode: "*384*99#",
          phoneNumber: ussdPhone,
          text: nextSeq,
        }),
      });
      const textResponse = await res.text();
      setUssdScreenText(textResponse);

      if (textResponse.startsWith("END")) {
        setUssdIsActive(false);
      }
    } catch (e) {
      setUssdScreenText("END Network connection error.");
      setUssdIsActive(false);
    } finally {
      setUssdLoading(false);
    }
  };

  const resetUssd = () => {
    setUssdInputSequence("");
    setUssdCurrentInput("");
    setUssdIsActive(false);
    setUssdScreenText("Dial *384*99# to start USSD check-in");
  };

  // Run Voice AI Check-in
  const runVoiceAI = async () => {
    setVoiceLoading(true);
    setVoiceResult(null);
    try {
      const res = await fetch("/api/telephony/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: 1,
          phoneNumber: "+254712345678",
          transcript: voiceSampleText,
          language: voiceLanguage,
          systolicBp: 165,
          diastolicBp: 110,
        }),
      });
      const data = await res.json();
      setVoiceResult(data);
      fetchCapacities();
    } catch (e) {
      console.error(e);
    } finally {
      setVoiceLoading(false);
    }
  };

  // Run Smart Referral Match
  const runReferralMatch = async () => {
    setMatchLoading(true);
    setDispatchSuccess(null);
    try {
      const res = await fetch("/api/referrals/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referringFacilityId: 1, // Kangemi Health Centre
          patientId: 1,
          patientBloodType,
          icuNeeded,
          theatreNeeded,
          bloodUnitsNeeded,
          urgency: "CRITICAL_STAT",
        }),
      });
      const data = await res.json();
      setReferralMatchResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setMatchLoading(false);
    }
  };

  // Dispatch Emergency Ambulance
  const triggerAmbulanceDispatch = async (receivingFacilityId: number) => {
    setDispatchLoading(true);
    try {
      const res = await fetch("/api/referrals/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: 1,
          referringFacilityId: 1,
          receivingFacilityId,
          clinicalIndication: "SEVERE_PREECLAMPSIA",
          urgencyLevel: "CRITICAL_STAT",
          icuBedReserved: icuNeeded,
          theatreReserved: theatreNeeded,
          bloodUnitsReserved: bloodUnitsNeeded,
          bloodTypeReserved: patientBloodType,
        }),
      });
      const data = await res.json();
      setDispatchSuccess(data);
      fetchCapacities();
      fetchMPDSR();
    } catch (e) {
      console.error(e);
    } finally {
      setDispatchLoading(false);
    }
  };

  // Quick toggle capacity
  const updateBedCapacity = async (facilityId: number, currentAvailable: number, delta: number) => {
    const newVal = Math.max(0, currentAvailable + delta);
    await fetch("/api/hospitals/capacity", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        facilityId,
        icuBedsAvailable: newVal,
      }),
    });
    fetchCapacities();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 py-4 sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 p-2 rounded-xl">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              SEQOY <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">Live System Harness</span>
            </h1>
            <p className="text-xs text-slate-400">Continuous Patient Remote Monitoring & Real-Time Capacity Visibility Network</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/50 text-xs font-medium">
          <button
            onClick={() => setActiveTab("ussd")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              activeTab === "ussd" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            1. USSD (*384#)
          </button>
          <button
            onClick={() => setActiveTab("voice")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              activeTab === "voice" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            2. Voice AI Check-in
          </button>
          <button
            onClick={() => setActiveTab("capacity")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              activeTab === "capacity" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Hospital className="w-3.5 h-3.5" />
            3. Hospital Live Terminal
          </button>
          <button
            onClick={() => setActiveTab("referral")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              activeTab === "referral" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Ambulance className="w-3.5 h-3.5" />
            4. Smart Match & Dispatch
          </button>
          <button
            onClick={() => setActiveTab("mpdsr")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              activeTab === "mpdsr" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            5. DANA MPDSR
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {/* TAB 1: USSD SIMULATOR */}
        {activeTab === "ussd" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center">
              <div className="text-center mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-3 py-1 rounded-full">
                  $10 Feature Phone Simulator
                </span>
                <h3 className="text-base font-bold text-white mt-2">Nokia 105 / USSD Interface</h3>
                <p className="text-xs text-slate-400">Zero data required • Works offline on 2G GSM</p>
              </div>

              {/* Phone Body Frame */}
              <div className="w-72 bg-slate-950 border-4 border-slate-700 rounded-3xl p-4 shadow-inner flex flex-col items-center">
                {/* Speaker Grill */}
                <div className="w-12 h-1.5 bg-slate-700 rounded-full mb-3"></div>

                {/* USSD LCD Screen */}
                <div className="w-full bg-[#1b3b22] text-[#86efac] font-mono text-xs p-3 rounded-lg border border-emerald-900/50 min-h-[180px] flex flex-col justify-between shadow-inner whitespace-pre-wrap leading-relaxed">
                  <div>{ussdScreenText}</div>
                  {ussdIsActive && (
                    <div className="mt-2 pt-2 border-t border-emerald-800/40 text-[11px] text-emerald-300">
                      Session Active: {ussdInputSequence || "Root"}
                    </div>
                  )}
                </div>

                {/* USSD Input Form */}
                <div className="w-full mt-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={ussdIsActive ? "Enter choice (e.g. 1)" : "*384*99#"}
                      value={ussdCurrentInput}
                      onChange={(e) => setUssdCurrentInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendUssdStep()}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={() => sendUssdStep()}
                      disabled={ussdLoading}
                      className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      {ussdIsActive ? "Send" : "Dial"}
                    </button>
                  </div>
                </div>

                {/* Keypad Buttons */}
                <div className="grid grid-cols-3 gap-2 w-full mt-4">
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map((key) => (
                    <button
                      key={key}
                      onClick={() => {
                        if (ussdIsActive) {
                          sendUssdStep(key);
                        } else if (key === "*") {
                          setUssdCurrentInput("*384*99#");
                        }
                      }}
                      className="bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 py-2 rounded-lg text-xs font-bold border border-slate-700/60 transition shadow"
                    >
                      {key}
                    </button>
                  ))}
                </div>

                <button
                  onClick={resetUssd}
                  className="mt-3 text-[11px] text-slate-400 hover:text-rose-400 transition flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Reset Session
                </button>
              </div>
            </div>

            {/* USSD Architecture Explanation */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold mb-2">
                  <ShieldAlert className="w-4 h-4" />
                  Delay 1 Solution: Inclusive Maternal Danger Surveillance
                </div>
                <h2 className="text-xl font-bold text-white mb-2">How USSD Unlocks the 70% Feature Phone Population</h2>
                <p className="text-sm text-slate-300 leading-relaxed mb-4">
                  In rural Kenya, over 70% of low-income mothers do not possess a smartphone or internet data bundles.
                  SEQOY’s USSD gateway operates directly over the GSM signaling channel, enabling immediate symptom
                  reporting, emergency SOS dispatch, and clinic appointment synchronization in Swahili or English.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-emerald-400 font-bold text-lg">0 KES</span>
                    <p className="text-xs text-slate-400 mt-0.5">Toll-free to expectant mothers (Reverse-billed via shortcode)</p>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-emerald-400 font-bold text-lg">2G GSM</span>
                    <p className="text-xs text-slate-400 mt-0.5">Works in remote villages without 3G/4G/5G data</p>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-emerald-400 font-bold text-lg">&lt; 3 Secs</span>
                    <p className="text-xs text-slate-400 mt-0.5">Instant triage evaluation & EHR red-flag dispatch</p>
                  </div>
                </div>
              </div>

              {/* Sample USSD Test Scenarios */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-slate-200 mb-3">Quick Interactive Test Scenarios:</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      resetUssd();
                      setUssdIsActive(true);
                      setUssdInputSequence("1*1*1*1*2");
                      sendUssdStep();
                    }}
                    className="w-full text-left bg-slate-950 hover:bg-slate-800 p-3 rounded-xl border border-slate-800 transition flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-semibold text-rose-400">Simulate Swahili Severe Preeclampsia Report</p>
                      <p className="text-[11px] text-slate-400">Sequence: 1 (Swahili) → 1 (Check-in) → 1 (Kichwa/Macho) → 1 (Damu) → 2 (Mtoto hachezi)</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500" />
                  </button>

                  <button
                    onClick={() => {
                      resetUssd();
                      setUssdIsActive(true);
                      setUssdInputSequence("3");
                      sendUssdStep();
                    }}
                    className="w-full text-left bg-slate-950 hover:bg-slate-800 p-3 rounded-xl border border-slate-800 transition flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-semibold text-amber-400">Simulate Emergency SOS Panic Button</p>
                      <p className="text-[11px] text-slate-400">Sequence: 3 (Emergency SOS) → Immediate clinic red flag trigger</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: VOICE AI CHECK-IN SIMULATOR */}
        {activeTab === "voice" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  Voice AI Check-in Conversation Engine
                </h3>
                <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                  <button
                    onClick={() => {
                      setVoiceLanguage("SWAHILI");
                      setVoiceSampleText(
                        "Ndio daktari, nina maumivu makali ya kichwa tangu jana, naona ukungu machoni na miguu imevimba sana. Mtoto pia hachezi vizuri leo."
                      );
                    }}
                    className={`px-2.5 py-1 rounded-md font-medium transition ${
                      voiceLanguage === "SWAHILI" ? "bg-emerald-600 text-white" : "text-slate-400"
                    }`}
                  >
                    Swahili
                  </button>
                  <button
                    onClick={() => {
                      setVoiceLanguage("ENGLISH");
                      setVoiceSampleText(
                        "Yes doctor, I have severe headache, blurry vision, and sudden swelling in my feet. The baby has stopped kicking as much."
                      );
                    }}
                    className={`px-2.5 py-1 rounded-md font-medium transition ${
                      voiceLanguage === "ENGLISH" ? "bg-emerald-600 text-white" : "text-slate-400"
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                  Patient Voice Transcript (Simulated Mother Audio-to-Text):
                </label>
                <textarea
                  rows={4}
                  value={voiceSampleText}
                  onChange={(e) => setVoiceSampleText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 leading-relaxed font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Patient EHR:</span>
                  <span className="font-semibold text-slate-200">Amina Wanjiku (34 wks, Blood O-)</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Recorded Vitals:</span>
                  <span className="font-semibold text-rose-400">BP 165/110 mmHg (Severe)</span>
                </div>
              </div>

              <button
                onClick={runVoiceAI}
                disabled={voiceLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-lg"
              >
                {voiceLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Processing Clinical Voice Engine...
                  </>
                ) : (
                  <>
                    <Activity className="w-4 h-4" />
                    Run Voice AI Speech-to-Triage Analyzer
                  </>
                )}
              </button>
            </div>

            {/* Voice AI Result Panel */}
            <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                Clinical Triage & Entity Extraction Result
              </h3>

              {voiceResult ? (
                <div className="space-y-4">
                  {/* Risk Badge */}
                  <div
                    className={`p-4 rounded-2xl border flex items-center justify-between ${
                      voiceResult.triage.riskLevel === "CRITICAL_EMERGENCY"
                        ? "bg-rose-950/50 border-rose-800/80 text-rose-200"
                        : voiceResult.triage.riskLevel === "ELEVATED_RISK"
                        ? "bg-amber-950/50 border-amber-800/80 text-amber-200"
                        : "bg-emerald-950/50 border-emerald-800/80 text-emerald-200"
                    }`}
                  >
                    <div>
                      <span className="text-xs uppercase font-bold tracking-wider">Computed Triage Risk</span>
                      <h4 className="text-lg font-extrabold">{voiceResult.triage.riskLevel.replace("_", " ")}</h4>
                      <p className="text-xs opacity-90 mt-0.5">Suspected: {voiceResult.triage.suspectedCondition}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-black">{voiceResult.triage.riskScore}</span>
                      <span className="text-xs block opacity-75">/ 100 Score</span>
                    </div>
                  </div>

                  {/* Extracted Clinical Entities */}
                  <div>
                    <span className="text-xs font-semibold text-slate-400 block mb-1.5">Extracted Clinical Entities:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {voiceResult.extractedKeywords?.map((kw: string, i: number) => (
                        <span
                          key={i}
                          className="bg-slate-950 border border-rose-800/40 text-rose-300 text-xs px-2.5 py-1 rounded-lg font-medium"
                        >
                          ✓ {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Clinical Recommendation */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs space-y-2">
                    <span className="font-semibold text-slate-400 block">Automated Clinical Action Protocol:</span>
                    <p className="text-slate-200 leading-relaxed">{voiceResult.triage.recommendedAction}</p>
                    <div className="pt-2 border-t border-slate-800 text-emerald-400 italic">
                      Swahili Voice AI Response: "{voiceResult.triage.swahiliSummary}"
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 text-xs">
                  Click "Run Voice AI Speech-to-Triage Analyzer" to simulate inbound voice call transcription parsing.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: HOSPITAL LIVE CAPACITY TERMINAL */}
        {activeTab === "capacity" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Hospital className="w-5 h-5 text-emerald-400" />
                  Live Referral Network Capacity Terminal
                </h3>
                <p className="text-xs text-slate-400">
                  Real-time status broadcasted from surrounding Level 4, 5 & 6 referral hospitals
                </p>
              </div>
              <button
                onClick={fetchCapacities}
                disabled={capacityLoading}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${capacityLoading ? "animate-spin" : ""}`} />
                Refresh Live Grid
              </button>
            </div>

            {/* Capacity Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {capacities.map((cap) => (
                <div
                  key={cap.id}
                  className={`bg-slate-900 border rounded-3xl p-5 shadow-xl space-y-4 ${
                    cap.icuBedsAvailable === 0
                      ? "border-rose-900/60 bg-gradient-to-b from-rose-950/20 to-slate-900"
                      : "border-slate-800"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                        {cap.facilityTier?.replace(/_/g, " ")}
                      </span>
                      <h4 className="text-base font-bold text-white mt-1">{cap.facilityName}</h4>
                      <p className="text-xs text-slate-400">
                        {cap.county} • {cap.distanceKm} km away (~{cap.estimatedDriveMinutes} mins)
                      </p>
                    </div>
                    {cap.icuBedsAvailable === 0 ? (
                      <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> ICU FULL
                      </span>
                    ) : (
                      <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> READY
                      </span>
                    )}
                  </div>

                  {/* Bed & Theatre Counters */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-slate-500 text-[10px] block">ICU Beds</span>
                      <span
                        className={`text-lg font-black ${
                          cap.icuBedsAvailable > 0 ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {cap.icuBedsAvailable}
                      </span>
                      <span className="text-[10px] text-slate-500 block">/ {cap.icuBedsTotal} Total</span>
                    </div>

                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-slate-500 text-[10px] block">Theatres</span>
                      <span className="text-lg font-black text-slate-200">{cap.operatingTheatresAvailable}</span>
                      <span className="text-[10px] text-slate-500 block">{cap.theatreReadinessStatus}</span>
                    </div>

                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-slate-500 text-[10px] block">O- Blood</span>
                      <span
                        className={`text-lg font-black ${
                          (cap.bloodStock?.["O-"] || 0) > 0 ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {cap.bloodStock?.["O-"] || 0}
                      </span>
                      <span className="text-[10px] text-slate-500 block">Units</span>
                    </div>
                  </div>

                  {/* Quick Toggle Controls */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                    <span className="text-[11px] text-slate-400">Live ICU Adjust:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateBedCapacity(cap.facilityId, cap.icuBedsAvailable, -1)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 w-6 h-6 rounded flex items-center justify-center font-bold"
                      >
                        -
                      </button>
                      <span className="font-mono text-xs px-1">{cap.icuBedsAvailable}</span>
                      <button
                        onClick={() => updateBedCapacity(cap.facilityId, cap.icuBedsAvailable, 1)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 w-6 h-6 rounded flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: SMART REFERRAL MATCHER & TRANSITICA DISPATCH */}
        {activeTab === "referral" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Ambulance className="w-5 h-5 text-emerald-400" />
                Emergency Referral Request
              </h3>
              <p className="text-xs text-slate-400">
                Referring Clinic: <strong className="text-white">Kangemi Health Centre</strong> (Westlands)
              </p>

              <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Patient Required Blood Type:</label>
                  <select
                    value={patientBloodType}
                    onChange={(e) => setPatientBloodType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => (
                      <option key={b} value={b}>
                        {b} (Universal: {b === "O-" ? "YES" : "NO"})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-slate-300">Requires Open ICU Bed:</span>
                  <input
                    type="checkbox"
                    checked={icuNeeded}
                    onChange={(e) => setIcuNeeded(e.target.checked)}
                    className="accent-emerald-500 w-4 h-4"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-slate-300">Requires Operating Theatre Ready:</span>
                  <input
                    type="checkbox"
                    checked={theatreNeeded}
                    onChange={(e) => setTheatreNeeded(e.target.checked)}
                    className="accent-emerald-500 w-4 h-4"
                  />
                </div>
              </div>

              <button
                onClick={runReferralMatch}
                disabled={matchLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-lg"
              >
                {matchLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Activity className="w-4 h-4" />
                    Calculate Smart Capacity Match
                  </>
                )}
              </button>
            </div>

            {/* Smart Matching Output */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Capacity Routing Recommendation
              </h3>

              {referralMatchResult ? (
                <div className="space-y-4">
                  {/* Avoided Blind Referral Alert */}
                  {referralMatchResult.blindReferralRiskIdentified && (
                    <div className="bg-rose-950/60 border border-rose-800/80 p-4 rounded-2xl text-xs text-rose-200 flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold text-rose-300 block">
                          SYSTEMIC REFERRAL BLINDNESS PREVENTED
                        </strong>
                        <p className="mt-1 leading-relaxed">{referralMatchResult.insight}</p>
                      </div>
                    </div>
                  )}

                  {/* Best Recommended Hospital */}
                  {referralMatchResult.recommendedHospital && (
                    <div className="bg-slate-950 border border-emerald-600/50 p-5 rounded-2xl space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded">
                            #1 Optimal Destination Facility
                          </span>
                          <h4 className="text-lg font-bold text-white mt-1">
                            {referralMatchResult.recommendedHospital.facility.name}
                          </h4>
                          <p className="text-xs text-slate-400">
                            {referralMatchResult.recommendedHospital.distanceKm} km • ~
                            {referralMatchResult.recommendedHospital.estimatedTransitMinutes} mins ETA
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-black text-emerald-400">
                            {referralMatchResult.recommendedHospital.capacityScore}
                          </span>
                          <span className="text-[10px] text-slate-500 block">Match Score</span>
                        </div>
                      </div>

                      <p className="text-xs text-emerald-300 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-900/40">
                        {referralMatchResult.recommendedHospital.matchingSummary}
                      </p>

                      <button
                        onClick={() =>
                          triggerAmbulanceDispatch(referralMatchResult.recommendedHospital.facility.id)
                        }
                        disabled={dispatchLoading || Boolean(dispatchSuccess)}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-lg"
                      >
                        {dispatchLoading ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : dispatchSuccess ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            Ambulance Dispatched ({dispatchSuccess.transport?.ambulanceCallSign || 'MEDIC-01'})
                          </>
                        ) : (
                          <>
                            <Ambulance className="w-4 h-4" />
                            1-Click Referral Transfer & Ambulance Dispatch
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Dispatch Telemetry confirmation */}
                  {dispatchSuccess && (
                    <div className="bg-slate-950 border border-emerald-500/50 p-4 rounded-2xl text-xs space-y-2">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold">
                        <Radio className="w-4 h-4 animate-pulse" />
                        Ambulance Dispatched & EHR Handover Transmitted
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-slate-300">
                        <div>Dispatch ID: <strong className="text-white">{dispatchSuccess.transport?.dispatchId || 'DISPATCH-001'}</strong></div>
                        <div>Call Sign: <strong className="text-white">{dispatchSuccess.transport?.ambulanceCallSign || 'MEDIC-01'}</strong></div>
                        <div>ETA: <strong className="text-white">{dispatchSuccess.transport?.estimatedArrivalMinutes || 18} mins</strong></div>
                        <div>Driver: <strong className="text-white">{dispatchSuccess.transport?.driverName || 'Driver'} ({dispatchSuccess.transport?.driverPhone || ''})</strong></div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 text-xs">
                  Click "Calculate Smart Capacity Match" to find the nearest capable referral hospital.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: MPDSR ANALYTICS */}
        {activeTab === "mpdsr" && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-400" />
                    County MPDSR Surveillance & Quality Audit
                  </h3>
                  <p className="text-xs text-slate-400">
                    Maternal and Perinatal Death Surveillance and Response (WHO & MOH Kenya Standards)
                  </p>
                </div>
                <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-3 py-1 rounded-full font-bold">
                  Zero Preventable Fatalities
                </span>
              </div>

              {/* Three Delays Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <span className="text-xs text-slate-400 block font-semibold">Delay 1: Decision to Seek Care</span>
                  <span className="text-3xl font-black text-emerald-400 mt-1 block">
                    {mpdsrData?.threeDelaysSummary?.delay1?.averageMinutes || 15} mins
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {mpdsrData?.threeDelaysSummary?.delay1?.impact}
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <span className="text-xs text-slate-400 block font-semibold">Delay 2: Transit to Capable Facility</span>
                  <span className="text-3xl font-black text-emerald-400 mt-1 block">
                    {mpdsrData?.threeDelaysSummary?.delay2?.averageMinutes || 18} mins
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {mpdsrData?.threeDelaysSummary?.delay2?.impact}
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <span className="text-xs text-slate-400 block font-semibold">Delay 3: Admission to ICU/Theatre</span>
                  <span className="text-3xl font-black text-emerald-400 mt-1 block">
                    {mpdsrData?.threeDelaysSummary?.delay3?.averageMinutes || 5} mins
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {mpdsrData?.threeDelaysSummary?.delay3?.impact}
                  </p>
                </div>
              </div>

              {/* Recent Audit Logs */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                  Recent MPDSR Audit Log Entries:
                </h4>
                <div className="space-y-2">
                  {mpdsrData?.metrics?.recentAuditLogs?.map((log: any) => (
                    <div key={log.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">{log.patientName}</span>
                        <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded">
                          {log.clinicalOutcome}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed">{log.executiveAuditSummary}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

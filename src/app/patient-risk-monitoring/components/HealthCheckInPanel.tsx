'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '@/lib/hooks/useChat';
import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';

interface Message {
  role: 'assistant' | 'user';
  content: string;
}

interface RiskAssessment {
  score: number;
  level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  flags: string[];
  recommendation: string;
}

const SYSTEM_PROMPT = `You are SEQOY's maternal health AI assistant conducting a structured health check-in for expectant mothers in Kenya. Your role is to screen for preeclampsia and postpartum hemorrhage (PPH) risk through natural, empathetic conversation.

SCREENING PROTOCOL:
1. Start with a warm greeting and ask about general wellbeing
2. Ask about headaches (severity, location, duration)
3. Ask about vision changes (blurred vision, seeing spots/flashes)
4. Ask about swelling (hands, face, feet — sudden or severe)
5. Ask about blood pressure if they have a reading
6. Ask about abdominal pain or discomfort
7. Ask about vaginal bleeding (amount, color, clots)
8. Ask about fetal movement (if applicable based on gestational week)
9. Ask about fever or chills

RESPONSE FORMAT:
- Keep responses conversational, warm, and in simple English (or mix with Swahili phrases like "Mama", "Asante")
- Ask ONE question at a time
- After gathering sufficient information (4+ exchanges), provide a JSON risk assessment in this EXACT format at the end of your response:

RISK_ASSESSMENT_JSON:{"score": <1-10>, "level": "<LOW|MODERATE|HIGH|CRITICAL>", "flags": ["<symptom1>", "<symptom2>"], "recommendation": "<brief clinical recommendation>"}

SCORING GUIDE:
- 1-2: No concerning symptoms (LOW)
- 3-4: Mild symptoms, monitor closely (MODERATE)  
- 5-6: Multiple concerning symptoms (HIGH)
- 7-10: Severe symptoms, immediate clinical review needed (CRITICAL)

Preeclampsia red flags: severe headache + blurred vision + swelling + high BP → score 8-10
PPH red flags: heavy vaginal bleeding + dizziness + rapid heartbeat → score 8-10`;

function parseRiskAssessment(text: string): { cleanText: string; assessment: RiskAssessment | null } {
  const marker = 'RISK_ASSESSMENT_JSON:';
  const idx = text.indexOf(marker);
  if (idx === -1) return { cleanText: text, assessment: null };

  const cleanText = text.slice(0, idx).trim();
  try {
    const jsonStr = text.slice(idx + marker.length).trim();
    const assessment = JSON.parse(jsonStr) as RiskAssessment;
    return { cleanText, assessment };
  } catch {
    return { cleanText, assessment: null };
  }
}

const riskColors: Record<string, string> = {
  LOW: 'text-primary',
  MODERATE: 'text-moderate',
  HIGH: 'text-high',
  CRITICAL: 'text-critical',
};

const riskBg: Record<string, string> = {
  LOW: 'bg-primary/10 border-primary/20',
  MODERATE: 'bg-moderate/10 border-moderate/20',
  HIGH: 'bg-high/10 border-high/20',
  CRITICAL: 'bg-critical/10 border-critical/20',
};

const riskBarColor: Record<string, string> = {
  LOW: 'bg-primary',
  MODERATE: 'bg-moderate',
  HIGH: 'bg-high',
  CRITICAL: 'bg-critical',
};

interface HealthCheckInPanelProps {
  patientName?: string;
  gestationalWeek?: number;
  onRiskScored?: (assessment: RiskAssessment) => void;
}

export default function HealthCheckInPanel({
  patientName = 'Amina Wanjiku',
  gestationalWeek = 34,
  onRiskScored,
}: HealthCheckInPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sessionActive, setSessionActive] = useState(false);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [exchangeCount, setExchangeCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { response, isLoading, error, sendMessage } = useChat('ANTHROPIC', 'claude-sonnet-4-6', true);

  useEffect(() => {
    if (error) toast.error(error.message);
  }, [error]);

  useEffect(() => {
    if (!isLoading && response && sessionActive) {
      const { cleanText, assessment } = parseRiskAssessment(response);
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return [...prev.slice(0, -1), { role: 'assistant', content: cleanText || response }];
        }
        return prev;
      });
      if (assessment) {
        setRiskAssessment(assessment);
        onRiskScored?.(assessment);
      }
    }
  }, [isLoading, response, sessionActive, onRiskScored]);

  useEffect(() => {
    if (isLoading && response) {
      const { cleanText } = parseRiskAssessment(response);
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return [...prev.slice(0, -1), { role: 'assistant', content: cleanText || '…' }];
        }
        return prev;
      });
    }
  }, [response, isLoading]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const startSession = () => {
    setSessionActive(true);
    setMessages([]);
    setRiskAssessment(null);
    setExchangeCount(0);

    const gestInfo = gestationalWeek ? ` She is at gestational week ${gestationalWeek}.` : '';
    const openingMessages = [
      {
        role: 'system',
        content: `${SYSTEM_PROMPT}\n\nPatient name: ${patientName}.${gestInfo} Begin the check-in now with a warm greeting.`,
      },
      {
        role: 'user',
        content: 'Habari Daktari, I am ready for the check-in.',
      },
    ];

    setMessages([
      { role: 'user', content: 'Habari Daktari, I am ready for the check-in.' },
      { role: 'assistant', content: '…' },
    ]);
    sendMessage(openingMessages, { temperature: 0.7, max_tokens: 500 });
  };

  const handleSend = () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages([...newMessages, { role: 'assistant', content: '…' }]);
    setInput('');
    setExchangeCount((c) => c + 1);

    const gestInfo = gestationalWeek ? ` She is at gestational week ${gestationalWeek}.` : '';
    const apiMessages = [
      {
        role: 'system',
        content: `${SYSTEM_PROMPT}\n\nPatient name: ${patientName}.${gestInfo}${
          exchangeCount >= 3
            ? ' You have gathered enough information. After your next response, include the RISK_ASSESSMENT_JSON.'
            : ''
        }`,
      },
      ...newMessages.map((m) => ({ role: m.role, content: m.content })),
    ];

    sendMessage(apiMessages, { temperature: 0.7, max_tokens: 600 });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const resetSession = () => {
    setSessionActive(false);
    setMessages([]);
    setRiskAssessment(null);
    setExchangeCount(0);
    setInput('');
  };

  return (
    <div className="bg-card border border-border rounded-xl card-glow-primary flex flex-col h-full min-h-[500px]">
      {/* Header */}
      <div className="p-5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
            <Icon name="ChatBubbleLeftRightIcon" size={16} variant="outline" className="text-primary" />
          </div>
          <div>
            <h2 className="section-header text-base">Conversational Voice & AI Health Check-In</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live Claude / SEQOY Clinical Engine · Preeclampsia &amp; PPH Screening
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {sessionActive && (
            <span className="flex items-center gap-1.5 text-xs text-primary font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Active Screening
            </span>
          )}
          {sessionActive && (
            <button
              onClick={resetSession}
              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="End session"
            >
              <Icon name="XMarkIcon" size={14} variant="outline" />
            </button>
          )}
        </div>
      </div>

      {/* Risk Assessment Banner */}
      {riskAssessment && (
        <div className={`mx-5 mt-4 p-4 rounded-xl border ${riskBg[riskAssessment.level]}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Icon
                  name="ShieldExclamationIcon"
                  size={14}
                  variant="solid"
                  className={riskColors[riskAssessment.level]}
                />
                <span className={`text-xs font-bold uppercase tracking-wide ${riskColors[riskAssessment.level]}`}>
                  {riskAssessment.level} RISK TRIAGE
                </span>
                <span className={`text-lg font-bold font-tabular ${riskColors[riskAssessment.level]}`}>
                  {riskAssessment.score.toFixed(1)}/10
                </span>
              </div>
              {/* Score bar */}
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${riskBarColor[riskAssessment.level]}`}
                  style={{ width: `${(riskAssessment.score / 10) * 100}%` }}
                />
              </div>
              {riskAssessment.flags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {riskAssessment.flags.map((flag) => (
                    <span
                      key={flag}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${riskBg[riskAssessment.level]} ${
                        riskColors[riskAssessment.level]
                      }`}
                    >
                      ✓ {flag}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-xs text-foreground leading-relaxed">{riskAssessment.recommendation}</p>
            </div>
          </div>
        </div>
      )}

      {/* Messages Box */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3 scrollbar-thin">
        {!sessionActive && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 py-8">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Icon name="HeartIcon" size={24} variant="outline" className="text-primary" />
            </div>
            <div className="text-center max-w-xs">
              <p className="text-sm font-semibold text-foreground mb-1">Maternal Health Screening</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Start a conversational AI screening session to assess preeclampsia and PPH risk in real time with automated clinical scoring.
              </p>
            </div>
            <button
              onClick={startSession}
              className="btn-primary text-xs px-6 py-2.5 mt-2"
            >
              <Icon name="PlayIcon" size={14} variant="solid" />
              Start Interactive Check-In
            </button>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon name="CpuChipIcon" size={13} variant="solid" className="text-primary" />
              </div>
            )}
            <div
              className={`max-w-[80%] px-3.5 py-2.5 rounded-xl text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-tr-sm font-medium'
                  : 'bg-muted text-foreground rounded-tl-sm'
              }`}
            >
              {msg.content === '…' ? (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              ) : (
                msg.content
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon name="UserIcon" size={13} variant="solid" className="text-secondary-foreground" />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      {sessionActive && (
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Jibu kwa Kiswahili au Kiingereza (e.g. Ndio nina maumivu ya kichwa)..."
              disabled={isLoading}
              className="input-field flex-1 text-xs h-9"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="btn-primary h-9 px-3 disabled:opacity-40"
              aria-label="Send message"
            >
              {isLoading ? (
                <Icon name="ArrowPathIcon" size={14} variant="outline" className="animate-spin" />
              ) : (
                <Icon name="PaperAirplaneIcon" size={14} variant="solid" />
              )}
            </button>
          </div>
        </div>
      )}

      {riskAssessment && !isLoading && (
        <div className="p-3 border-t border-border flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Check-in complete · Triage scored</p>
          <button onClick={startSession} className="btn-secondary text-xs py-1 px-3">
            <Icon name="ArrowPathIcon" size={12} variant="outline" />
            New Screening
          </button>
        </div>
      )}
    </div>
  );
}

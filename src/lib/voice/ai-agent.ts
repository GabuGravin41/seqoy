import { evaluateClinicalRisk, TriageInput, TriageResult } from "../clinical/risk-scorer";

export interface VoiceAICheckinScript {
  language: "SWAHILI" | "ENGLISH";
  greeting: string;
  symptomQuestions: {
    key: keyof TriageInput;
    questionAudioText: string;
    keywordsAffirmative: string[];
    keywordsNegative: string[];
  }[];
  emergencyHandoverText: string;
  safeClosingText: string;
}

export const swahiliVoiceScript: VoiceAICheckinScript = {
  language: "SWAHILI",
  greeting: "Habari Mama! Huyu ni Daktari wa Kielektroniki kutoka Mtandao wa SEQOY Maternal Care. Ningependa kuuliza maswali mafupi kuhusu afya yako leo.",
  symptomQuestions: [
    {
      key: "hasSevereHeadache",
      questionAudioText: "Kwanza, je unahisi maumivu makali ya kichwa yasiyokoma au unashindwa kutazama mwanga?",
      keywordsAffirmative: ["ndio", "ndiyo", "sana", "kichwa kinauma", "inauma", "ndio kinauma", "yes", "naam"],
      keywordsNegative: ["hapana", "la", "hakioumi", "sihisi", "hapana kabisa", "no"],
    },
    {
      key: "hasBlurredVision",
      questionAudioText: "Je, macho yako yanaona ukungu, giza, au cheche za mwanga?",
      keywordsAffirmative: ["ndio", "macho hayaoni", "ukungu", "giza", "naona ukungu", "ndiyo", "yes"],
      keywordsNegative: ["hapana", "naona vizuri", "sioni ukungu", "hakuna", "no"],
    },
    {
      key: "hasSevereSwelling",
      questionAudioText: "Je, una uvimbe wa ghafla usoni, kwenye mikono, au miguuni?",
      keywordsAffirmative: ["ndio", "nimevimba", "uvimbe", "miguu imevimba", "uso umevimba", "ndiyo", "yes"],
      keywordsNegative: ["hapana", "sijavimba", "hakuna uvimbe", "no"],
    },
    {
      key: "hasVaginalBleeding",
      questionAudioText: "Je, una tatizo la kutokwa na damu ukeni au maji ya uzazi?",
      keywordsAffirmative: ["ndio", "damu inatoka", "natokwa damu", "damu", "maji yanatoka", "ndiyo", "yes"],
      keywordsNegative: ["hapana", "hakuna damu", "sijatoka damu", "no"],
    },
    {
      key: "hasReducedFetalMovement",
      questionAudioText: "Je, mtoto anacheza kawaida tumboni, au uchezaji wake umepungua sana?",
      keywordsAffirmative: ["amepungua", "hachezi", "hachezi vizuri", "hapana hachezi", "ndio amepungua"],
      keywordsNegative: ["anacheza", "anacheza vizuri", "kawaida", "yuko sawa", "vizuri tu"],
    }
  ],
  emergencyHandoverText: "Mama, taarifa ulizotupa zinaonyesha dalili za hatari zinazohitaji matibabu ya dharura. Tumetuma taarifa kwa kituo chako cha afya na hospitali ya rufaa iliyo karibu inajiandaa kukupokea. Usitembee peke yako.",
  safeClosingText: "Asante sana Mama. Afya yako na ya mtoto inaonekana salama kabisa. Endelea kuzingatia lishe bora na kliniki yako ifuatayo.",
};

export const englishVoiceScript: VoiceAICheckinScript = {
  language: "ENGLISH",
  greeting: "Hello Mama! This is your automated SEQOY Maternal Care Voice AI check-in. I have a few quick health questions for you today.",
  symptomQuestions: [
    {
      key: "hasSevereHeadache",
      questionAudioText: "First, are you experiencing severe, continuous headaches that will not go away?",
      keywordsAffirmative: ["yes", "yeah", "severe", "hurts a lot", "terrible", "true"],
      keywordsNegative: ["no", "nope", "not at all", "feeling fine", "none"],
    },
    {
      key: "hasBlurredVision",
      questionAudioText: "Are you seeing spots, flashes of light, or blurred vision?",
      keywordsAffirmative: ["yes", "blurry", "flashes", "cannot see well", "spots"],
      keywordsNegative: ["no", "vision is clear", "fine", "normal"],
    },
    {
      key: "hasSevereSwelling",
      questionAudioText: "Do you have sudden, severe swelling in your face, hands, or feet?",
      keywordsAffirmative: ["yes", "swollen", "my feet are swollen", "face is swollen", "puffy"],
      keywordsNegative: ["no", "not swollen", "normal"],
    },
    {
      key: "hasVaginalBleeding",
      questionAudioText: "Are you experiencing any vaginal bleeding or fluid leakage?",
      keywordsAffirmative: ["yes", "bleeding", "blood", "leaking", "fluid"],
      keywordsNegative: ["no", "no bleeding", "clean"],
    },
    {
      key: "hasReducedFetalMovement",
      questionAudioText: "Has your baby stopped kicking or is moving significantly less than usual?",
      keywordsAffirmative: ["yes", "stopped moving", "less movement", "not kicking", "quiet"],
      keywordsNegative: ["no", "kicking strong", "moving well", "active", "normal"],
    }
  ],
  emergencyHandoverText: "Mama, your reported symptoms require immediate emergency care for preeclampsia or obstetric complications. We are routing your case to the nearest available referral center right now.",
  safeClosingText: "Thank you Mama. Your check-in shows you and baby are in great shape. Keep taking your iron supplements and stay hydrated.",
};

export function parseVoiceTranscription(transcript: string, language: "SWAHILI" | "ENGLISH" = "SWAHILI"): {
  symptoms: TriageInput;
  triage: TriageResult;
  extractedKeywords: string[];
} {
  const lower = transcript.toLowerCase();
  const extractedKeywords: string[] = [];
  const symptoms: TriageInput = {};

  // Swahili Keywords
  const swahiliHeadache = ["kichwa", "kichwa kinauma", "maumivu ya kichwa", "headache"];
  const swahiliVision = ["macho", "ukungu", "giza", "sioni vizuri", "cheche"];
  const swahiliSwelling = ["vimba", "imevimba", "kuvimba", "uvimbe", "miguu kuvimba", "uso kuvimba", "swelling", "edema"];
  const swahiliBleeding = ["damu", "kutokwa damu", "damu inatoka", "bleeding", "kutoka damu"];
  const swahiliFever = ["homa", "mwili moto", "fever"];
  const swahiliFetal = ["hachezi", "mtoto hachezi", "mtoto kupungua", "reduced movement"];
  const swahiliPain = ["tumbo", "tumbo linauma", "maumivu makali", "stomach pain"];

  if (swahiliHeadache.some(k => lower.includes(k))) {
    symptoms.hasSevereHeadache = true;
    extractedKeywords.push("Severe Headache");
  }
  if (swahiliVision.some(k => lower.includes(k))) {
    symptoms.hasBlurredVision = true;
    extractedKeywords.push("Blurred Vision / Scotoma");
  }
  if (swahiliSwelling.some(k => lower.includes(k))) {
    symptoms.hasSevereSwelling = true;
    extractedKeywords.push("Severe Edema / Swelling");
  }
  if (swahiliBleeding.some(k => lower.includes(k))) {
    symptoms.hasVaginalBleeding = true;
    extractedKeywords.push("Vaginal Bleeding");
  }
  if (swahiliFever.some(k => lower.includes(k))) {
    symptoms.hasHighFever = true;
    extractedKeywords.push("High Fever");
  }
  if (swahiliFetal.some(k => lower.includes(k))) {
    symptoms.hasReducedFetalMovement = true;
    extractedKeywords.push("Reduced Fetal Movement");
  }
  if (swahiliPain.some(k => lower.includes(k))) {
    symptoms.hasSevereAbdominalPain = true;
    extractedKeywords.push("Severe Abdominal Pain");
  }

  const triage = evaluateClinicalRisk(symptoms);

  return {
    symptoms,
    triage,
    extractedKeywords,
  };
}

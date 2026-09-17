import { evaluateClinicalRisk } from "../clinical/risk-scorer";

export interface USSDSessionParams {
  sessionId: string;
  serviceCode: string;
  phoneNumber: string;
  text: string; // e.g. "", "1", "1*2", "1*2*1"
}

export interface USSDResponse {
  response: string; // Must start with "CON " or "END " for telecom gateways
  shouldSaveCheckin?: boolean;
  triageData?: {
    hasSevereHeadache: boolean;
    hasBlurredVision: boolean;
    hasSevereSwelling: boolean;
    hasVaginalBleeding: boolean;
    hasHighFever: boolean;
    hasReducedFetalMovement: boolean;
    hasSevereAbdominalPain: boolean;
    language: string;
  };
  /** Delay 1: the mother picked her own call day/time via the USSD menu. */
  scheduleUpdate?: {
    preferredCheckinDayOfWeek: number; // 0=Sun ... 6=Sat
    preferredCheckinHour: number;
  };
}

const DAY_OPTIONS_SWAHILI = [
  { key: "1", label: "Jumatatu", dayOfWeek: 1 },
  { key: "2", label: "Jumanne", dayOfWeek: 2 },
  { key: "3", label: "Jumatano", dayOfWeek: 3 },
  { key: "4", label: "Alhamisi", dayOfWeek: 4 },
  { key: "5", label: "Ijumaa", dayOfWeek: 5 },
  { key: "6", label: "Jumamosi", dayOfWeek: 6 },
  { key: "7", label: "Jumapili", dayOfWeek: 0 },
];

const DAY_OPTIONS_ENGLISH = [
  { key: "1", label: "Monday", dayOfWeek: 1 },
  { key: "2", label: "Tuesday", dayOfWeek: 2 },
  { key: "3", label: "Wednesday", dayOfWeek: 3 },
  { key: "4", label: "Thursday", dayOfWeek: 4 },
  { key: "5", label: "Friday", dayOfWeek: 5 },
  { key: "6", label: "Saturday", dayOfWeek: 6 },
  { key: "7", label: "Sunday", dayOfWeek: 0 },
];

const TIME_BUCKET_HOURS: Record<string, number> = { "1": 9, "2": 14, "3": 18 };

export function handleUSSDSession(params: USSDSessionParams): USSDResponse {
  const { text } = params;
  const parts = text ? text.split("*") : [];

  // Step 0: Root Welcome & Language Menu
  if (parts.length === 0 || text === "") {
    return {
      response: `CON Karibu SEQOY Huduma ya Mama na Mtoto:
Chagua Lugha / Select Language:
1. Kiswahili
2. English
3. Msaada wa Haraka (Emergency SOS)`,
    };
  }

  const rootChoice = parts[0];

  // Emergency SOS Immediate Trigger
  if (rootChoice === "3") {
    const triage = {
      hasSevereHeadache: true,
      hasBlurredVision: true,
      hasSevereSwelling: true,
      hasVaginalBleeding: true,
      hasHighFever: false,
      hasReducedFetalMovement: true,
      hasSevereAbdominalPain: true,
      language: "SWAHILI",
    };
    return {
      response: `END [TAHADHARI YA HARAKA]
Taarifa yako ya dharura imetumwa moja kwa moja kwa mkunga na kliniki yako.
Tafadhali tulia na unywe maji. Wahudumu wa afya wanakupigia simu sasa hivi. Piga 1199 au 0800-720-999 kwa gari la wagonjwa.`,
      shouldSaveCheckin: true,
      triageData: triage,
    };
  }

  // --- SWAHILI FLOW (Choice 1) ---
  if (rootChoice === "1") {
    // Step 1: Main Swahili Menu
    if (parts.length === 1) {
      return {
        response: `CON Huduma za SEQOY kwa Mama:
1. Ripoti Hali Yako ya Leo (Check-in)
2. Dalili za Hatari Wakati wa Mimba
3. Tarehe ya Kliniki ya Wazazi
4. Piga Simu ya Dharura
5. Badilisha Siku/Muda wa Kupigiwa Simu`,
      };
    }

    const swahiliSubChoice = parts[1];

    if (swahiliSubChoice === "1") {
      // Swahili Question 1: Kichwa & Macho
      if (parts.length === 2) {
        return {
          response: `CON Je, unahisi maumivu makali ya kichwa yasiyopoa au macho kuona ukungu/giza?
1. Ndio (Inauma / Sioni vizuri)
2. Hapana (Niko sawa)`,
        };
      }
      // Question 2: Uvimbe & Kutokwa na Damu
      if (parts.length === 3) {
        return {
          response: `CON Je, miguu/uso umevimba ghafla au unatokwa na damu ukeni?
1. Ndio, Damu inatoka
2. Ndio, Uvimbe mkubwa
3. Zote mbili
4. Hapana, Hakuna uvimbe wala damu`,
        };
      }
      // Question 3: Maumivu ya Tumbo & Mtoto kucheza
      if (parts.length === 4) {
        return {
          response: `CON Je, mtoto anacheza vizuri tumboni na huna maumivu makali ya tumbo?
1. Ndio, mtoto anacheza vizuri
2. Hapana, mtoto hachezi au tumbo linauma sana`,
        };
      }
      // Results Evaluation
      if (parts.length === 5) {
        const q1 = parts[2];
        const q2 = parts[3];
        const q3 = parts[4];

        const hasHeadache = q1 === "1";
        const hasVision = q1 === "1";
        const hasBleeding = q2 === "1" || q2 === "3";
        const hasSwelling = q2 === "2" || q2 === "3";
        const hasPainOrReducedMovement = q3 === "2";

        const risk = evaluateClinicalRisk({
          hasSevereHeadache: hasHeadache,
          hasBlurredVision: hasVision,
          hasSevereSwelling: hasSwelling,
          hasVaginalBleeding: hasBleeding,
          hasHighFever: false,
          hasReducedFetalMovement: hasPainOrReducedMovement,
          hasSevereAbdominalPain: hasPainOrReducedMovement,
        });

        let msg = "";
        if (risk.flaggedForImmediateReferral || risk.riskLevel === "CRITICAL_EMERGENCY") {
          msg = `END [DHARURA YA HARAKA]
Mama, dalili ulizotaja (Kichwa, Macho au Damu) zinahitaji uangalizi wa haraka hospitalini.
Kliniki yako imearifiwa. Tafadhali nenda kwenye hospitali ya rufaa iliyo karibu mara moja!`;
        } else if (risk.riskLevel === "ELEVATED_RISK") {
          msg = `END [USHAURI WA KLINIKI]
Asante kwa kutoa taarifa. Kuna dalili chache zinazofaa kutazamwa na daktari. Tafadhali tembelea kliniki yako kesho asubuhi kwa ukaguzi wa kawaida.`;
        } else {
          msg = `END [HALI YAKO NI SHWARI]
Hongera Mama! Afya yako na ya mtoto inaendelea vizuri. Kumbuka kumeza vidonge vya madini ya chuma na kunywa maji ya kutosha.`;
        }

        return {
          response: msg,
          shouldSaveCheckin: true,
          triageData: {
            hasSevereHeadache: hasHeadache,
            hasBlurredVision: hasVision,
            hasSevereSwelling: hasSwelling,
            hasVaginalBleeding: hasBleeding,
            hasHighFever: false,
            hasReducedFetalMovement: hasPainOrReducedMovement,
            hasSevereAbdominalPain: hasPainOrReducedMovement,
            language: "SWAHILI",
          },
        };
      }
    }

    if (swahiliSubChoice === "2") {
      return {
        response: `END Dalili za Hatari Wakati wa Mimba:
• Kichwa kuuma sana & kutoona vizuri
• Kutokwa na damu au maji ukeni
• Uvimbe wa ghafla usoni au miguuni
• Mtoto kuacha kucheza tumboni
• Homa kali na kutetemeka
Ukiona dalili hizi, nenda hospitalini mara moja!`,
      };
    }

    if (swahiliSubChoice === "3") {
      return {
        response: `END Tarehe yako ijayo ya kliniki ya wazazi ni: Tarehe 15 mwezi ujao katika Kituo cha Afya cha Kangemi.
Ukihisi mabadiliko yoyote, piga *384*99# wakati wowote.`,
      };
    }

    if (swahiliSubChoice === "4") {
      return {
        response: `END Piga Namba ya Bure ya Dharura ya SEQOY: 0800-720-999 au 1199 kwa usaidizi wa haraka wa gari la wagonjwa.`,
      };
    }

    if (swahiliSubChoice === "5") {
      if (parts.length === 2) {
        return {
          response: `CON Chagua siku unayotaka kupigiwa simu:
${DAY_OPTIONS_SWAHILI.map((d) => `${d.key}. ${d.label}`).join("\n")}`,
        };
      }
      if (parts.length === 3) {
        return {
          response: `CON Chagua muda unaokufaa:
1. Asubuhi (9AM)
2. Mchana (2PM)
3. Jioni (6PM)`,
        };
      }
      if (parts.length === 4) {
        const dayChoice = DAY_OPTIONS_SWAHILI.find((d) => d.key === parts[2]);
        const hour = TIME_BUCKET_HOURS[parts[3]];
        if (!dayChoice || hour === undefined) {
          return { response: `END Chaguo si sahihi. Piga *384*99# kuanza tena.` };
        }
        return {
          response: `END Umefanikiwa! Sasa utapigiwa simu kila ${dayChoice.label} muda wa saa uliyochagua.`,
          scheduleUpdate: { preferredCheckinDayOfWeek: dayChoice.dayOfWeek, preferredCheckinHour: hour },
        };
      }
    }
  }

  // --- ENGLISH FLOW (Choice 2) ---
  if (rootChoice === "2") {
    if (parts.length === 1) {
      return {
        response: `CON SEQOY Maternal Care for Mothers:
1. How Are You Feeling Today? (Check-in)
2. Warning & Danger Signs
3. Next Pregnancy Clinic Visit
4. Call for Emergency Help
5. Change My Call Day/Time`,
      };
    }

    const engSubChoice = parts[1];

    if (engSubChoice === "1") {
      if (parts.length === 2) {
        return {
          response: `CON Are you experiencing constant severe headache or blurred vision?
1. Yes (Severe pain / blurred vision)
2. No (Feeling fine)`,
        };
      }
      if (parts.length === 3) {
        return {
          response: `CON Do you have sudden swelling on face/feet or any vaginal bleeding?
1. Yes, vaginal bleeding
2. Yes, severe swelling
3. Both bleeding and swelling
4. No, neither`,
        };
      }
      if (parts.length === 4) {
        return {
          response: `CON Is your baby kicking normally and do you feel free from severe stomach pain?
1. Yes, baby is active & kicking well
2. No, baby stopped moving or stomach hurts severely`,
        };
      }
      if (parts.length === 5) {
        const q1 = parts[2];
        const q2 = parts[3];
        const q3 = parts[4];

        const hasHeadache = q1 === "1";
        const hasVision = q1 === "1";
        const hasBleeding = q2 === "1" || q2 === "3";
        const hasSwelling = q2 === "2" || q2 === "3";
        const hasPainOrReducedMovement = q3 === "2";

        const risk = evaluateClinicalRisk({
          hasSevereHeadache: hasHeadache,
          hasBlurredVision: hasVision,
          hasSevereSwelling: hasSwelling,
          hasVaginalBleeding: hasBleeding,
          hasHighFever: false,
          hasReducedFetalMovement: hasPainOrReducedMovement,
          hasSevereAbdominalPain: hasPainOrReducedMovement,
        });

        let msg = "";
        if (risk.flaggedForImmediateReferral || risk.riskLevel === "CRITICAL_EMERGENCY") {
          msg = `END [URGENT EMERGENCY ALERT]
Mama, your reported symptoms indicate a potential pregnancy emergency (Preeclampsia or Bleeding).
Your clinic has been alerted. Please go to the nearest referral hospital immediately!`;
        } else if (risk.riskLevel === "ELEVATED_RISK") {
          msg = `END [CLINIC ADVICE]
Thank you for your report. Some symptoms require a routine check by your midwife. Please visit your local clinic tomorrow morning.`;
        } else {
          msg = `END [ALL CLEAR & HEALTHY]
Great news Mama! Your check-in shows you and baby are doing well. Remember to take your daily iron supplements and drink plenty of clean water.`;
        }

        return {
          response: msg,
          shouldSaveCheckin: true,
          triageData: {
            hasSevereHeadache: hasHeadache,
            hasBlurredVision: hasVision,
            hasSevereSwelling: hasSwelling,
            hasVaginalBleeding: hasBleeding,
            hasHighFever: false,
            hasReducedFetalMovement: hasPainOrReducedMovement,
            hasSevereAbdominalPain: hasPainOrReducedMovement,
            language: "ENGLISH",
          },
        };
      }
    }

    if (engSubChoice === "2") {
      return {
        response: `END Key Pregnancy Danger Signs:
• Severe constant headache & blurred vision
• Vaginal bleeding or fluid leaking
• Sudden face/hand/foot swelling
• Baby stops moving or kicking
• High fever and chills
If you experience any of these, visit your hospital immediately!`,
      };
    }

    if (engSubChoice === "3") {
      return {
        response: `END Your next scheduled pregnancy clinic visit is: 15th of next month at Kangemi Health Centre.
If you feel unwell before then, dial *384*99# anytime.`,
      };
    }

    if (engSubChoice === "4") {
      return {
        response: `END Call SEQOY Free Emergency Toll-Free: 0800-720-999 or 1199 for free ambulance dispatch assistance.`,
      };
    }

    if (engSubChoice === "5") {
      if (parts.length === 2) {
        return {
          response: `CON Choose the day you want to be called:
${DAY_OPTIONS_ENGLISH.map((d) => `${d.key}. ${d.label}`).join("\n")}`,
        };
      }
      if (parts.length === 3) {
        return {
          response: `CON Choose a time that works for you:
1. Morning (9AM)
2. Afternoon (2PM)
3. Evening (6PM)`,
        };
      }
      if (parts.length === 4) {
        const dayChoice = DAY_OPTIONS_ENGLISH.find((d) => d.key === parts[2]);
        const hour = TIME_BUCKET_HOURS[parts[3]];
        if (!dayChoice || hour === undefined) {
          return { response: `END Invalid selection. Dial *384*99# to start again.` };
        }
        return {
          response: `END Done! You will now be called every ${dayChoice.label} at your chosen time.`,
          scheduleUpdate: { preferredCheckinDayOfWeek: dayChoice.dayOfWeek, preferredCheckinHour: hour },
        };
      }
    }
  }

  return {
    response: `END Chaguo si sahihi / Invalid selection. Piga *384*99# kuanza tena.`,
  };
}

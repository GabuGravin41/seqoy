import { evaluateClinicalRisk } from "../clinical/risk-scorer";

export interface USSDSessionParams {
  sessionId: string;
  serviceCode: string;
  phoneNumber: string;
  text: string; // e.g. "", "1", "1*2", "1*2*1"
}

export interface USSDResponse {
  response: string; // Must start with "CON " or "END "
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
}

export function handleUSSDSession(params: USSDSessionParams): USSDResponse {
  const { text } = params;
  const parts = text ? text.split("*") : [];

  // Step 0: Root Menu
  if (parts.length === 0 || text === "") {
    return {
      response: `CON Karibu SEQOY Maternal Care / Welcome to SEQOY
Chagua Lugha / Select Language:
1. Kiswahili
2. English
3. Msaada wa Dharura / Emergency SOS`,
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
      response: `END [DHARURA YA HARAKA]
Taarifa ya dharura imetumwa kwa kituo chako cha afya mara moja. 
Tafadhali kaa mahali salama. Wahudumu wa afya watawasiliana nawe sasa hivi. Piga 1199 ikiwa gari la dharura linahitajika.`,
      shouldSaveCheckin: true,
      triageData: triage,
    };
  }

  // --- SWAHILI FLOW (Choice 1) ---
  if (rootChoice === "1") {
    // Step 1: Main Swahili Menu
    if (parts.length === 1) {
      return {
        response: `CON Huduma za SEQOY:
1. Ripoti Hali ya Afya Leo (Check-in)
2. Dalili za Hatari (Danger Signs)
3. Tarehe ya Kliniki Inayofuata
4. Msaada wa Dharura`,
      };
    }

    const swahiliSubChoice = parts[1];

    if (swahiliSubChoice === "1") {
      // Swahili Check-in Question 1: Kichwa & Macho
      if (parts.length === 2) {
        return {
          response: `CON Je, una maumivu makali ya kichwa au macho kuona ukungu/giza?
1. Ndio
2. Hapana`,
        };
      }
      // Question 2: Uvimbe & Kutokwa na Damu
      if (parts.length === 3) {
        return {
          response: `CON Je, una uvimbe mkubwa miguuni/usoni au unatokwa na damu?
1. Ndio, Damu inatoka
2. Ndio, Uvimbe mkubwa
3. Zote mbili
4. Hapana`,
        };
      }
      // Question 3: Maumivu ya Tumbo & Mtoto kucheza
      if (parts.length === 4) {
        return {
          response: `CON Je, mtoto anacheza vizuri na huna maumivu makali ya tumbo?
1. Mtoto anacheza vizuri / Sina maumivu
2. Mtoto hachezi vizuri au Tumbo linauma sana`,
        };
      }

      // Evaluation at completion
      if (parts.length >= 5) {
        const q1 = parts[2]; // "1" = Ndio (Kichwa/Macho)
        const q2 = parts[3]; // "1" = Damu, "2" = Uvimbe, "3" = Zote, "4" = Hapana
        const q3 = parts[4]; // "2" = Mtoto hachezi / Tumbo linauma

        const hasHeadache = q1 === "1";
        const hasVision = q1 === "1";
        const hasBleeding = q2 === "1" || q2 === "3";
        const hasSwelling = q2 === "2" || q2 === "3";
        const hasPainOrReducedMovement = q3 === "2";

        const risk = evaluateClinicalRisk({
          hasSevereHeadache: hasHeadache,
          hasBlurredVision: hasVision,
          hasVaginalBleeding: hasBleeding,
          hasSevereSwelling: hasSwelling,
          hasReducedFetalMovement: hasPainOrReducedMovement,
          hasSevereAbdominalPain: hasPainOrReducedMovement,
        });

        let msg = "";
        if (risk.riskLevel === "CRITICAL_EMERGENCY") {
          msg = `END [HATARI KUBWA]
Dalili ulizoripoti zinaonyesha dharura (Kifafa cha Mimba au Kutokwa Damu).
Kituo chako cha afya kimearifiwa sasa hivi. Elekea kwenye hospitali ya rufaa iliyo karibu mara moja!`;
        } else if (risk.riskLevel === "ELEVATED_RISK") {
          msg = `END [TAHADHARI]
Asante kwa kutoa taarifa. Kuna dalili zinazohitaji daktari kutazama. Tafadhali tembelea kituo cha afya kesho asubuhi.`;
        } else {
          msg = `END [HALI SHWARI]
Asante Mama. Afya yako na ya mtoto iko salama. Endelea kula vyakula bora na kumeza vidonge vya madini ya chuma.`;
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
        response: `END Dalili Kuu za Hatari:
- Maumivu makali ya kichwa & kutoona vizuri
- Kutokwa na damu ukeni
- Uvimbe wa ghafla mikononi/usoni
- Mtoto kuacha kucheza
Ukiona haya, piga dharura mara moja!`,
      };
    }

    if (swahiliSubChoice === "3") {
      return {
        response: `END Tarehe yako ya kliniki ijayo ni: 15/09/2026 katika Kituo cha Afya cha Kangemi.
Ukipata mabadiliko yoyote, piga *384*99# tena.`,
      };
    }

    if (swahiliSubChoice === "4") {
      return {
        response: `END Piga Namba ya Dharura ya SEQOY: 0800-720-999 au 1199 kwa msaada wa gari la wagonjwa bila malipo.`,
      };
    }
  }

  // --- ENGLISH FLOW (Choice 2) ---
  if (rootChoice === "2") {
    if (parts.length === 1) {
      return {
        response: `CON SEQOY Maternal Health:
1. Log Health Check-in
2. Review Danger Signs
3. Next ANC Clinic Date
4. Emergency SOS Help`,
      };
    }

    const engSubChoice = parts[1];

    if (engSubChoice === "1") {
      if (parts.length === 2) {
        return {
          response: `CON Are you experiencing severe headaches or blurred vision?
1. Yes
2. No`,
        };
      }
      if (parts.length === 3) {
        return {
          response: `CON Are you having sudden severe swelling or vaginal bleeding?
1. Yes, Bleeding
2. Yes, Severe Swelling
3. Both
4. No`,
        };
      }
      if (parts.length === 4) {
        return {
          response: `CON Is baby moving normally and are you free of sharp stomach pains?
1. Baby moving well / No pain
2. Baby not moving / Severe pain`,
        };
      }

      if (parts.length >= 5) {
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
          hasVaginalBleeding: hasBleeding,
          hasSevereSwelling: hasSwelling,
          hasReducedFetalMovement: hasPainOrReducedMovement,
          hasSevereAbdominalPain: hasPainOrReducedMovement,
        });

        let msg = "";
        if (risk.riskLevel === "CRITICAL_EMERGENCY") {
          msg = `END [CRITICAL RED FLAG]
Your reported symptoms indicate high risk of Preeclampsia or Hemorrhage.
Your local clinic has been alerted. Please go to the nearest referral hospital immediately!`;
        } else if (risk.riskLevel === "ELEVATED_RISK") {
          msg = `END [ELEVATED RISK]
Thank you. Some symptoms need clinical attention. Please visit your primary health clinic tomorrow morning for a BP check.`;
        } else {
          msg = `END [ALL CLEAR]
Thank you Mama. Your check-in shows you and your baby are doing well. Continue with your supplements and diet.`;
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
        response: `END Key Maternal Danger Signs:
- Severe headache with blurred vision
- Vaginal bleeding or fluid leakage
- Sudden face/hand swelling
- Decreased fetal movements
Seek immediate medical attention if detected.`,
      };
    }

    if (engSubChoice === "3") {
      return {
        response: `END Your next ANC appointment is: Sept 15, 2026 at Kangemi Health Centre.`,
      };
    }

    if (engSubChoice === "4") {
      return {
        response: `END Call SEQOY Emergency Toll-Free: 0800-720-999 or Red Cross 1199 for immediate ambulance dispatch.`,
      };
    }
  }

  return {
    response: `END Chaguo si sahihi / Invalid selection. Dial *384*99# to start again.`,
  };
}

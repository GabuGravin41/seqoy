export interface TriageInput {
  hasSevereHeadache?: boolean;
  hasBlurredVision?: boolean;
  hasSevereSwelling?: boolean;
  hasVaginalBleeding?: boolean;
  hasHighFever?: boolean;
  hasReducedFetalMovement?: boolean;
  hasSevereAbdominalPain?: boolean;
  systolicBp?: number;
  diastolicBp?: number;
  gestationalWeeks?: number;
}

export interface TriageResult {
  riskScore: number; // 0 - 100
  riskLevel: "NORMAL" | "ELEVATED_RISK" | "CRITICAL_EMERGENCY";
  suspectedCondition: "PREECLAMPSIA" | "PPH" | "SEPSIS" | "OBSTRUCTED_LABOR" | "NONE";
  flaggedForImmediateReferral: boolean;
  recommendedAction: string;
  clinicalSigns: string[];
  swahiliSummary: string;
}

export function evaluateClinicalRisk(input: TriageInput): TriageResult {
  let score = 0;
  const signs: string[] = [];
  let suspectedCondition: TriageResult["suspectedCondition"] = "NONE";

  // Blood Pressure Evaluation (Severe Hypertension in Pregnancy)
  const systolic = input.systolicBp || 0;
  const diastolic = input.diastolicBp || 0;

  if (systolic >= 160 || diastolic >= 110) {
    score += 45;
    signs.push(`Severe Hypertension (BP ${systolic}/${diastolic} mmHg)`);
    suspectedCondition = "PREECLAMPSIA";
  } else if (systolic >= 140 || diastolic >= 90) {
    score += 25;
    signs.push(`Mild-to-Moderate Hypertension (BP ${systolic}/${diastolic} mmHg)`);
    if (suspectedCondition === "NONE") suspectedCondition = "PREECLAMPSIA";
  }

  // Preeclampsia / Eclampsia Danger Signs
  if (input.hasSevereHeadache) {
    score += 20;
    signs.push("Severe persistent frontal headache (cerebral edema sign)");
  }
  if (input.hasBlurredVision) {
    score += 25;
    signs.push("Visual disturbances / blurred vision / scotoma");
    suspectedCondition = "PREECLAMPSIA";
  }
  if (input.hasSevereSwelling) {
    score += 15;
    signs.push("Severe facial and sudden bilateral leg edema");
  }
  if (input.hasSevereAbdominalPain) {
    score += 20;
    signs.push("Severe epigastric / right upper quadrant pain");
  }

  // Obstetric Hemorrhage (PPH / APH)
  if (input.hasVaginalBleeding) {
    score += 45;
    signs.push("Vaginal bleeding / hemorrhage");
    suspectedCondition = "PPH";
  }

  // Maternal Infection / Sepsis
  if (input.hasHighFever) {
    score += 30;
    signs.push("High fever / systemic inflammatory response");
    if (suspectedCondition === "NONE") suspectedCondition = "SEPSIS";
  }

  // Fetal Distress
  if (input.hasReducedFetalMovement) {
    score += 20;
    signs.push("Marked reduction or cessation of fetal movement");
  }

  // Clamp score
  const finalScore = Math.min(100, score);

  let riskLevel: TriageResult["riskLevel"] = "NORMAL";
  let flaggedForImmediateReferral = false;
  let recommendedAction = "Continue routine antenatal care (ANC) visits.";
  let swahiliSummary = "Hali ya mama iko shwari. Endelea na mahudhurio ya kliniki.";

  if (finalScore >= 60 || input.hasVaginalBleeding || (systolic >= 160 && input.hasBlurredVision)) {
    riskLevel = "CRITICAL_EMERGENCY";
    flaggedForImmediateReferral = true;
    recommendedAction = "IMMEDIATE RED FLAG: Arrange urgent transfer to a Level 5/6 hospital with ICU, surgical theatre, and blood reserve.";
    swahiliSummary = "DHARURA YA HARAKA: Mama anahitaji rufaa ya dharura kwenye hospitali kubwa yenye ICU na benki ya damu mara moja.";
  } else if (finalScore >= 25) {
    riskLevel = "ELEVATED_RISK";
    flaggedForImmediateReferral = false;
    recommendedAction = "ELEVATED RISK: Patient must report to the local health clinic within 12 hours for clinical workup and urine protein dipstick.";
    swahiliSummary = "TAHADHARI: Mama anapaswa kufika kituo cha afya ndani ya saa 12 kwa uchunguzi zaidi wa shinikizo la damu na protini.";
  }

  return {
    riskScore: finalScore,
    riskLevel,
    suspectedCondition,
    flaggedForImmediateReferral,
    recommendedAction,
    clinicalSigns: signs,
    swahiliSummary,
  };
}

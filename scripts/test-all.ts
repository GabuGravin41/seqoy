import { evaluateClinicalRisk } from "../src/lib/clinical/risk-scorer";
import { handleUSSDSession } from "../src/lib/ussd/state-machine";
import { parseVoiceTranscription } from "../src/lib/voice/ai-agent";
import { matchReferralHospitals } from "../src/lib/routing/capacity-matcher";
import { generateCountyMPDSRReport } from "../src/lib/analytics/mpdsr";
import { initialFacilities, initialCapacities, initialMPDSRLogs } from "../src/db/mock-store";
import { hasPermission } from "../src/lib/rbac/permissions";

let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    testsPassed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    testsFailed++;
  }
}

console.log("\n🧪 Running SEQOY Core Engine Verification Suite...\n");

// 1. Clinical Risk Triage Tests
console.log("1️⃣ Testing Clinical Risk Scorer...");
const preeclampsiaCase = evaluateClinicalRisk({
  hasSevereHeadache: true,
  hasBlurredVision: true,
  systolicBp: 165,
  diastolicBp: 110,
});
assert(
  preeclampsiaCase.riskLevel === "CRITICAL_EMERGENCY" &&
    preeclampsiaCase.suspectedCondition === "PREECLAMPSIA" &&
    preeclampsiaCase.flaggedForImmediateReferral === true,
  "Severe Preeclampsia correctly flagged as CRITICAL_EMERGENCY with immediate referral"
);

const normalCase = evaluateClinicalRisk({
  hasSevereHeadache: false,
  hasBlurredVision: false,
  systolicBp: 118,
  diastolicBp: 75,
});
assert(
  normalCase.riskLevel === "NORMAL" && normalCase.flaggedForImmediateReferral === false,
  "Normal pregnancy correctly triaged with zero false positive red flags"
);

// 2. USSD State Machine Tests (Delay 1)
console.log("\n2️⃣ Testing USSD Session State Machine...");
const ussdRoot = handleUSSDSession({
  sessionId: "SES-101",
  serviceCode: "*384*99#",
  phoneNumber: "+254712345678",
  text: "",
});
assert(
  ussdRoot.response.startsWith("CON") && ussdRoot.response.includes("Kiswahili"),
  "USSD root menu returns CON prompt with language options"
);

const ussdSwahiliEmergency = handleUSSDSession({
  sessionId: "SES-101",
  serviceCode: "*384*99#",
  phoneNumber: "+254712345678",
  text: "1*1*1*1*2",
});
assert(
  ussdSwahiliEmergency.response.startsWith("END") &&
    ussdSwahiliEmergency.shouldSaveCheckin === true &&
    ussdSwahiliEmergency.triageData?.hasSevereHeadache === true,
  "USSD Swahili multi-step check-in concludes with emergency END warning and saves check-in"
);

const ussdScheduleChange = handleUSSDSession({
  sessionId: "SES-102",
  serviceCode: "*384*99#",
  phoneNumber: "+254712345678",
  text: "1*5*6*2", // Swahili -> Change schedule -> Saturday -> Afternoon
});
assert(
  ussdScheduleChange.response.startsWith("END") &&
    ussdScheduleChange.scheduleUpdate?.preferredCheckinDayOfWeek === 6 &&
    ussdScheduleChange.scheduleUpdate?.preferredCheckinHour === 14,
  "USSD lets a mother set her own preferred call day/time"
);

// 3. Voice AI Entity Extraction Tests
console.log("\n3️⃣ Testing Voice AI Speech-to-Symptom Parser...");
const voiceParse = parseVoiceTranscription(
  "Habari daktari, nina maumivu makali ya kichwa naona ukungu na miguu imevimba sana.",
  "SWAHILI"
);
assert(
  voiceParse.symptoms.hasSevereHeadache === true &&
    voiceParse.symptoms.hasBlurredVision === true &&
    voiceParse.symptoms.hasSevereSwelling === true,
  "Voice AI correctly extracts Swahili symptoms (kichwa, ukungu, uvimbe)"
);

// 4. Smart Capacity-Aware Referral Matcher Tests (Delay 3 Solution)
console.log("\n4️⃣ Testing Smart Capacity Matcher (Anti-Referral Blindness Engine)...");
const match = matchReferralHospitals(
  {
    referringFacilityId: 1, // Kangemi
    patientBloodType: "O-",
    icuNeeded: true,
    theatreNeeded: true,
    bloodUnitsNeeded: 2,
    urgency: "CRITICAL_STAT",
  },
  initialFacilities,
  initialCapacities
);

assert(
  match.recommendedHospital !== null &&
    match.recommendedHospital.capacity.icuBedsAvailable > 0 &&
    match.blindReferralRiskIdentified === true,
  "Smart Matcher prevents blind referral to KNH (0 ICU beds) and safely routes to a capable Level 5 facility"
);

// Kenyan Reality Test 4B: Catastrophic Acuity Override Mandate (KNH Level 6)
const tertiaryMatch = matchReferralHospitals(
  {
    referringFacilityId: 1, // Kangemi
    patientBloodType: "O-",
    icuNeeded: true,
    theatreNeeded: true,
    bloodUnitsNeeded: 2,
    urgency: "CRITICAL_STAT",
    acuityTier: "TERTIARY_MANDATORY",
    tertiaryIndication: "UTERINE_RUPTURE",
  },
  initialFacilities,
  initialCapacities
);

assert(
  tertiaryMatch.recommendedHospital !== null &&
    tertiaryMatch.recommendedHospital.facility.name.includes("Kenyatta National Hospital") &&
    tertiaryMatch.recommendedHospital.isAcuityOverride === true,
  "Acuity Override safely routes catastrophic tertiary emergencies (e.g. Uterine Rupture) to KNH despite 0 available ICU beds"
);

// 5. RBAC Permission Matrix Tests
console.log("\n5️⃣ Testing RBAC Permission Matrix...");
assert(
  hasPermission("BED_MANAGER", "canUpdateCapacity") && !hasPermission("BED_MANAGER", "canUpdateBloodStock"),
  "Bed manager can update bed capacity but not blood stock"
);
assert(
  hasPermission("BLOOD_BANK_OFFICER", "canUpdateBloodStock") && !hasPermission("BLOOD_BANK_OFFICER", "canCreateReferral"),
  "Blood bank officer can update blood stock but not create referrals"
);
assert(
  hasPermission("SYSTEM_ADMIN", "canManageSystem") && hasPermission("SYSTEM_ADMIN", "canCreateReferral"),
  "System admin has unrestricted permissions"
);

// 6. MPDSR Analytics Tests (Delay 1 & Delay 3 only — Delay 2 is out of scope)
console.log("\n6️⃣ Testing MPDSR Analytics (Delay 1 & Delay 3)...");
const mpdsr = generateCountyMPDSRReport(initialMPDSRLogs);
assert(
  mpdsr.totalAudited > 0 && !mpdsr.insufficientData,
  "MPDSR reporting module computes real Delay 1 / Delay 3 metrics from audit logs"
);
const emptyMpdsr = generateCountyMPDSRReport([]);
assert(
  emptyMpdsr.insufficientData === true && emptyMpdsr.averageDelay3Minutes === null,
  "MPDSR reports insufficient data honestly instead of a fabricated placeholder"
);

// 7. Twilio Telephony & TwiML Generator Tests
console.log("\n7️⃣ Testing Twilio Voice AI & TwiML Generator...");
import { generateVoiceCheckinTwiML, generateTriageResultTwiML, triggerOutboundTriageCall } from "../src/lib/telephony/twilio";

const swahiliTwiML = generateVoiceCheckinTwiML({
  patientName: "Wanjiku Muthoni",
  language: "sw",
  baseUrl: "https://app.seqoy.health",
  patientId: "1",
});
assert(
  swahiliTwiML.includes("<Gather") && swahiliTwiML.includes("sw-KE"),
  "Twilio TwiML generator produces Swahili speech-gathering IVR XML"
);

const emergencyTwiML = generateTriageResultTwiML({
  riskLevel: "CRITICAL_EMERGENCY",
  advice: "Immediate transfer recommended",
  language: "sw",
});
assert(
  emergencyTwiML.includes("dalili za hatari") && emergencyTwiML.includes("<Hangup/>"),
  "Twilio Triage Result generates emergency audio guidance and clean hangup"
);

triggerOutboundTriageCall({
  toPhoneNumber: "+254712345678",
  patientId: "1",
  patientName: "Wanjiku Muthoni",
  language: "sw",
}).then((callResult) => {
  assert(callResult.success && Boolean(callResult.callSid), "Twilio Outbound Caller queues the biweekly check-in call");

  console.log(`\n========================================`);
  console.log(`✨ TEST RESULTS: ${testsPassed} Passed, ${testsFailed} Failed`);
  console.log(`========================================\n`);

  if (testsFailed > 0) {
    process.exit(1);
  }
});

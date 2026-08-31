import { evaluateClinicalRisk } from "../src/lib/clinical/risk-scorer";
import { handleUSSDSession } from "../src/lib/ussd/state-machine";
import { parseVoiceTranscription } from "../src/lib/voice/ai-agent";
import { matchReferralHospitals } from "../src/lib/routing/capacity-matcher";
import { dispatchEmergencyAmbulance } from "../src/lib/transport/dispatch";
import { generateCountyMPDSRReport } from "../src/lib/analytics/mpdsr";
import { mockMpdsrAuditLogs } from "../src/db/mock-store";

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

// 2. USSD State Machine Tests
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
  text: "1*1*1*1*2", // Swahili -> Check-in -> Severe Headache/Vision -> Bleeding -> Baby distress
});
assert(
  ussdSwahiliEmergency.response.startsWith("END") &&
    ussdSwahiliEmergency.shouldSaveCheckin === true &&
    ussdSwahiliEmergency.triageData?.hasSevereHeadache === true,
  "USSD Swahili multi-step check-in concludes with emergency END warning and saves check-in"
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

// 4. Smart Capacity-Aware Referral Matcher Tests (Delay 2 & 3 Solution)
console.log("\n4️⃣ Testing Smart Capacity Matcher (Anti-Referral Blindness Engine)...");
const match = matchReferralHospitals({
  referringFacilityId: 1, // Kangemi
  patientBloodType: "O-",
  icuNeeded: true,
  theatreNeeded: true,
  bloodUnitsNeeded: 2,
  urgency: "CRITICAL_STAT",
});

assert(
  match.recommendedHospital !== null &&
    match.recommendedHospital.capacity.icuBedsAvailable > 0 &&
    match.blindReferralRiskIdentified === true,
  "Smart Matcher prevents blind transfer to KNH (0 ICU beds) and safely routes to capable Level 5 facility"
);

// 5. Ambulance Dispatch Tests
console.log("\n5️⃣ Testing Emergency Transport Dispatcher...");
async function testDispatch() {
  const dispatch = await dispatchEmergencyAmbulance({
    referralId: 1,
    referringFacilityId: 1,
    referringFacilityName: "Kangemi Clinic",
    receivingFacilityId: 4,
    receivingFacilityName: "Kiambu Level 5",
    patientName: "Amina Wanjiku",
    clinicalIndication: "SEVERE_PREECLAMPSIA",
    urgencyLevel: "CRITICAL_STAT",
  });

  assert(
    dispatch.dispatchId.startsWith("DISPATCH-") &&
      dispatch.estimatedArrivalMinutes > 0 &&
      dispatch.status === "DISPATCHED",
    "Emergency transport dispatcher creates dispatch record with real-time ETA"
  );
}

// 6. MPDSR Analytics Tests
console.log("\n6️⃣ Testing MPDSR 3-Delays Analytics...");
const mpdsr = generateCountyMPDSRReport(mockMpdsrAuditLogs);
assert(
  mpdsr.totalAudited > 0 &&
    mpdsr.countySummary.nairobiMaternalMortalityAvoidanceScore > 0 &&
    mpdsr.countySummary.criticalInterventionRecommendations.length > 0,
  "MPDSR reporting module computes Delay metrics and County intervention summary"
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

testDispatch().then(async () => {
  const callResult = await triggerOutboundTriageCall({
    toPhoneNumber: "+254712345678",
    patientId: "1",
    patientName: "Wanjiku Muthoni",
    language: "sw",
  });
  assert(
    callResult.success && Boolean(callResult.callSid),
    "Twilio Outbound Caller queues automated triage call"
  );

  console.log(`\n========================================`);
  console.log(`✨ TEST RESULTS: ${testsPassed} Passed, ${testsFailed} Failed`);
  console.log(`========================================\n`);

  if (testsFailed > 0) {
    process.exit(1);
  }
});

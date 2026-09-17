/**
 * Short, factual weekly WhatsApp/SMS content by gestational stage, paired
 * with a prompt asking about any challenges — this is the message half of
 * Delay 1 (the call handles structured danger-sign triage; this handles the
 * lighter weekly touchpoint that also invites a free-text symptom report).
 */

interface WeeklyContent {
  minWeek: number;
  maxWeek: number;
  swahili: string;
  english: string;
}

const WEEKLY_CONTENT: WeeklyContent[] = [
  {
    minWeek: 0,
    maxWeek: 12,
    swahili: "Wiki hii mtoto wako anaunda viungo muhimu. Kumbuka kumeza vidonge vya asidi ya folic kila siku.",
    english: "This week your baby is forming key organs. Remember to take your folic acid tablets daily.",
  },
  {
    minWeek: 13,
    maxWeek: 27,
    swahili: "Mtoto wako sasa anasikia sauti yako. Hakikisha unahudhuria kliniki yako ya ANC iliyopangwa.",
    english: "Your baby can now hear your voice. Make sure to attend your scheduled ANC clinic visit.",
  },
  {
    minWeek: 28,
    maxWeek: 36,
    swahili: "Mtoto wako anaongezeka uzito haraka. Fuatilia uchezaji wake tumboni kila siku.",
    english: "Your baby is gaining weight quickly now. Keep track of their movements every day.",
  },
  {
    minWeek: 37,
    maxWeek: 42,
    swahili: "Uko karibu kujifungua! Hakikisha unajua njia ya kufika kliniki yako haraka wakati wowote.",
    english: "You're close to delivery! Make sure you know how to reach your clinic quickly at any time.",
  },
];

const CHALLENGE_PROMPT = {
  swahili: "Je, umepata changamoto yoyote wiki hii — maumivu, damu, uvimbe, au mtoto kupungua kucheza? Tujibu ujumbe huu ukiwa na tatizo.",
  english: "Did you have any challenges this week — pain, bleeding, swelling, or reduced baby movement? Reply to this message if so.",
};

export function getWeeklyMessage(gestationalWeeks: number, language: "SWAHILI" | "ENGLISH" = "SWAHILI"): string {
  const content =
    WEEKLY_CONTENT.find((c) => gestationalWeeks >= c.minWeek && gestationalWeeks <= c.maxWeek) ??
    WEEKLY_CONTENT[WEEKLY_CONTENT.length - 1];

  return language === "ENGLISH"
    ? `${content.english}\n\n${CHALLENGE_PROMPT.english}`
    : `${content.swahili}\n\n${CHALLENGE_PROMPT.swahili}`;
}

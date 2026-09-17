import { parseVoiceTranscription } from "@/lib/voice/ai-agent";
import { evaluateClinicalRisk, TriageInput, TriageResult } from "@/lib/clinical/risk-scorer";

export interface SymptomExtractionResult {
  symptoms: TriageInput;
  triage: TriageResult;
  extractedKeywords: string[];
  method: "CLAUDE" | "KEYWORD_MATCH";
}

const SYSTEM_PROMPT = `You are a clinical symptom extractor for a maternal health check-in call transcript.
Read the mother's transcript (Swahili or English) and return ONLY a JSON object with these boolean fields:
hasSevereHeadache, hasBlurredVision, hasSevereSwelling, hasVaginalBleeding, hasHighFever, hasReducedFetalMovement, hasSevereAbdominalPain.
Also include "extractedKeywords": a short array of the specific danger signs you found, in English.
Return nothing except the JSON object.`;

/**
 * Extracts structured danger-sign flags from a raw call/WhatsApp transcript.
 * Uses Claude for real natural-language understanding when a key is
 * configured; otherwise falls back to substring keyword matching so the
 * system still works with zero paid dependencies.
 */
export async function extractSymptomsFromTranscript(
  transcript: string,
  language: "SWAHILI" | "ENGLISH" = "SWAHILI"
): Promise<SymptomExtractionResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (apiKey && apiKey.startsWith("sk-ant-")) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 300,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: transcript }],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.content?.[0]?.text ?? "";
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          const symptoms: TriageInput = {
            hasSevereHeadache: Boolean(parsed.hasSevereHeadache),
            hasBlurredVision: Boolean(parsed.hasBlurredVision),
            hasSevereSwelling: Boolean(parsed.hasSevereSwelling),
            hasVaginalBleeding: Boolean(parsed.hasVaginalBleeding),
            hasHighFever: Boolean(parsed.hasHighFever),
            hasReducedFetalMovement: Boolean(parsed.hasReducedFetalMovement),
            hasSevereAbdominalPain: Boolean(parsed.hasSevereAbdominalPain),
          };
          return {
            symptoms,
            triage: evaluateClinicalRisk(symptoms),
            extractedKeywords: Array.isArray(parsed.extractedKeywords) ? parsed.extractedKeywords : [],
            method: "CLAUDE",
          };
        }
      } else {
        console.warn("Claude symptom extraction failed, falling back to keyword match", await res.text());
      }
    } catch (err) {
      console.warn("Claude symptom extraction error, falling back to keyword match", err);
    }
  }

  const fallback = parseVoiceTranscription(transcript, language);
  return { ...fallback, method: "KEYWORD_MATCH" };
}

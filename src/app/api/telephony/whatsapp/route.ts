import { NextRequest, NextResponse } from 'next/server';
import { evaluateClinicalRisk } from '@/lib/clinical/risk-scorer';
import { parseVoiceTranscription } from '@/lib/voice/ai-agent';

export const dynamic = 'force-dynamic';

/**
 * WhatsApp Business Webhook (Twilio / Meta Cloud API)
 * Handles incoming WhatsApp messages from expectant mothers
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let incomingBody = '';
    let fromNumber = '';
    let senderProfileName = 'Mama';

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      incomingBody = formData.get('Body')?.toString() || '';
      fromNumber = formData.get('From')?.toString() || '';
      senderProfileName = formData.get('ProfileName')?.toString() || 'Mama';
    } else {
      const json = await request.json();
      incomingBody = json?.body || json?.message?.text || '';
      fromNumber = json?.from || '';
      senderProfileName = json?.profileName || 'Mama';
    }

    const text = incomingBody.trim().toLowerCase();

    // Swahili NLP Keyword extraction
    const parsed = parseVoiceTranscription(text);
    const clinicalEvaluation = evaluateClinicalRisk({
      hasSevereHeadache: parsed.symptoms.hasSevereHeadache || text.includes('kichwa') || text.includes('headache'),
      hasBlurredVision: parsed.symptoms.hasBlurredVision || text.includes('ukungu') || text.includes('macho') || text.includes('vision'),
      hasSevereSwelling: parsed.symptoms.hasSevereSwelling || text.includes('uvimbe') || text.includes('miguu') || text.includes('swelling'),
      hasVaginalBleeding: parsed.symptoms.hasVaginalBleeding || text.includes('damu') || text.includes('bleed'),
      hasReducedFetalMovement: parsed.symptoms.hasReducedFetalMovement || text.includes('hachezi') || text.includes('movement'),
      hasHighFever: parsed.symptoms.hasHighFever || text.includes('homa') || text.includes('fever'),
      hasSevereAbdominalPain: parsed.symptoms.hasSevereAbdominalPain || text.includes('tumbo') || text.includes('pain'),
    });

    let replyMessage = '';

    if (clinicalEvaluation.riskLevel === 'CRITICAL_EMERGENCY') {
      replyMessage = `🚨 *ONYO LA DHARURA (SEQOY HEALTH)* 🚨\n\n` +
        `Habari ${senderProfileName}, dalili ulizotaja zinaonyesha dharura inayohitaji kuonwa na daktari mara moja.\n\n` +
        `🏥 *Hatua za Haraka:*\n` +
        `1. Nenda kwenye kituo chako cha afya (Kliniki ya Wazazi) mara moja.\n` +
        `2. Tumearifu mkunga aliye kazini kujiandaa.\n` +
        `3. Kama unahitaji gari la wagonjwa (Ambulance), piga simu sasa hivi kupitia nambari hii: *0711000202*.\n\n` +
        `_Tuko pamoja nawe kwa usalama wako na mtoto._`;
    } else if (text === '1' || text === 'sawa' || text === 'salama' || text.includes('vizuri')) {
      replyMessage = `🌸 *SEQOY CLINIC - RIPOTI IMENAKILIWA* 🌸\n\n` +
        `Asante sana ${senderProfileName}! Tumerekodi kuwa wewe na mtoto mko salama na afya nzuri.\n\n` +
        `📅 *Kliniki Yako Ijayo:* Tarehe 15/09/2026\n` +
        `💧 *Kikumbusho cha Wiki:* Kumbuka kunywa maji ya kutosha na kumeza vidonge vya IFAS (Madini ya Chuma na Asidi ya Folic).\n\n` +
        `Ukiwa na swali au dalili yoyote kabla ya Jumamosi ijayo, tuandikie hapa au piga *384#.`;
    } else {
      replyMessage = `🌸 *HABARI YA LEO ${senderProfileName.toUpperCase()}* 🌸\n\n` +
        `Karibu kwenye ukaguzi wa kila wiki wa Kliniki ya Wazazi (SEQOY).\n\n` +
        `Je, katika siku chache zilizopita umepata mojawapo ya dalili hizi?\n` +
        `1️⃣ Maumivu makali ya kichwa au kutoona vizuri\n` +
        `2️⃣ Uvimbe mkubwa usoni au miguuni\n` +
        `3️⃣ Kutoka damu au maji mengi\n` +
        `4️⃣ Mtoto kutocheza vizuri tumboni\n\n` +
        `👉 *Jibu kwa:* \n` +
        `• Tuma *"SALAMA"* kama huna dalili yoyote.\n` +
        `• Au eleza kwa sauti/ujumbe dalili unayohisi ili tukusaidie mara moja.`;
    }

    return NextResponse.json({
      success: true,
      sender: fromNumber,
      parsedSymptoms: parsed.symptoms,
      riskLevel: clinicalEvaluation.riskLevel,
      replyMessage: replyMessage,
    });
  } catch (error: any) {
    console.error('Error handling WhatsApp webhook:', error);
    return NextResponse.json({ error: 'Internal webhook error' }, { status: 500 });
  }
}

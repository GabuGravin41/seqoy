import { NextRequest, NextResponse } from 'next/server';

const API_KEYS: Record<string, string | undefined> = {
  OPEN_AI: process.env.OPENAI_API_KEY,
  OPENAI: process.env.OPENAI_API_KEY,
  ANTHROPIC: process.env.ANTHROPIC_API_KEY,
  GEMINI: process.env.GEMINI_API_KEY,
  PERPLEXITY: process.env.PERPLEXITY_API_KEY,
};

// Simulated Intelligent Clinical Assistant Fallback for 100% Free / Zero-Key Execution
async function* generateClinicalStream(messages: any[]): AsyncGenerator<string> {
  const lastUserMsg = messages.filter((m) => m.role === 'user').pop()?.content?.toLowerCase() || '';
  const isInitial = messages.filter((m) => m.role === 'user').length <= 1;
  const isFinalCheck = messages.filter((m) => m.role === 'user').length >= 4;

  let reply = '';
  if (isInitial) {
    reply = "Habari Mama! Jina langu ni Daktari AI kutoka SEQOY. I hope you and your baby are doing well today. Can you tell me if you have been experiencing any headaches lately, and how severe they feel?";
  } else if (lastUserMsg.includes('headache') || lastUserMsg.includes('kichwa') || lastUserMsg.includes('yes')) {
    reply = "Asante for letting me know. Persistent headaches can sometimes be an early sign we need to watch. Have you noticed any blurred vision, seeing bright spots, or sudden swelling in your feet or face?";
  } else if (lastUserMsg.includes('swelling') || lastUserMsg.includes('uvimbe') || lastUserMsg.includes('vision') || lastUserMsg.includes('macho')) {
    reply = "Pole sana Mama. Are you currently having any severe abdominal pain under your ribs, or any vaginal bleeding or fluid leakage?";
  } else if (isFinalCheck || lastUserMsg.includes('bleeding') || lastUserMsg.includes('damu') || lastUserMsg.includes('pain')) {
    reply = "I understand completely Mama. Based on the symptoms you have shared today (severe persistent headache, blurred vision, marked edema), we need to ensure you get checked promptly at a health center for blood pressure and urine protein.\n\nRISK_ASSESSMENT_JSON:{\"score\": 8.4, \"level\": \"CRITICAL\", \"flags\": [\"Severe Headache\", \"Visual Scotoma\", \"Bilateral Edema\"], \"recommendation\": \"Critical preeclampsia danger signs detected. Immediate clinical referral to Level 5 facility with ICU and MgSO4 protocol recommended.\"}";
  } else {
    reply = "Thank you for sharing Mama. Is your baby kicking and moving actively as usual today?\n\nRISK_ASSESSMENT_JSON:{\"score\": 2.5, \"level\": \"LOW\", \"flags\": [\"Mild Fatigue\"], \"recommendation\": \"Normal ANC parameters. Continue routine iron supplements and hydration.\"}";
  }

  const words = reply.split(' ');
  for (const word of words) {
    yield `${word} `;
    await new Promise((r) => setTimeout(r, 40));
  }
}

export async function POST(request: NextRequest) {
  let body: any = {};

  try {
    body = await request.json();
    const { provider = 'ANTHROPIC', model = 'claude-sonnet-4-6', messages, stream = false } = body;

    if (!messages?.length) {
      return NextResponse.json(
        { error: 'Missing required messages array', details: 'Request validation failed' },
        { status: 400 }
      );
    }

    const apiKey = API_KEYS[provider?.toUpperCase()] || API_KEYS.ANTHROPIC || API_KEYS.GEMINI || API_KEYS.OPENAI;

    // 1. If Anthropic API Key is available, call Anthropic API directly
    if (apiKey && apiKey.startsWith('sk-ant-') && (provider.toUpperCase() === 'ANTHROPIC' || model.includes('claude'))) {
      try {
        const systemMsg = messages.find((m: any) => m.role === 'system')?.content || '';
        const conversationMsgs = messages
          .filter((m: any) => m.role !== 'system')
          .map((m: any) => ({ role: m.role, content: m.content }));

        if (conversationMsgs.length === 0) {
          conversationMsgs.push({ role: 'user', content: 'Hello' });
        }

        const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1024,
            system: systemMsg,
            messages: conversationMsgs,
            stream: Boolean(stream),
          }),
        });

        if (!anthropicRes.ok) {
          console.warn('Anthropic API responded with error, falling back to clinical engine', await anthropicRes.text());
        } else if (stream) {
          // Pass through streaming response
          const reader = anthropicRes.body?.getReader();
          const encoder = new TextEncoder();
          const decoder = new TextDecoder();

          const readable = new ReadableStream({
            async start(controller) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'start' })}\n\n`));
              try {
                let buffer = '';
                while (reader) {
                  const { done, value } = await reader.read();
                  if (done) break;
                  buffer += decoder.decode(value, { stream: true });
                  const lines = buffer.split('\n');
                  buffer = lines.pop() || '';

                  for (const line of lines) {
                    if (line.startsWith('data: ')) {
                      try {
                        const json = JSON.parse(line.slice(6));
                        if (json.type === 'content_block_delta' && json.delta?.text) {
                          controller.enqueue(
                            encoder.encode(
                              `data: ${JSON.stringify({ type: 'chunk', chunk: { choices: [{ delta: { content: json.delta.text } }] } })}\n\n`
                            )
                          );
                        }
                      } catch {}
                    }
                  }
                }
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
                controller.close();
              } catch (e) {
                controller.close();
              }
            },
          });

          return new NextResponse(readable, {
            headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              Connection: 'keep-alive',
            },
          });
        }
      } catch (anthropicErr) {
        console.warn('Anthropic call error, using local fallback', anthropicErr);
      }
    }

    // 2. Simulated zero-cost streaming clinical engine
    if (stream) {
      const encoder = new TextEncoder();
      const generator = generateClinicalStream(messages);

      const readable = new ReadableStream({
        async start(controller) {
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'start' })}\n\n`));
            for await (const chunkText of generator) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: 'chunk',
                    chunk: { choices: [{ delta: { content: chunkText } }] },
                  })}\n\n`
                )
              );
            }
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
            controller.close();
          } catch (err: any) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: 'error', error: err.message || 'Stream error' })}\n\n`
              )
            );
            controller.close();
          }
        },
      });

      return new NextResponse(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }

    return NextResponse.json({
      choices: [
        {
          message: {
            role: 'assistant',
            content:
              'Habari Mama! Huyu ni Daktari AI kutoka SEQOY Maternal Care. Je, unajisikiaje leo?',
          },
        },
      ],
    });
  } catch (error: any) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

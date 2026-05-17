import Anthropic from '@anthropic-ai/sdk';

const apiKey = process.env.ANTHROPIC_API_KEY || '';
const client = apiKey ? new Anthropic({ apiKey }) : null;

const FALLBACK = [
  "i'm a tiny local helper right now — set ANTHROPIC_API_KEY on the server to get real answers.",
  "no api key set, so just guessing: keep it short, ship one good thing today.",
  "(local fallback) two things to try: a shorter hook and warmer color.",
];

export async function aiReply({ userText, recent = [], persona = 'Claude (assistant)' }) {
  if (!client) return FALLBACK[Math.floor(Math.random() * FALLBACK.length)];

  const context = recent.slice(-12).map(m => `${m.from}: ${m.text}`).join('\n');
  const prompt = `You are an AI helper in a chat between two indie video creators (Shubhangam and Sanjeevani). They run a cinematic short-form studio called Reel Studio.

Reply in 1-2 short sentences. Casual lowercase. Warm, practical. No emojis. No exclamation marks. Sometimes propose a tiny concrete next step.

Recent thread:
${context}

User asked: ${userText}

Reply (just the message text, no name prefix):`;

  try {
    const res = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 160,
      messages: [{ role: 'user', content: prompt }],
    });
    const out = (res.content?.[0]?.text || '').trim().replace(/^[A-Za-z ]+:\s*/, '').replace(/^"|"$/g, '');
    return out.slice(0, 320) || FALLBACK[0];
  } catch (err) {
    console.error('[ai] error', err.message);
    return FALLBACK[Math.floor(Math.random() * FALLBACK.length)];
  }
}

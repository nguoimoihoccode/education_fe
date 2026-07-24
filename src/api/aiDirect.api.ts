import type { LocalAiSettings } from '@/store/aiProvider.store';

export interface DirectChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface DirectChatResult {
  content: string;
  model: string;
}

/**
 * Call an OpenAI-compatible /chat/completions endpoint directly from the browser.
 * Used for BYOK (Bring Your Own Key) mode.
 */
export async function directSendMessage(
  messages: DirectChatMessage[],
  settings: LocalAiSettings,
): Promise<DirectChatResult> {
  const url = `${settings.baseUrl.replace(/\/$/, '')}/chat/completions`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${settings.apiKey}`,
    },
    body: JSON.stringify({
      model: settings.model,
      messages,
      max_tokens: settings.maxTokens,
      temperature: settings.temperature,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(
      `AI request failed (${res.status}): ${text || res.statusText}`,
    );
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error('AI returned an empty response');
  }

  return { content, model: settings.model };
}

/**
 * Test a connection to the AI provider with a simple ping.
 * Returns latency in milliseconds.
 */
export async function directTestConnection(
  settings: LocalAiSettings,
): Promise<{ ok: boolean; latencyMs: number }> {
  const start = performance.now();

  const result = await directSendMessage(
    [
      { role: 'system', content: 'Reply with exactly: pong' },
      { role: 'user', content: 'ping' },
    ],
    settings,
  );

  const latencyMs = Math.round(performance.now() - start);

  if (!result.content.toLowerCase().includes('pong')) {
    throw new Error(`Unexpected response: ${result.content}`);
  }

  return { ok: true, latencyMs };
}

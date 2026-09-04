import { runChat } from '../../server/geminiCore.js';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'METHOD_NOT_ALLOWED' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'BAD_REQUEST', message: 'Invalid JSON body' }) };
  }

  const { history, language } = body;
  if (!history || !Array.isArray(history)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'BAD_REQUEST', message: 'Invalid history payload' }) };
  }

  // Netlify header keys arrive lowercased.
  const dynamicApiKey = event.headers['x-api-key'] || process.env.GEMINI_API_KEY;

  try {
    // Netlify's free-tier synchronous functions are killed at 10s, so we use
    // a shorter, tighter retry budget here than a normal Node server would.
    const result = await runChat({
      apiKey: dynamicApiKey,
      history,
      language,
      maxRetries: 1,
      perAttemptTimeoutMs: 8000,
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
    };
  } catch (error) {
    return {
      statusCode: error.status || 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.code || 'SERVER_ERROR', message: error.message }),
    };
  }
};

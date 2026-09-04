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

  const headers = event.headers || {};
  const dynamicApiKey = headers['x-api-key'] || headers['X-API-Key'] || process.env.GEMINI_API_KEY;

  try {
    // One bounded attempt keeps the whole request safely inside Netlify's
    // synchronous function window. The core timeout is 7.5s.
    const result = await runChat({
      apiKey: dynamicApiKey,
      history,
      language,
      maxRetries: 0,
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
      body: JSON.stringify({
        error: error.code || 'SERVER_ERROR',
        message: error.message || 'Gemini request failed',
      }),
    };
  }
};

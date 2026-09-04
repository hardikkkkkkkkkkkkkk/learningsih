import { runChat } from '../../server/geminiCore.js';

export async function onRequestPost(context) {
  let body;
  try {
    body = await context.request.json();
  } catch {
    return Response.json({ error: 'BAD_REQUEST', message: 'Invalid JSON body' }, { status: 400 });
  }

  const { history, language } = body || {};
  if (!history || !Array.isArray(history)) {
    return Response.json({ error: 'BAD_REQUEST', message: 'Invalid history payload' }, { status: 400 });
  }

  const dynamicApiKey = context.request.headers.get('x-api-key') || context.env.GEMINI_API_KEY;

  try {
    const result = await runChat({
      apiKey: dynamicApiKey,
      history,
      language,
    });

    return Response.json(result, { status: 200 });
  } catch (error) {
    return Response.json(
      {
        error: error.code || 'SERVER_ERROR',
        message: error.message || 'Gemini request failed',
      },
      { status: error.status || 500 }
    );
  }
}

export async function onRequest(context) {
  if (context.request.method !== 'POST') {
    return Response.json({ error: 'METHOD_NOT_ALLOWED' }, { status: 405 });
  }
  return onRequestPost(context);
}

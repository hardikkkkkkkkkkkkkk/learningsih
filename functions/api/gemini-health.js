import { checkHealth } from '../../server/geminiCore.js';

export async function onRequestGet(context) {
  const apiKey = context.request.headers.get('x-api-key') || context.env.GEMINI_API_KEY;

  try {
    const result = await checkHealth(apiKey);
    return Response.json(result, { status: 200 });
  } catch (error) {
    return Response.json(
      {
        geminiConfigured: !!apiKey,
        connection: 'error',
        errorCode: error.code || 'SERVER_ERROR',
        errorMessage: error.message || 'Unknown Gemini error',
      },
      { status: 200 }
    );
  }
}

export async function onRequest(context) {
  if (context.request.method !== 'GET') {
    return Response.json({ error: 'METHOD_NOT_ALLOWED' }, { status: 405 });
  }
  return onRequestGet(context);
}

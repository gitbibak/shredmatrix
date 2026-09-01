import { buildMealPrompt, normalizeMealAnalysis } from './mealAnalysis.js';

const MAX_BODY_BYTES = 4 * 1024 * 1024;
const MAX_IMAGE_CHARS = 3.6 * 1024 * 1024;
const ALLOWED_IMAGE = /^data:image\/(?:jpeg|png|webp);base64,/i;

const json = (body, status = 200) => Response.json(body, {
  status,
  headers: {
    'cache-control': 'no-store',
    'content-type': 'application/json; charset=utf-8',
    'x-content-type-options': 'nosniff',
  },
});

function isAllowedOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try {
    const host = new URL(origin).hostname;
    return host === 'fullbalance.app' || host === 'www.fullbalance.app' || host === 'localhost' || host === '127.0.0.1';
  } catch {
    return false;
  }
}

async function analyzeMeal(request, env) {
  if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  if (!isAllowedOrigin(request)) return json({ error: 'forbidden_origin' }, 403);

  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > MAX_BODY_BYTES) return json({ error: 'image_too_large' }, 413);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid_request' }, 400);
  }

  const image = typeof body.image === 'string' ? body.image : '';
  const language = ['tr', 'en', 'es'].includes(body.language) ? body.language : 'en';
  if (!ALLOWED_IMAGE.test(image) || image.length > MAX_IMAGE_CHARS) {
    return json({ error: 'invalid_image' }, 400);
  }

  try {
    const result = await env.AI.run('@cf/moondream/moondream3.1-9B-A2B', {
      task: 'query',
      image,
      question: buildMealPrompt(language),
      reasoning: false,
      stream: false,
      temperature: 0.1,
      max_tokens: 1400,
    });
    const modelOutput = result?.result?.answer
      ?? result?.result?.response
      ?? result?.result
      ?? result?.answer
      ?? result?.response
      ?? result;
    return json(normalizeMealAnalysis(modelOutput));
  } catch (error) {
    console.error('meal_analysis_failed', error instanceof Error ? error.message : 'unknown');
    return json({ error: 'analysis_unavailable' }, 503);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/analyze-meal') return analyzeMeal(request, env);
    return env.ASSETS.fetch(request);
  },
};

import { MEAL_JSON_SCHEMA, buildMealPrompt, normalizeMealAnalysis, sanitizeVocabulary } from './mealAnalysis.js';

const MAX_BODY_BYTES = 4 * 1024 * 1024;
const MAX_IMAGE_CHARS = 3.6 * 1024 * 1024;
const ALLOWED_IMAGE = /^data:image\/(?:jpeg|png|webp);base64,/i;

// Default stays on the model that is verified in production. Override with the
// MEAL_MODEL variable (wrangler.toml [vars]) to switch to a stronger vision model
// such as @cf/meta/llama-3.2-11b-vision-instruct without a code change.
export const DEFAULT_MEAL_MODEL = '@cf/moondream/moondream3.1-9B-A2B';

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

function clientKey(request) {
  return request.headers.get('cf-connecting-ip')
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || 'anonymous';
}

function pickModelText(result) {
  return result?.result?.answer
    ?? result?.result?.response
    ?? result?.response
    ?? result?.answer
    ?? result?.result
    ?? result;
}

export async function runVisionModel(env, { image, prompt, model }) {
  if (model.includes('moondream')) {
    const result = await env.AI.run(model, {
      task: 'query',
      image,
      question: prompt,
      reasoning: false,
      stream: false,
      temperature: 0.1,
      max_tokens: 1400,
    });
    return pickModelText(result);
  }

  const input = {
    messages: [
      { role: 'system', content: 'You analyze meal photos and answer only with valid JSON.' },
      { role: 'user', content: prompt },
    ],
    image,
    temperature: 0.1,
    max_tokens: 1400,
    stream: false,
  };
  // JSON mode is only documented for the Llama 3.2 vision model family.
  if (model.includes('llama-3.2-11b-vision')) {
    input.response_format = { type: 'json_schema', json_schema: MEAL_JSON_SCHEMA };
  }
  const result = await env.AI.run(model, input);
  return pickModelText(result);
}

async function analyzeMeal(request, env) {
  if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  if (!isAllowedOrigin(request)) return json({ error: 'forbidden_origin' }, 403);

  if (env.MEAL_RATE_LIMIT?.limit) {
    try {
      const { success } = await env.MEAL_RATE_LIMIT.limit({ key: clientKey(request) });
      if (!success) return json({ error: 'rate_limited' }, 429);
    } catch (error) {
      console.warn('rate_limit_unavailable', error instanceof Error ? error.message : 'unknown');
    }
  }

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
  const vocabulary = sanitizeVocabulary(body.vocabulary);
  const model = typeof env.MEAL_MODEL === 'string' && env.MEAL_MODEL.startsWith('@cf/') ? env.MEAL_MODEL : DEFAULT_MEAL_MODEL;

  try {
    const modelOutput = await runVisionModel(env, { image, prompt: buildMealPrompt(language, vocabulary), model });
    const analysis = normalizeMealAnalysis(modelOutput);
    return json({ ...analysis, model });
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

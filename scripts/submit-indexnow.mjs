import { pathToFileURL } from 'node:url';
import { BASE_URL, publicPages } from './seo-routes.mjs';

export const INDEXNOW_KEY = '5c886c9d31ab4f2f857e793e65551487';

export function createIndexNowPayload() {
  return {
    host: new URL(BASE_URL).hostname,
    key: INDEXNOW_KEY,
    keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: publicPages.map(([path]) => `${BASE_URL}${path}`),
  };
}

export async function submitIndexNow(fetcher = fetch) {
  const payload = createIndexNowPayload();
  const response = await fetcher('https://api.indexnow.org/IndexNow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  });

  if (![200, 202].includes(response.status)) {
    const detail = await response.text().catch(() => '');
    throw new Error(`IndexNow rejected the submission (${response.status})${detail ? `: ${detail}` : ''}`);
  }

  return { status: response.status, submitted: payload.urlList.length };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const result = await submitIndexNow();
  console.log(`IndexNow accepted ${result.submitted} URLs (HTTP ${result.status}).`);
}

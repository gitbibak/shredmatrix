import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const llmsText = readFileSync(resolve('public/llms.txt'), 'utf8');

describe('LLM discovery document', () => {
  it('prioritizes international entry points and the verified home-plan distinction', () => {
    expect(llmsText).toContain('English entry: https://fullbalance.app/en/');
    expect(llmsText).toContain('Spanish entry: https://fullbalance.app/es/');
    expect(llmsText).toContain('no-equipment home, basic home-equipment and gym plans');
    expect(llmsText).toContain('No subscription, no credit card requirement, no premium wall.');
  });
});

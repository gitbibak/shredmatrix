import { beforeEach, describe, expect, it } from 'vitest';
import { RATING_MILESTONES, canAsk, hasSeen, markSeen, recordAsk, recordRating, rememberAccountCreated, supportPaused } from './engagementAsks';

const DAY = 86400000;
const NOW = Date.parse('2026-11-06T12:00:00Z');
const user = (createdDaysAgo) => {
  rememberAccountCreated('u1', new Date(NOW - createdDaysAgo * DAY).toISOString());
  return { userId: 'u1', now: NOW };
};

describe('engagement ask rules', () => {
  beforeEach(() => { localStorage.clear(); sessionStorage.clear(); });

  it('waits three days before the first support ask', () => {
    expect(canAsk('support', user(1))).toBe(false);
    expect(canAsk('support', user(4))).toBe(true);
  });

  it('lets a happy reviewer see support even on a new account', () => {
    expect(canAsk('support', { ...user(0), ignoreAccountAge: true })).toBe(true);
  });

  it('keeps a 14-day cooldown between support asks across sessions', () => {
    const ctx = user(30);
    recordAsk('support', ctx);
    sessionStorage.clear();
    expect(canAsk('support', { ...ctx, now: NOW + 13 * DAY })).toBe(false);
    expect(canAsk('support', { ...ctx, now: NOW + 15 * DAY })).toBe(true);
  });

  it('shows only one kind of ask per session', () => {
    const ctx = user(30);
    recordAsk('founder_note', ctx);
    expect(canAsk('support', ctx)).toBe(false);
    expect(canAsk('idea', ctx)).toBe(false);
    expect(canAsk('founder_note', ctx)).toBe(true);
  });

  it('pauses support for 30 days after a 1-3 star rating, not after 4-5', () => {
    const ctx = user(30);
    recordRating(5, ctx);
    expect(supportPaused(ctx)).toBe(false);
    recordRating(2, ctx);
    expect(supportPaused(ctx)).toBe(true);
    expect(canAsk('support', { ...ctx, ignoreAccountAge: true })).toBe(false);
    expect(canAsk('support', { ...ctx, now: NOW + 31 * DAY })).toBe(true);
  });

  it('asks nothing without a member or a known account age', () => {
    expect(canAsk('support', { now: NOW })).toBe(false);
    expect(canAsk('support', { userId: 'u2', now: NOW })).toBe(false);
  });

  it('remembers seen notes per member', () => {
    const ctx = user(5);
    expect(hasSeen('note:2026-11', ctx)).toBe(false);
    markSeen('note:2026-11', ctx);
    expect(hasSeen('note:2026-11', ctx)).toBe(true);
    expect(hasSeen('note:2026-11', { userId: 'u3' })).toBe(false);
  });

  it('opens the rating moment right after the first workout', () => {
    expect(RATING_MILESTONES[0]).toBe(1);
  });
});

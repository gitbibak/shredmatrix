import type { GrowthEventMap, GrowthEventName, GrowthEventProperties } from './analyticsTypes';

type EventArguments<T extends GrowthEventName> =
  {} extends GrowthEventProperties<T>
    ? [properties?: GrowthEventProperties<T>]
    : [properties: GrowthEventProperties<T>];

export function trackEvent<T extends GrowthEventName>(eventName: T, ...args: EventArguments<T>): void;
export function identifyUser(userId: string, language?: string): void;
export function clearAnalyticsIdentity(): void;
export function flushAnalyticsQueue(): Promise<boolean>;
export function initAnalytics(language?: string): void;
export function setAnalyticsDebug(enabled: boolean): void;
export function getAnonymousId(): string;
export function trackPendingAuthCompletion(): void;
export type { GrowthEventMap, GrowthEventName, GrowthEventProperties };

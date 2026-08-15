import { describe, expect, it } from 'vitest';
import { summarizeInternationalAcquisition } from './adminService';

describe('international acquisition summary', () => {
  it('measures recent English and Spanish activation without counting Turkish users', () => {
    const profiles = [
      { id: 'en-active', created_at: '2026-08-15T10:00:00Z', app_language: 'en', acquisition_source: 'direct' },
      { id: 'es-active', created_at: '2026-08-14T10:00:00Z', app_language: 'es', acquisition_source: 'member_referral' },
      { id: 'en-old', created_at: '2026-06-01T10:00:00Z', app_language: 'en', acquisition_source: 'google' },
      { id: 'tr-active', created_at: '2026-08-15T10:00:00Z', app_language: 'tr', acquisition_source: 'google' },
    ];

    expect(summarizeInternationalAcquisition(
      profiles,
      ['en-active', 'es-active', 'tr-active'],
      new Date('2026-08-16T12:00:00Z'),
    )).toEqual({
      registrations: 2,
      activated: 2,
      activationRate: 100,
      english: 1,
      spanish: 1,
      attributed: 1,
      direct: 1,
    });
  });
});

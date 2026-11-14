import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PushPermission from './PushPermission';
import * as push from '../lib/pushService';
import { trackEvent } from '../lib/analytics';

vi.mock('../i18n/LanguageContext', () => ({ useTranslation: () => ({ lang: 'en', t: (key) => key }) }));
vi.mock('../lib/dataService', () => ({ getWorkoutLogs: vi.fn(() => Promise.resolve([])) }));
vi.mock('../lib/analytics', () => ({ trackEvent: vi.fn() }));
vi.mock('../lib/pushService', () => ({
  dismissPushPrompt: vi.fn(),
  getPermissionStatus: vi.fn(() => 'default'),
  isPushSupported: vi.fn(() => true),
  needsHomeScreenForPush: vi.fn(() => false),
  subscribeToPush: vi.fn(() => Promise.resolve({ success: true })),
  wasRecentlyDismissed: vi.fn(() => false),
}));

describe('reminder opt-in', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    push.isPushSupported.mockReturnValue(true);
    push.needsHomeScreenForPush.mockReturnValue(false);
    push.getPermissionStatus.mockReturnValue('default');
    push.wasRecentlyDismissed.mockReturnValue(false);
  });

  it('asks right after a workout, even for a brand-new member', async () => {
    render(<PushPermission placement="workout_complete" />);
    expect(await screen.findByText('push.workoutTitle')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'push.workoutAllow' }));
    expect(await screen.findByText('push.enabled')).toBeInTheDocument();
    expect(trackEvent).toHaveBeenCalledWith('reminder_prompt_view', { language: 'en', trigger: 'workout_complete', placement: 'workout_complete' });
  });

  it('waits on Today for a new member with no workouts', async () => {
    const { container } = render(<PushPermission daysSinceJoin={0} />);
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(container).toBeEmptyDOMElement();
  });

  it('explains Add to Home Screen on iPhone Safari instead of asking', async () => {
    push.isPushSupported.mockReturnValue(false);
    push.needsHomeScreenForPush.mockReturnValue(true);
    render(<PushPermission placement="workout_complete" />);
    expect(await screen.findByText('push.iosTitle')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'push.iosOk' }));
    expect(push.dismissPushPrompt).toHaveBeenCalled();
  });

  it('stays hidden when reminders were turned down recently or are already on', async () => {
    push.wasRecentlyDismissed.mockReturnValue(true);
    const first = render(<PushPermission placement="workout_complete" />);
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(first.container).toBeEmptyDOMElement();
    first.unmount();
    push.wasRecentlyDismissed.mockReturnValue(false);
    push.getPermissionStatus.mockReturnValue('granted');
    const second = render(<PushPermission placement="workout_complete" />);
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(second.container).toBeEmptyDOMElement();
  });
});

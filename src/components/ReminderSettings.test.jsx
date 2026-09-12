import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ReminderSettings from './ReminderSettings';
import { loadReminderPreferences, saveReminderPreferences } from '../lib/reminderPreferences';
import { normalizeReminders } from '../../supabase/functions/send-push/reminderSchedule';
vi.mock('../i18n/LanguageContext', () => ({ useTranslation: () => ({ lang: 'en' }) }));
vi.mock('../lib/reminderPreferences', () => ({ loadReminderPreferences: vi.fn(), saveReminderPreferences: vi.fn() }));
vi.mock('../lib/pushService', () => ({ getPermissionStatus: () => 'granted', subscribeToPush: vi.fn() }));
describe('reminder settings', () => {
  beforeEach(() => { vi.clearAllMocks(); loadReminderPreferences.mockResolvedValue({ subscribed: true, settings: normalizeReminders(null, 18) }); });
  it('loads only when opened and saves exact minutes and water opt-in', async () => {
    saveReminderPreferences.mockImplementation(async s => s);
    render(<ReminderSettings />); expect(loadReminderPreferences).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText('Reminders'));
    fireEvent.change(await screen.findByLabelText('Workout Time 1'), { target: { value: '20:35' } });
    fireEvent.click(screen.getByLabelText('Water breaks'));
    fireEvent.click(screen.getByText('Save'));
    await waitFor(() => expect(saveReminderPreferences).toHaveBeenCalledWith(expect.objectContaining({ workout: expect.objectContaining({ time: '20:35' }), water: expect.objectContaining({ enabled: true }) }), 'en'));
    expect(await screen.findByText('Reminders saved.')).toBeInTheDocument();
  });
  it('preserves edits when saving fails', async () => {
    saveReminderPreferences.mockRejectedValue(new Error('offline'));
    render(<ReminderSettings />); fireEvent.click(screen.getByText('Reminders'));
    fireEvent.change(await screen.findByLabelText('Workout Time 1'), { target: { value: '21:10' } });
    fireEvent.click(screen.getByText('Save'));
    expect(await screen.findByText(/Could not save/)).toBeInTheDocument();
    expect(screen.getByLabelText('Workout Time 1')).toHaveValue('21:10');
  });
});

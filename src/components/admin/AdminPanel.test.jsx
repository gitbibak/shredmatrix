import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const api = vi.hoisted(() => Object.fromEntries([
  'verifyAdminAccess', 'getAdminSnapshot', 'getSupportTickets', 'getSupportStats', 'updateSupportTicket',
  'getContentReviews', 'updateContentReview', 'getAdminTestimonials', 'updateTestimonialStatus', 'deleteUser', 'getMemberDetail',
].map((name) => [name, vi.fn()])));
vi.mock('../../lib/adminService', () => api);
vi.mock('recharts', () => Object.fromEntries([
  'ComposedChart', 'Bar', 'Line', 'XAxis', 'YAxis', 'CartesianGrid', 'Tooltip', 'Legend', 'ResponsiveContainer',
].map((name) => [name, () => null])));
import AdminPanel from './AdminPanel';

const at = (day) => `${day}T10:00:00.000Z`;
const member = (id, name, day, extra = {}) => ({ id, name, email: `${id}@example.test`, role: 'user', created_at: at(day), ...extra });
const snapshot = {
  now: '2026-10-18T09:00:00.000Z',
  profiles: [
    { id: 'admin', name: 'Test Admin', email: 'admin@example.test', role: 'admin', created_at: at('2026-06-01') },
    member('ayse', 'Ayşe Planlı', '2026-10-17', { app_language: 'tr', acquisition_source: 'chatgpt.com' }),
    member('mert', 'Mert Plansız', '2026-10-17', { app_language: 'en', acquisition_source: 'google' }),
    member('eski', 'Eski Plansız', '2026-09-01', { app_language: 'tr' }),
  ],
  plans: [{ user_id: 'ayse', goal: 'muscle', experience: 'beginner', environment: 'gym', gender: 'female', age: '34', height: '168', weight: '64.5', calories: '1950' }],
  activity: [{ user_id: 'ayse', activity_date: '2026-10-17' }],
  workouts: [{ user_id: 'ayse', date: '2026-10-17' }],
  memberActivity: [{ user_id: 'ayse', total_workouts: 3, recent_workouts: 1, last_workout: '2026-10-17' }],
  insightsAvailable: true,
  events: [],
};
const memberDetail = {
  plan: { macros: { protein: 120, carbs: 210, fat: 60 }, focusAreas: ['core'] },
  activity: {
    workouts: [{ date: '2026-10-17', day_focus: 'Tam Vücut A', exercises: [{ name: 'Goblet Squat', weight: 16, sets: [{ weight: 16, reps: 10, completed: true }, { weight: 16, reps: 9, completed: false }] }], session_duration_minutes: 34, perceived_exertion: 2, pain_reported: false }],
    weights: [], measurements: [], water: [], sleep: [],
  },
  tickets: [],
};
const ticket = { id: 'ticket', subject: 'Test destek', message: 'Yardıma ihtiyacım var', status: 'open', category: 'support', priority: 'high', page_url: 'javascript:alert(1)' };

function open(tab = 'today') {
  return render(<MemoryRouter initialEntries={[`/admin?tab=${tab}`]}><AdminPanel user={{ id: 'admin', name: 'Test Admin' }} /></MemoryRouter>);
}
function deferred() { let resolve; let reject; const promise = new Promise((done, fail) => { resolve = done; reject = fail; }); return { promise, resolve, reject }; }

beforeEach(() => {
  vi.resetAllMocks();
  api.verifyAdminAccess.mockResolvedValue(true);
  api.getAdminSnapshot.mockResolvedValue(snapshot);
  api.getSupportTickets.mockResolvedValue([ticket]);
  api.getSupportStats.mockResolvedValue({ open: 1, reviewing: 0, resolved: 0, total: 1 });
  api.getContentReviews.mockResolvedValue([]);
  api.getAdminTestimonials.mockResolvedValue([]);
  api.getMemberDetail.mockResolvedValue(memberDetail);
});
afterEach(cleanup);

describe('admin panel', () => {
  it('opens on the member list by default', async () => {
    render(<MemoryRouter initialEntries={['/admin']}><AdminPanel user={{ id: 'admin', name: 'Test Admin' }} /></MemoryRouter>);
    expect(await screen.findByRole('heading', { level: 1, name: 'Kullanıcılar' })).toBeInTheDocument();
    expect((await screen.findAllByText('Ayşe Planlı')).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /Antrenman yapan 1/ })).toBeInTheDocument();
  });

  it('opens on a daily summary computed from the snapshot', async () => {
    open('overview');
    expect(await screen.findByText(/Dün 2 kayıt geldi; 1 kişi plan kurdu\./)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Özet' })).toBeInTheDocument();
    expect(screen.getByText(/1 açık destek talebi bekliyor\./)).toBeInTheDocument();
  });

  it('maps old tab links to the new sections', async () => {
    open('dashboard');
    expect(await screen.findByRole('heading', { level: 1, name: 'Özet' })).toBeInTheDocument();
    cleanup();
    open('quality');
    expect(await screen.findByRole('heading', { level: 1, name: 'Destek' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Yorumlar ve incelemeler/ })).toHaveAttribute('aria-pressed', 'true');
  });

  it('keeps support data and reports the failure when the snapshot fails', async () => {
    api.getAdminSnapshot.mockRejectedValue(new Error('offline'));
    open();
    expect(await screen.findByRole('alert')).toHaveTextContent('Özet verileri alınamadı');
    expect(await screen.findByLabelText('1 bekleyen')).toBeInTheDocument();
  });

  it('does not mislabel a loading or failed user list as empty', async () => {
    const pending = deferred();
    api.getAdminSnapshot.mockReturnValue(pending.promise);
    open('users');
    await screen.findByText('Üyeler yükleniyor…');
    expect(screen.queryByText('Henüz kullanıcı yok')).not.toBeInTheDocument();
    await act(async () => pending.reject(new Error('offline')));
    expect(await screen.findByRole('alert')).toHaveTextContent('Özet verileri');
    expect(screen.queryByText('Henüz kullanıcı yok')).not.toBeInTheDocument();
  });

  it('opens the filtered member list from the attention items', async () => {
    open('overview');
    fireEvent.click(await screen.findByRole('button', { name: /Son 7 günde plan kurmayan yeni üye/ }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Kullanıcılar' })).toBeInTheDocument();
    expect(screen.getAllByText('Mert Plansız').length).toBeGreaterThan(0);
    expect(screen.queryByText('Ayşe Planlı')).not.toBeInTheDocument();
    expect(screen.queryByText('Eski Plansız')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Admin', { selector: 'button' })).not.toBeInTheDocument();
  });

  it('searches members instantly on the client', async () => {
    open('users');
    await screen.findAllByText('Ayşe Planlı');
    fireEvent.change(screen.getByRole('searchbox', { name: 'Kullanıcı ara' }), { target: { value: 'mert' } });
    expect(screen.getAllByText('Mert Plansız').length).toBeGreaterThan(0);
    expect(screen.queryByText('Ayşe Planlı')).not.toBeInTheDocument();
  });

  it('shows member details and requires explicit text before a delete request', async () => {
    open('users');
    fireEvent.click((await screen.findAllByRole('button', { name: 'Ayşe Planlı detaylarını aç' }))[0]);
    const details = screen.getByRole('complementary', { name: 'Ayşe Planlı' });
    expect(within(details).getByText('168 cm')).toBeInTheDocument();
    expect(within(details).getByText('64.5 kg')).toBeInTheDocument();
    expect(await within(details).findByText('P 120 g · K 210 g · Y 60 g')).toBeInTheDocument();
    expect(await within(details).findByText('Tam Vücut A')).toBeInTheDocument();
    expect(within(details).getByText('1/2 set')).toBeInTheDocument();
    expect(within(details).getByText(/Goblet Squat 16 kg/)).toBeInTheDocument();
    expect(api.getMemberDetail).toHaveBeenCalledWith('ayse');
    fireEvent.click(within(details).getByRole('button', { name: /Hesabı kalıcı sil/ }));
    expect(screen.getByRole('dialog', { name: 'Hesabı kalıcı olarak sil' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Kalıcı olarak sil' })).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Onaylamak için SİL yazın'), { target: { value: 'SİL' } });
    expect(screen.getByRole('button', { name: 'Kalıcı olarak sil' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Vazgeç' }));
    expect(api.deleteUser).not.toHaveBeenCalled();
  });

  it('moves between members in the list order and closes with Escape', async () => {
    open('users');
    fireEvent.click((await screen.findAllByRole('button', { name: 'Ayşe Planlı detaylarını aç' }))[0]);
    const first = screen.getByRole('complementary', { name: 'Ayşe Planlı' });
    fireEvent.click(within(first).getByRole('button', { name: 'Sonraki üye' }));
    expect(await screen.findByRole('complementary', { name: 'Mert Plansız' })).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'ArrowUp' });
    expect(await screen.findByRole('complementary', { name: 'Ayşe Planlı' })).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('complementary', { name: 'Ayşe Planlı' })).not.toBeInTheDocument());
  });

  it('keeps unsaved review notes when refreshing all sections', async () => {
    api.getContentReviews.mockResolvedValue([{ id: 'review', content_area: 'pilates', review_status: 'pending', notes: 'Sunucudaki not' }]);
    open('content');
    const notes = await screen.findByRole('textbox', { name: 'İnceleme notu: Pilates' });
    fireEvent.change(notes, { target: { value: 'Yeni taslağım' } });
    fireEvent.click(screen.getByRole('button', { name: 'Yenile' }));
    await screen.findByText('Tüm bölümler yenilendi. Kaydedilmemiş taslaklar korundu.');
    expect(notes).toHaveValue('Yeni taslağım');
  });

  it('preserves a reply across support filters and hides unsafe source links', async () => {
    open('support');
    const reply = await screen.findByRole('textbox', { name: 'Kullanıcıya çözüm yanıtı' });
    expect(screen.queryByRole('link', { name: 'javascript:alert(1)' })).not.toBeInTheDocument();
    fireEvent.change(reply, { target: { value: 'Yanıt taslağım' } });
    fireEvent.click(screen.getByRole('button', { name: /^Tümü/ }));
    await waitFor(() => expect(api.getSupportTickets).toHaveBeenCalledWith('all'));
    expect(await screen.findByRole('textbox', { name: 'Kullanıcıya çözüm yanıtı' })).toHaveValue('Yanıt taslağım');
  });

  it('requires a reply before resolving a ticket', async () => {
    open('support');
    fireEvent.click(await screen.findByRole('button', { name: 'Yanıtı Gönder ve Çöz' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Kaydı çözmeden önce kullanıcıya kısa bir yanıt yazın.');
    expect(api.updateSupportTicket).not.toHaveBeenCalled();
  });

  it('does not issue admin data requests when role verification is denied', async () => {
    api.verifyAdminAccess.mockResolvedValue(false);
    open();
    await waitFor(() => expect(api.verifyAdminAccess).toHaveBeenCalled());
    expect(api.getAdminSnapshot).not.toHaveBeenCalled();
    expect(api.getSupportTickets).not.toHaveBeenCalled();
  });
});

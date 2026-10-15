import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const api = vi.hoisted(() => Object.fromEntries([
  'verifyAdminAccess', 'getAdminStats', 'getAdminUsers', 'getPlanDistribution', 'getRegistrationTrend', 'getUserPlanDetails', 'deleteUser', 'getRecentUsers', 'getActivityStats', 'getWorkoutTrend', 'getSupportTickets', 'getSupportStats', 'updateSupportTicket', 'getRetentionStats', 'getContentReviews', 'updateContentReview', 'getAdminTestimonials', 'getActivationFunnelStats', 'updateTestimonialStatus',
].map((name) => [name, vi.fn()])));
vi.mock('../../lib/adminService', () => api);
vi.mock('recharts', () => ({
  AreaChart: () => null, Area: () => null, BarChart: () => null, Bar: () => null,
  PieChart: () => null, Pie: () => null, Cell: () => null, XAxis: () => null, YAxis: () => null,
  CartesianGrid: () => null, Tooltip: () => null, ResponsiveContainer: () => null,
}));
import AdminPanel from './AdminPanel';
const stats = { totalUsers: 309, usersWithPlans: 281, todayRegistrations: 5, weekRegistrations: 27, monthRegistrations: 60, previousMonthRegistrations: 50, registrationDelta: 10, openSupportTickets: 1 };
const member = (id, name) => ({ id, name, email: `${id}@example.test`, created_at: '2026-10-14T10:00:00Z' });
const ticket = { id: 'ticket', subject: 'Test destek', message: 'Yardıma ihtiyacım var', status: 'open', category: 'support', priority: 'high', page_url: 'javascript:alert(1)' };
function open(tab = 'dashboard') { return render(<MemoryRouter initialEntries={[`/admin?tab=${tab}`]}><AdminPanel user={{ id: 'admin', name: 'Test Admin' }} /></MemoryRouter>); }
function deferred() { let resolve; const promise = new Promise((done) => { resolve = done; }); return { promise, resolve }; }
async function ready() { await screen.findByRole('button', { name: 'Yenile' }); await waitFor(() => expect(api.getAdminStats).toHaveBeenCalled()); }
beforeEach(() => {
  vi.resetAllMocks();
  api.verifyAdminAccess.mockResolvedValue(true);
  api.getAdminStats.mockResolvedValue(stats);
  api.getAdminUsers.mockResolvedValue({ users: [member('one', 'Birinci Üye')], total: 1 });
  api.getPlanDistribution.mockResolvedValue({ goals: [], genders: [], ages: [], experiences: [], languages: [], sources: [], international: { registrations: 23, activated: 22, english: 22, spanish: 1, activationRate: 96, attributed: 12, direct: 11 } });
  for (const name of ['getRegistrationTrend', 'getRecentUsers', 'getWorkoutTrend', 'getContentReviews', 'getAdminTestimonials']) api[name].mockResolvedValue([]);
  api.getActivityStats.mockResolvedValue({ activeUsers: 10, totalWorkouts: 50 });
  api.getSupportTickets.mockResolvedValue([ticket]);
  api.getSupportStats.mockResolvedValue({ open: 1, reviewing: 0, resolved: 0, total: 1 });
  api.getRetentionStats.mockResolvedValue({ registrations: 60, activated: 50, activationRate: 83, d1Rate: null, d7Rate: null });
  api.getActivationFunnelStats.mockResolvedValue({ activeUsers: 10, todayViewed: 8, workoutPlanViewed: 6, workoutDayOpened: 4, workoutCompleted: 2 });
});
afterEach(cleanup);

describe('admin reliability and task flows', () => {
  it('retains successful metrics when another overview request fails', async () => {
    api.getActivityStats.mockRejectedValue(new Error('offline'));
    open(); await ready();
    await screen.findByRole('alert');
    expect(screen.getAllByText('309').length).toBeGreaterThan(0);
    expect(screen.getByRole('alert')).toHaveTextContent('Aktivite');
  });
  it('does not mislabel a loading or failed user list as empty', async () => {
    const pending = deferred(); api.getAdminUsers.mockReturnValue(pending.promise);
    open('users'); await ready();
    expect(screen.queryByText('Henüz kullanıcı yok')).not.toBeInTheDocument();
    await act(async () => pending.resolve({ users: [], total: 0, error: new Error('offline') }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Kullanıcı listesi');
    expect(screen.queryByText('Henüz kullanıcı yok')).not.toBeInTheDocument();
  });
  it('ignores an older search response that arrives after the newest response', async () => {
    const old = deferred();
    api.getAdminUsers.mockImplementation((page, size, query) => query === 'old' ? old.promise : Promise.resolve({ users: [member(query || 'one', query === 'new' ? 'Yeni Sonuç' : 'Birinci Üye')], total: 1 }));
    open('users'); await screen.findByText('Birinci Üye');
    fireEvent.change(screen.getByRole('textbox', { name: 'Kullanıcı ara' }), { target: { value: 'old' } });
    await waitFor(() => expect(api.getAdminUsers).toHaveBeenCalledWith(0, 15, 'old'));
    fireEvent.change(screen.getByRole('textbox', { name: 'Kullanıcı ara' }), { target: { value: 'new' } });
    await screen.findByText('Yeni Sonuç');
    await act(async () => old.resolve({ users: [member('stale', 'Eski Sonuç')], total: 1 }));
    expect(screen.queryByText('Eski Sonuç')).not.toBeInTheDocument();
  });
  it('keeps unsaved quality notes when refreshing all sections', async () => {
    api.getContentReviews.mockResolvedValue([{ id: 'review', content_area: 'pilates', review_status: 'pending', notes: 'Sunucudaki not' }]);
    open('quality'); const notes = await screen.findByRole('textbox', { name: 'İnceleme notu: Pilates' });
    fireEvent.change(notes, { target: { value: 'Yeni taslağım' } });
    fireEvent.click(screen.getByRole('button', { name: 'Yenile' }));
    await screen.findByText('Tüm bölümler yenilendi. Kaydedilmemiş taslaklar korundu.');
    expect(notes).toHaveValue('Yeni taslağım');
  });
  it('preserves a reply across support filters and hides unsafe source links', async () => {
    open('support'); const reply = await screen.findByRole('textbox', { name: 'Kullanıcıya çözüm yanıtı' });
    expect(screen.queryByRole('link', { name: 'javascript:alert(1)' })).not.toBeInTheDocument();
    fireEvent.change(reply, { target: { value: 'Yanıt taslağım' } });
    fireEvent.click(screen.getByRole('button', { name: 'Tümü' }));
    await waitFor(() => expect(api.getSupportTickets).toHaveBeenCalledWith('all'));
    expect(await screen.findByRole('textbox', { name: 'Kullanıcıya çözüm yanıtı' })).toHaveValue('Yanıt taslağım');
  });
  it('requires explicit text before a delete request and cancels without mutation', async () => {
    open('users'); await screen.findByText('Birinci Üye');
    fireEvent.click(screen.getByTitle('Hesabı kalıcı sil'));
    const dialog = screen.getByRole('dialog', { name: 'Hesabı kalıcı olarak sil' });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Kalıcı olarak sil' })).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Onaylamak için SİL yazın'), { target: { value: 'SİL' } });
    expect(screen.getByRole('button', { name: 'Kalıcı olarak sil' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Vazgeç' }));
    expect(api.deleteUser).not.toHaveBeenCalled();
  });
  it('does not issue admin data requests when role verification is denied', async () => {
    api.verifyAdminAccess.mockResolvedValue(false);
    open(); await waitFor(() => expect(api.verifyAdminAccess).toHaveBeenCalled());
    expect(api.getAdminStats).not.toHaveBeenCalled();
    expect(api.getSupportTickets).not.toHaveBeenCalled();
  });
});

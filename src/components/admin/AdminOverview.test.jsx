import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AdminOverview from './AdminOverview';

describe('AdminOverview', () => {
  it('shows unavailable data without inventing zero counts', () => {
    render(<AdminOverview stats={null} supportStats={null} retentionStats={null} />);

    expect(screen.getByText('Üye verisi henüz mevcut değil.')).toBeInTheDocument();
    expect(screen.getByText('Destek verisi henüz mevcut değil.')).toBeInTheDocument();
    expect(screen.getByText('Üye ve plan verisi henüz mevcut değil.')).toBeInTheDocument();
    expect(screen.getByText('Aktivasyon verisi henüz mevcut değil.')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).not.toHaveAttribute('aria-valuenow');
  });

  it('hides stale numbers while loading', () => {
    render(<AdminOverview loading stats={{ totalUsers: 50, usersWithPlans: 30 }} supportStats={{ open: 8 }} retentionStats={{ registrations: 10, activated: 8 }} />);

    expect(screen.queryByText('50 üye kaldı.')).not.toBeInTheDocument();
    expect(screen.getByText('Üye verisi henüz mevcut değil.')).toBeInTheDocument();
    expect(screen.getByText('Destek verisi henüz mevcut değil.')).toBeInTheDocument();
  });

  it('shows actual counts and bounded progress after exceeding 500 members', () => {
    render(<AdminOverview stats={{ totalUsers: 625, usersWithPlans: 400 }} supportStats={{ open: 12 }} retentionStats={{ registrations: 20, activated: 5 }} />);

    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveAttribute('aria-valuemax', '500');
    expect(progress).toHaveAttribute('aria-valuenow', '500');
    expect(progress.firstElementChild).toHaveStyle({ width: '100%' });
    expect(screen.getByText('500 üye hedefine ulaşıldı.')).toBeInTheDocument();
    expect(screen.getByText('625 toplam üyeden 225 kişinin planı yok.')).toBeInTheDocument();
    expect(screen.getByText('20 yeni üyeden 5 kişi plan oluşturdu.')).toBeInTheDocument();
    expect(screen.getByText('%25')).toBeInTheDocument();
    expect(within(screen.getByRole('button', { name: /Açık destek talebi/i })).getByText('12')).toBeInTheDocument();
  });

  it('uses the existing admin tab ids for each action', () => {
    const onNavigate = vi.fn();
    render(<AdminOverview stats={{ totalUsers: 100, usersWithPlans: 80 }} supportStats={{ open: 2 }} onNavigate={onNavigate} />);

    fireEvent.click(screen.getByRole('button', { name: /Destek taleplerini aç/i }));
    fireEvent.click(screen.getByRole('button', { name: /Kullanıcıları aç/i }));
    fireEvent.click(screen.getByRole('button', { name: /Analizleri aç/i }));
    expect(onNavigate.mock.calls).toEqual([['support'], ['users'], ['analytics']]);
  });
});

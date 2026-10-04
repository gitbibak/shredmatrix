import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '../i18n/LanguageContext';
import ExerciseVideoModal from './ExerciseVideoModal';

const video = { id: 'goblet_squat', src: 'https://media.fullbalance.app/v1/tr/goblet_squat.mp4', poster: 'https://media.fullbalance.app/v1/tr/goblet_squat.jpg' };

function renderModal(props) {
  return render(<LanguageProvider><ExerciseVideoModal title="Goblet Squat" {...props} /></LanguageProvider>);
}

describe('ExerciseVideoModal', () => {
  beforeEach(() => { localStorage.setItem('shredmatrix_lang', 'tr'); });

  it('renders nothing without a video', () => {
    renderModal({ video: null, onClose: () => {} });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('plays the video inline with its poster and closes on button and Escape', () => {
    const onClose = vi.fn();
    const { container } = renderModal({ video, onClose });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    const el = container.querySelector('video');
    expect(el.getAttribute('src')).toBe(video.src);
    expect(el.getAttribute('poster')).toBe(video.poster);
    expect(el.hasAttribute('playsinline')).toBe(true);
    expect(el.hasAttribute('controls')).toBe(false);
    expect(el.hasAttribute('loop')).toBe(true);
    expect(screen.getByRole('slider', { name: 'Video konumu' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Videoyu kapat' }));
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('toggles play and pause on tap and shows a play button while paused', () => {
    const { container } = renderModal({ video, onClose: () => {} });
    const el = container.querySelector('video');
    const play = vi.spyOn(el, 'play').mockImplementation(() => Promise.resolve());
    const pause = vi.spyOn(el, 'pause').mockImplementation(() => {});
    Object.defineProperty(el, 'paused', { configurable: true, value: false });
    fireEvent.click(el);
    expect(pause).toHaveBeenCalled();
    fireEvent.pause(el);
    Object.defineProperty(el, 'paused', { configurable: true, value: true });
    fireEvent.click(screen.getByRole('button', { name: 'Oynat' }));
    expect(play).toHaveBeenCalled();
  });
});

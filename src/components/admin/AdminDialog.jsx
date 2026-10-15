import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function AdminDialog({ title, children, onClose, busy = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const dialog = ref.current;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    return () => { dialog.close?.(); previous?.focus?.(); };
  }, []);
  return <dialog ref={ref} open={typeof HTMLDialogElement.prototype.showModal !== 'function'} aria-label={title}
    onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }}
    onClick={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}
    className="m-auto max-h-[85dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-0 text-white shadow-2xl backdrop:bg-black/75 backdrop:backdrop-blur-sm">
    <div className="p-5 sm:p-6" onClick={(event) => event.stopPropagation()}>
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold">{title}</h2>
        <button type="button" autoFocus onClick={onClose} disabled={busy} aria-label="Pencereyi kapat" className="grid min-h-11 min-w-11 place-items-center rounded-xl text-slate-300 hover:bg-slate-800 disabled:opacity-40"><X size={20} /></button>
      </div>
      {children}
    </div>
  </dialog>;
}

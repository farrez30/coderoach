'use client';

import { useCallback, useEffect, useState } from 'react';
import { CACHES, SCOPE } from '@/lib/presentasi/rules';
import { removeOffline, warmUp } from '@/lib/presentasi/warm';

type State =
  | { kind: 'checking' }
  | { kind: 'unavailable'; why: string }
  | { kind: 'idle' }
  | { kind: 'working'; done: number; total: number }
  | { kind: 'ready'; files: number; bytes: number; at: string }
  | { kind: 'error'; message: string };

const SAVED = 'presentasi-offline';
const mb = (bytes: number) => `${(bytes / 1024 / 1024).toLocaleString('id-ID', { maximumFractionDigits: 1 })} MB`;

function readSaved(): { files: number; bytes: number; at: string } | null {
  try {
    return JSON.parse(localStorage.getItem(SAVED) ?? 'null');
  } catch {
    return null;
  }
}

/**
 * Registers the presentation's worker and runs the warm-up on request. Without the build flag it
 * removes any worker and cache left from before instead, which is how the offline mode is killed.
 */
export function OfflineKit({ enabled, pages }: { enabled: boolean; pages: string[] }) {
  const [state, setState] = useState<State>({ kind: 'checking' });

  useEffect(() => {
    if (!enabled) {
      removeOffline().catch(() => {});
      setState({ kind: 'unavailable', why: 'Mode offline tidak aktif di build ini.' });
      return;
    }
    if (!('serviceWorker' in navigator) || !('caches' in window)) {
      setState({ kind: 'unavailable', why: 'Peramban ini tidak mendukung mode offline.' });
      return;
    }
    navigator.serviceWorker.register('/presentasi-sw.js', { scope: SCOPE }).then(
      async () => {
        try {
          const saved = readSaved();
          const cached = await caches.open(CACHES.pages).then((c) => c.match(new URL(SCOPE, location.origin).href, { ignoreVary: true }));
          setState(saved && cached ? { kind: 'ready', ...saved } : { kind: 'idle' });
        } catch (e) {
          // The worker is in; it's the browser's storage that refused (full, or blocked).
          setState({ kind: 'error', message: `penyimpanan peramban menolak (${e instanceof Error ? e.message : String(e)})` });
        }
      },
      () => setState({ kind: 'unavailable', why: 'Service worker tidak bisa dipasang.' }),
    );
  }, [enabled]);

  const prepare = useCallback(async () => {
    setState({ kind: 'working', done: 0, total: pages.length });
    try {
      const result = await warmUp(pages, (done, total) => setState({ kind: 'working', done, total }));
      const at = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta' }).format(new Date());
      try {
        localStorage.setItem(SAVED, JSON.stringify({ ...result, at }));
      } catch {
        // Private window: the status just won't survive a reload.
      }
      setState({ kind: 'ready', ...result, at });
    } catch (e) {
      setState({ kind: 'error', message: e instanceof Error ? e.message : String(e) });
    }
  }, [pages]);

  const status =
    state.kind === 'ready'
      ? `Siap offline: ${state.files} berkas, ${mb(state.bytes)}, diperbarui ${state.at}`
      : state.kind === 'working'
        ? `Menyiapkan ${state.done} / ${state.total}`
        : state.kind === 'unavailable'
          ? state.why
          : state.kind === 'error'
            ? `Gagal: ${state.message}`
            : state.kind === 'idle'
              ? 'Belum siap offline'
              : '';

  // A build without the flag is a decision, not a problem to show a client in the room.
  if (!enabled) return null;
  return (
    <div className="flex items-center gap-3">
      <p
        role="status"
        className={`m-0 text-mist-500 flex items-center gap-2 ${
          // A readout is mono; an explanation is a sentence, and sentences are never set in mono.
          state.kind === 'unavailable' || state.kind === 'error' ? 'text-[13px]' : 'font-mono text-[11px] uppercase tracking-wider tabular'
        }`}
      >
        <span
          aria-hidden
          className={`h-1.5 w-1.5 rounded-full ${state.kind === 'ready' ? 'bg-success' : state.kind === 'error' ? 'bg-error' : 'bg-mist-600'}`}
        />
        {status}
      </p>
      {(state.kind === 'idle' || state.kind === 'ready' || state.kind === 'error') && (
        <button
          type="button"
          onClick={prepare}
          className="h-10 px-3.5 rounded-md border border-shadow-700 font-mono text-[11px] uppercase tracking-wider text-paper hover:bg-paper/[0.06] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-electric"
        >
          {state.kind === 'ready' ? 'Perbarui' : 'Siapkan offline'}
        </button>
      )}
    </div>
  );
}

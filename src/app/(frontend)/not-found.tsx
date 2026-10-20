import { SectionShell } from './_components/detail/SectionShell';

export default function NotFound() {
  return (
    <SectionShell>
      <main className="min-h-[60vh] grid place-items-center py-20">
        <div className="max-w-[640px] mx-auto px-8 text-center">
          <span className="font-mono text-xs uppercase tracking-wider text-mist-600 mb-4 block tabular">
            [ 404 · NOT_FOUND ]
          </span>
          <h1 className="text-[clamp(48px,7vw,80px)] font-bold tracking-[-0.025em] leading-[1.05] mb-6">
            Halaman tidak ditemukan.
          </h1>
          <p className="text-[18px] leading-[1.55] text-mist-600 mb-10 max-w-[480px] mx-auto text-pretty">
            URL yang Anda buka tidak cocok dengan halaman manapun yang kami ship. Kemungkinan halaman dipindahkan atau link salah ketik.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a
              href="/"
              className="h-12 px-5 rounded-md bg-electric text-paper text-sm font-semibold inline-flex items-center hover:bg-[#2562E0] transition-colors"
            >
              <span aria-hidden>←</span> Kembali ke home
            </a>
            <a
              href="/work"
              className="h-12 px-5 rounded-md bg-transparent text-ink border border-mist-400 text-sm font-semibold inline-flex items-center hover:bg-ink/[0.04] transition-colors"
            >
              Lihat hasil kami
            </a>
          </div>
        </div>
      </main>
    </SectionShell>
  );
}

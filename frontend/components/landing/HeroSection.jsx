import Link from 'next/link';

/**
 * Hero section introducing the product value proposition.
 */
export default function HeroSection() {
  return (
    <section className="min-h-screen bg-gradient-to-b from-white to-indigo-50 px-4 pb-16 pt-28 sm:px-6 lg:px-8 lg:pb-20 lg:pt-36">
      <div className="mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
        <div className="space-y-8">
          <span className="inline-flex rounded-full border border-indigo-200 bg-indigo-100 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-indigo-700 sm:text-sm">
            Nouveau - Gestion de recrutement simplifiée
          </span>

          <div className="space-y-5">
            <h1 className="text-4xl font-black leading-tight tracking-[-0.03em] text-[#111827] sm:text-5xl lg:text-6xl">
              Recrutez{' '}
              <span className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] bg-clip-text text-transparent">mieux</span>,
              <br />
              plus vite, sans effort.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-[#4b5563] sm:text-lg">
              Vaybe Recrutement centralise vos candidatures, automatise vos communications et vous donne les insights dont vous avez besoin pour prendre les meilleures décisions RH.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-2xl bg-[#6366F1] px-6 py-3 text-sm font-bold text-white transition duration-300 hover:scale-105 hover:bg-[#4f46e5] sm:text-base"
            >
              Commencer gratuitement →
            </Link>
            <a
              href="#comment-ca-marche"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#d1d5db] bg-white px-6 py-3 text-sm font-semibold text-[#374151] transition duration-300 hover:bg-[#f9fafb] sm:text-base"
            >
              <span aria-hidden="true" className="inline-block h-0 w-0 border-y-[6px] border-y-transparent border-l-[9px] border-l-current" />
              <span>Voir une démo</span>
            </a>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-[#e5e7eb] pt-5 sm:max-w-xl">
            <div>
              <p className="text-2xl font-black text-[#111827] sm:text-3xl">500+</p>
              <p className="text-xs text-[#6b7280] sm:text-sm">entreprises</p>
            </div>
            <div>
              <p className="text-2xl font-black text-[#111827] sm:text-3xl">12 000+</p>
              <p className="text-xs text-[#6b7280] sm:text-sm">candidatures traitées</p>
            </div>
            <div>
              <p className="text-2xl font-black text-[#111827] sm:text-3xl">3x</p>
              <p className="text-xs text-[#6b7280] sm:text-sm">plus rapide</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-6 top-10 h-44 w-44 rounded-full bg-indigo-200/50 blur-3xl" />
          <div className="absolute -bottom-8 -right-4 h-40 w-40 rounded-full bg-violet-200/60 blur-3xl" />

          <div className="relative rounded-3xl border border-indigo-100 bg-white p-5 shadow-2xl shadow-indigo-200/40">
            <div className="mb-4 flex items-center justify-between border-b border-[#eef2ff] pb-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#818cf8]">Dashboard RH</p>
                <p className="text-sm font-bold text-[#111827]">Vue recrutement</p>
              </div>
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">Temps réel</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[#eef2ff] bg-indigo-50 p-3">
                <p className="text-xs text-[#6366f1]">Nouvelles candidatures</p>
                <p className="mt-1 text-2xl font-black text-[#312e81]">84</p>
              </div>
              <div className="rounded-xl border border-[#ede9fe] bg-violet-50 p-3">
                <p className="text-xs text-[#8b5cf6]">Entretiens</p>
                <p className="mt-1 text-2xl font-black text-[#5b21b6]">21</p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-[#e5e7eb]">
              <div className="grid grid-cols-[2.2fr_1fr_1fr] border-b border-[#f3f4f6] bg-[#fafafa] px-3 py-2 text-xs font-semibold text-[#6b7280]">
                <span>Candidat</span>
                <span>Poste</span>
                <span>Statut</span>
              </div>
              {[
                ['Awa Kouassi', 'Frontend', 'Nouveau'],
                ['Mamadou Traoré', 'Ops', 'Entretien'],
                ['Mariam Diallo', 'Designer', 'Retenu'],
              ].map((row) => (
                <div key={row[0]} className="grid grid-cols-[2.2fr_1fr_1fr] px-3 py-2 text-xs text-[#374151] sm:text-sm">
                  <span>{row[0]}</span>
                  <span>{row[1]}</span>
                  <span className="font-semibold text-[#4f46e5]">{row[2]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

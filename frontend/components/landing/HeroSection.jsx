import Link from 'next/link';
import { ArrowRight, ChartNoAxesCombined, Clock3, Sparkles } from 'lucide-react';
// FIX-CONTRAST: lisibilite corrigee

/**
 * Hero section introducing the product value proposition.
 */
export default function HeroSection() {
  return (
    <section className="min-h-screen bg-white px-4 pb-16 pt-28 sm:px-6 lg:px-8 lg:pb-20 lg:pt-36">
      <div className="mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
        <div className="space-y-8 fade-in">
          <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-teal-700 sm:text-sm">
            <Sparkles size={14} />
            Nouveau - Gestion de recrutement simplifiee
          </span>

          <div className="space-y-5">
            <h1 className="text-4xl font-black leading-tight tracking-[-0.03em] text-slate-900 sm:text-5xl lg:text-6xl">
              Recrutez{' '}
              <span className="text-teal-600">mieux</span>,
              <br />
              plus vite, sans effort.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Vaybe Recrutement centralise vos candidatures, automatise vos communications et vous donne les insights dont vous avez besoin pour prendre les meilleures décisions RH.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-6 py-3 text-sm font-bold text-white transition duration-300 hover:bg-teal-700 sm:text-base"
            >
              Commencer gratuitement
              <ArrowRight size={16} />
            </Link>
            <a
              href="#comment-ca-marche"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition duration-300 hover:border-slate-400 sm:text-base"
            >
              <span aria-hidden="true" className="inline-block h-0 w-0 border-y-[6px] border-y-transparent border-l-[9px] border-l-current" />
              <span>Voir une démo</span>
            </a>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-slate-200 pt-5 sm:max-w-xl">
            <div>
              <p className="text-2xl font-black text-slate-900 sm:text-3xl">500+</p>
              <p className="text-xs text-slate-500 sm:text-sm">entreprises</p>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 sm:text-3xl">12 000+</p>
              <p className="text-xs text-slate-500 sm:text-sm">candidatures traitees</p>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 sm:text-3xl">3x</p>
              <p className="text-xs text-slate-500 sm:text-sm">plus rapide</p>
            </div>
          </div>
        </div>

        <div className="relative fade-in">
          <div className="relative rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-200/70">
            <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal-600">Dashboard RH</p>
                <p className="text-sm font-bold text-slate-800">Vue recrutement</p>
              </div>
              <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-medium text-teal-800">Temps reel</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Nouvelles candidatures</p>
                <p className="mt-1 text-2xl font-black text-slate-900">84</p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs text-amber-800">Entretiens</p>
                <p className="mt-1 text-2xl font-black text-amber-900">21</p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-slate-200">
              <div className="grid grid-cols-[2.2fr_1fr_1fr] border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
                <span>Candidat</span>
                <span>Poste</span>
                <span>Statut</span>
              </div>
              {[
                ['Awa Kouassi', 'Frontend', 'Nouveau'],
                ['Mamadou Traoré', 'Ops', 'Entretien'],
                ['Mariam Diallo', 'Designer', 'Retenu'],
              ].map((row) => (
                <div key={row[0]} className="grid grid-cols-[2.2fr_1fr_1fr] px-3 py-2 text-xs text-slate-700 sm:text-sm">
                  <span>{row[0]}</span>
                  <span>{row[1]}</span>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      row[2] === 'Nouveau'
                        ? 'bg-teal-100 text-teal-800'
                        : row[2] === 'Entretien'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {row[2]}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700">
                <p className="flex items-center gap-2 text-xs text-slate-500"><Clock3 size={14} /> Temps moyen</p>
                <p className="mt-1 text-xl font-black">48h</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700">
                <p className="flex items-center gap-2 text-xs text-slate-500"><ChartNoAxesCombined size={14} /> Taux de reponse</p>
                <p className="mt-1 text-xl font-black">92%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

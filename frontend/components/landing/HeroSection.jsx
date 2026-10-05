import Link from 'next/link';
import { ArrowRight, BarChart2, Clock3, Sparkles } from 'lucide-react';

/**
 * Hero section introducing the product value proposition.
 */
export default function HeroSection() {
  return (
    <section className="min-h-screen bg-white px-4 pb-20 pt-28 sm:px-6 lg:px-8 lg:pb-28 lg:pt-36">
      <div className="mx-auto grid w-full max-w-7xl gap-14 lg:grid-cols-2 lg:items-center">

        {/* Left — copy */}
        <div className="space-y-8">
          {/* Badge */}
          <span className="inline-flex items-center gap-2 rounded-full border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[#0D9488]">
            <Sparkles size={13} />
            Nouveau — Gestion de recrutement simplifiée
          </span>

          {/* Headline */}
          <div className="space-y-3">
            <h1 className="text-5xl font-extrabold leading-[1.1] tracking-[-0.03em] text-[#0F172A] sm:text-6xl lg:text-[64px]">
              Recrutez{' '}
              <span className="text-[#0D9488]">mieux</span>,
              <br />
              plus vite,
              <br />
              sans effort.
            </h1>
            <p className="max-w-[520px] text-[17px] leading-relaxed text-[#64748B] sm:text-lg">
              Vaybe Recrutement centralise vos candidatures, automatise vos communications et vous donne les insights dont vous avez besoin pour prendre les meilleures décisions RH.
            </p>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#14B8A6] px-8 py-4 text-[15px] font-bold text-white shadow-lg transition duration-200 hover:bg-[#0D9488]"
            >
              Commencer gratuitement
              <ArrowRight size={16} />
            </Link>
            <a
              href="#comment-ca-marche"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-8 py-4 text-[15px] font-semibold text-[#0F172A] transition duration-200 hover:border-[#CBD5E1] hover:bg-[#F8FAFC]"
            >
              <span className="inline-block h-0 w-0 border-y-[5px] border-y-transparent border-l-[8px] border-l-current" aria-hidden="true" />
              Voir une démo
            </a>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 border-t border-[#E2E8F0] pt-6 sm:max-w-xl">
            <div>
              <p className="text-[32px] font-bold leading-none text-[#0F172A]">500+</p>
              <p className="mt-1 text-[13px] text-[#64748B]">entreprises</p>
            </div>
            <div className="h-10 w-px bg-[#E2E8F0]" />
            <div>
              <p className="text-[32px] font-bold leading-none text-[#0F172A]">12 000+</p>
              <p className="mt-1 text-[13px] text-[#64748B]">candidatures traitées</p>
            </div>
            <div className="h-10 w-px bg-[#E2E8F0]" />
            <div>
              <p className="text-[32px] font-bold leading-none text-[#0F172A]">3x</p>
              <p className="mt-1 text-[13px] text-[#64748B]">plus rapide</p>
            </div>
          </div>
        </div>

        {/* Right — dashboard mock */}
        <div className="relative flex justify-center lg:justify-end">
          {/* Subtle background glow */}
          <div className="pointer-events-none absolute -inset-8 rounded-3xl bg-[#F0FDF4]/60 blur-2xl" />

          <div
            className="relative w-full max-w-[480px] overflow-hidden rounded-[20px] border border-[#E2E8F0] bg-white shadow-2xl"
          >
            {/* Dashboard header */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#64748B]">Dashboard RH</p>
                <p className="text-[15px] font-bold text-[#0F172A]">Vue recrutement</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F0FDF4] px-2.5 py-1 text-[12px] font-medium text-[#0D9488]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0D9488] opacity-50" />
                  <span className="inline-flex h-2 w-2 rounded-full bg-[#0D9488]" />
                </span>
                En direct
              </span>
            </div>

            <div className="space-y-4 p-5">
              {/* KPI row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                  <p className="text-[12px] text-[#64748B]">Nouvelles candidatures</p>
                  <p className="mt-1.5 text-[28px] font-bold leading-none text-[#0F172A]">84</p>
                </div>
                <div className="rounded-[12px] border border-amber-200 bg-amber-50 p-4">
                  <p className="text-[12px] text-amber-700">Entretiens prévus</p>
                  <p className="mt-1.5 text-[28px] font-bold leading-none text-amber-900">21</p>
                </div>
              </div>

              {/* Candidates table */}
              <div className="overflow-hidden rounded-[12px] border border-[#E2E8F0]">
                <div className="grid grid-cols-[2fr_1fr_1fr] bg-[#F8FAFC] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">
                  <span>Candidat</span>
                  <span>Poste</span>
                  <span>Statut</span>
                </div>
                {[
                  ['Awa Kouassi', 'Frontend', 'Nouveau', 'teal'],
                  ['Mamadou Traoré', 'Ops', 'Entretien', 'amber'],
                  ['Mariam Diallo', 'Designer', 'Retenu', 'green'],
                ].map((row) => (
                  <div key={row[0]} className="grid grid-cols-[2fr_1fr_1fr] items-center border-t border-[#F1F5F9] px-4 py-2.5 text-[13px] text-[#0F172A]">
                    <span className="font-medium">{row[0]}</span>
                    <span className="text-[#64748B]">{row[1]}</span>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      row[3] === 'teal'
                        ? 'bg-[#F0FDF4] text-[#0D9488]'
                        : row[3] === 'amber'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {row[2]}
                    </span>
                  </div>
                ))}
              </div>

              {/* Metrics row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
                  <p className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
                    <Clock3 size={13} className="text-[#0D9488]" />
                    Temps moyen
                  </p>
                  <p className="mt-1.5 text-[22px] font-bold leading-none text-[#0F172A]">48h</p>
                </div>
                <div className="rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
                  <p className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
                    <BarChart2 size={13} className="text-[#0D9488]" />
                    Taux de réponse
                  </p>
                  <p className="mt-1.5 text-[22px] font-bold leading-none text-[#0F172A]">92%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

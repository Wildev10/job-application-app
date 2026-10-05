const STEPS = [
  {
    number: '01',
    title: 'Créez votre compte',
    description:
      'Inscrivez-vous en 2 minutes. Personnalisez votre espace avec le nom et les couleurs de votre entreprise.',
  },
  {
    number: '02',
    title: 'Publiez vos postes',
    description:
      "Créez vos offres d'emploi et partagez le lien du formulaire de candidature sur vos réseaux et votre site web.",
  },
  {
    number: '03',
    title: 'Gérez vos candidatures',
    description:
      'Recevez, consultez et faites évoluer les candidatures depuis votre dashboard. Les emails partent automatiquement.',
  },
];

/**
 * Three-step onboarding explanation for prospects.
 */
export default function HowItWorks() {
  return (
    <section id="comment-ca-marche" className="bg-[#0F172A] px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-[40px] font-bold tracking-[-0.02em] text-white sm:text-[48px]">
            Opérationnel en 3 étapes
          </h2>
          <p className="mt-4 text-[17px] text-[#94A3B8]">
            De l'inscription à votre première candidature en moins de 10 minutes.
          </p>
        </div>

        {/* Steps */}
        <div className="relative mt-14 grid gap-5 lg:grid-cols-3 lg:gap-8">
          {/* Dotted connector — desktop only */}
          <div
            className="pointer-events-none absolute left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] top-6 hidden h-px border-t border-dashed border-[#334155] lg:block"
            aria-hidden="true"
          />

          {STEPS.map((step) => (
            <article
              key={step.number}
              className="relative rounded-[16px] border border-[#334155] bg-[#1E293B] p-8"
            >
              {/* Step badge */}
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#0F172A] text-[18px] font-bold text-[#0D9488]">
                {step.number}
              </div>
              <h3 className="text-[19px] font-bold text-white">{step.title}</h3>
              <p className="mt-3 text-[14px] leading-relaxed text-[#94A3B8]">{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

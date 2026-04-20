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
      'Créez vos offres d\'emploi et partagez le lien du formulaire de candidature sur vos réseaux et votre site web.',
  },
  {
    number: '03',
    title: 'Gérez vos candidatures',
    description:
      'Recevez, consultez et faites évoluer les candidatures depuis votre dashboard. Les emails partent automatiquement.',
  },
];
// FIX-CONTRAST: lisibilite corrigee

/**
 * Three-step onboarding explanation for prospects.
 */
export default function HowItWorks() {
  return (
    <section id="comment-ca-marche" className="bg-slate-900 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-black tracking-[-0.02em] text-white sm:text-4xl">
            Opérationnel en 3 étapes
          </h2>
        </div>

        <div className="relative mt-12 grid gap-5 lg:grid-cols-3 lg:gap-8">
          <div className="pointer-events-none absolute left-[16%] right-[16%] top-14 hidden h-[2px] bg-gradient-to-r from-teal-500/30 via-cyan-300/30 to-teal-500/30 lg:block" />

          {STEPS.map((step, index) => (
            <article
              key={step.number}
              className={`relative rounded-2xl border p-6 shadow-sm ${
                index % 2 === 0 ? 'border-slate-700 bg-slate-800' : 'border-teal-500/30 bg-teal-900/20'
              }`}
            >
              <p className="text-4xl font-black leading-none text-cyan-300 sm:text-5xl">{step.number}</p>
              <h3 className="mt-4 text-xl font-extrabold text-white">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-200 sm:text-base">{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const FEATURES = [
  {
    badge: 'FM',
    title: 'Formulaire personnalisé',
    description: 'Créez un formulaire de candidature à votre image avec votre logo et vos couleurs.',
  },
  {
    badge: 'DS',
    title: 'Dashboard & Statistiques',
    description: 'Visualisez en temps réel l\'état de vos recrutements avec des graphiques clairs.',
  },
  {
    badge: 'ST',
    title: 'Suivi des statuts',
    description: 'Faites progresser chaque candidat dans votre pipeline avec un simple clic.',
  },
  {
    badge: 'EM',
    title: 'Emails automatiques',
    description: 'Vos candidats reçoivent des notifications à chaque étape sans que vous ayez à lever le petit doigt.',
  },
  {
    badge: 'MP',
    title: 'Multi-postes',
    description: 'Gérez plusieurs postes ouverts simultanément, chacun avec son propre formulaire et ses candidatures.',
  },
  {
    badge: 'CSV',
    title: 'Export CSV',
    description: 'Exportez vos candidatures en un clic pour vos analyses dans Excel ou Google Sheets.',
  },
];

/**
 * Product features grid for the landing page.
 */
export default function FeaturesSection() {
  return (
    <section id="fonctionnalites" className="bg-white px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-black tracking-[-0.02em] text-[#111827] sm:text-4xl">
            Tout ce dont vous avez besoin
          </h2>
          <p className="mt-3 text-base text-[#6b7280] sm:text-lg">
            Une plateforme complète pour gérer vos recrutements de A à Z
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {FEATURES.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-[#e5e7eb] bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-100"
            >
              <span className="mb-4 inline-flex h-11 min-w-11 items-center justify-center rounded-xl bg-indigo-100 px-2 text-xs font-bold tracking-[0.08em] text-indigo-700">
                {feature.badge}
              </span>
              <h3 className="text-lg font-extrabold text-[#111827]">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#6b7280]">{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

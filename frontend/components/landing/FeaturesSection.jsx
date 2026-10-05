import { BarChart2, Download, FileText, GitPullRequest, Layers, Mail } from 'lucide-react';

const FEATURES = [
  {
    icon: FileText,
    title: 'Formulaire personnalisé',
    description: 'Créez un formulaire de candidature à votre image avec votre logo et vos couleurs.',
  },
  {
    icon: BarChart2,
    title: 'Dashboard & Statistiques',
    description: "Visualisez en temps réel l'état de vos recrutements avec des graphiques clairs.",
  },
  {
    icon: GitPullRequest,
    title: 'Suivi des statuts',
    description: 'Faites progresser chaque candidat dans votre pipeline avec un simple clic.',
  },
  {
    icon: Mail,
    title: 'Emails automatiques',
    description: "Vos candidats reçoivent des notifications à chaque étape sans que vous ayez à lever le petit doigt.",
  },
  {
    icon: Layers,
    title: 'Multi-postes',
    description: 'Gérez plusieurs postes ouverts simultanément, chacun avec son propre formulaire et ses candidatures.',
  },
  {
    icon: Download,
    title: 'Export CSV',
    description: 'Exportez vos candidatures en un clic pour vos analyses dans Excel ou Google Sheets.',
  },
];

/**
 * Product features grid for the landing page.
 */
export default function FeaturesSection() {
  return (
    <section id="fonctionnalites" className="bg-[#FAFAFA] px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-[40px] font-bold tracking-[-0.02em] text-[#0E0E10] sm:text-[48px]">
            Tout ce dont vous avez besoin
          </h2>
          <p className="mt-4 text-[17px] leading-relaxed text-[#6B7280]">
            Une plateforme complète pour gérer vos recrutements de A à Z
          </p>
        </div>

        {/* Grid */}
        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.title}
                className="group rounded-[16px] border border-[#E5E5E5] bg-white p-8 shadow-sm transition duration-200 hover:border-[#F2600C] hover:shadow-lg"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#FFF4EE]">
                  <Icon size={22} className="text-[#F2600C]" strokeWidth={1.75} />
                </div>
                <h3 className="text-[17px] font-bold text-[#0E0E10]">{feature.title}</h3>
                <p className="mt-2.5 text-[14px] leading-relaxed text-[#6B7280]">{feature.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

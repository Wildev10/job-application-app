import Link from 'next/link';
import { BriefcaseBusiness } from 'lucide-react';

export const metadata = {
  title: 'Conditions Générales d\'Utilisation — Vaybe Recrutement',
  description: 'Conditions générales d\'utilisation de la plateforme Vaybe Recrutement.',
};

const LAST_UPDATED = '1er octobre 2026';

const sections = [
  {
    title: '1. Objet',
    content: `Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme SaaS Vaybe Recrutement (ci-après « le Service ») éditée par Vaybe, entreprise dont le siège social est situé à Cotonou, Bénin.

En s'inscrivant ou en utilisant le Service, l'utilisateur accepte sans réserve les présentes CGU. Toute utilisation du Service implique l'acceptation pleine et entière des présentes conditions.`,
  },
  {
    title: '2. Description du service',
    content: `Vaybe Recrutement est une plateforme de gestion des candidatures en ligne permettant aux entreprises (ci-après « Recruteurs ») de :

• Publier des offres d'emploi et collecter des candidatures en ligne
• Gérer les candidats via un tableau de bord dédié
• Communiquer automatiquement avec les candidats par email
• Exporter les données de recrutement

Le Service est disponible en deux formules : Plan Starter (gratuit) et Plan Pro (payant). Les fonctionnalités disponibles varient selon la formule souscrite.`,
  },
  {
    title: '3. Inscription et compte',
    content: `3.1 Pour accéder au Service, le Recruteur doit créer un compte en fournissant une adresse email valide et un mot de passe. Le Recruteur s'engage à fournir des informations exactes et à les maintenir à jour.

3.2 La confirmation de l'adresse email est nécessaire pour activer l'ensemble des fonctionnalités. Vaybe se réserve le droit de suspendre un compte dont l'adresse email n'a pas été vérifiée.

3.3 Le Recruteur est seul responsable de la confidentialité de ses identifiants et de toutes les actions réalisées depuis son compte. Il doit informer Vaybe immédiatement de tout accès non autorisé.`,
  },
  {
    title: '4. Plans et tarifs',
    content: `4.1 Plan Starter (gratuit) : accès limité à 2 postes actifs et 50 candidatures par mois. Aucune facturation n'est effectuée.

4.2 Plan Pro (payant) : postes et candidatures illimités, export CSV et fonctionnalités avancées. Le tarif est indiqué sur la page de tarification au moment de la souscription.

4.3 Le paiement s'effectue via FedaPay, opérateur de paiement mobile money (MTN, Moov, etc.). Le Recruteur accepte les conditions de FedaPay lors du règlement.

4.4 Les abonnements sont sans engagement. Le Recruteur peut résilier à tout moment depuis son espace. Aucun remboursement au prorata n'est accordé pour la période déjà entamée.

4.5 Vaybe se réserve le droit de modifier ses tarifs avec un préavis de 30 jours. Le Recruteur sera informé par email.`,
  },
  {
    title: '5. Obligations du recruteur',
    content: `Le Recruteur s'engage à :

• N'utiliser le Service qu'à des fins légitimes de recrutement
• Ne pas publier d'offres d'emploi frauduleuses, discriminatoires ou contraires aux lois en vigueur
• Respecter la vie privée des candidats et les lois applicables en matière de protection des données personnelles
• Ne pas tenter de contourner les limitations techniques ou les protections du Service
• Informer les candidats de l'utilisation de leurs données conformément aux lois applicables`,
  },
  {
    title: '6. Données personnelles',
    content: `Vaybe collecte et traite des données personnelles conformément à sa Politique de Confidentialité, disponible à l'adresse /confidentialite.

Le Recruteur agit en qualité de responsable de traitement pour les données des candidats collectées via sa page de candidature. Vaybe agit en qualité de sous-traitant. Le Recruteur s'engage à informer ses candidats de cette collecte.`,
  },
  {
    title: '7. Propriété intellectuelle',
    content: `Le Service, son code source, ses interfaces et son contenu sont la propriété exclusive de Vaybe. Toute reproduction, modification ou exploitation non autorisée est interdite.

Les données saisies par le Recruteur (offres d'emploi, informations entreprise) restent sa propriété. En les soumettant, il accorde à Vaybe une licence limitée, non exclusive et révocable pour les héberger et les afficher dans le cadre du Service.`,
  },
  {
    title: '8. Disponibilité et maintenance',
    content: `Vaybe s'efforce d'assurer une disponibilité maximale du Service, sans pouvoir garantir une disponibilité ininterrompue. Des interruptions pour maintenance planifiée ou incidents techniques peuvent survenir. Vaybe ne saurait être tenu responsable des pertes ou préjudices résultant d'une indisponibilité temporaire.`,
  },
  {
    title: '9. Suspension et résiliation',
    content: `9.1 Le Recruteur peut supprimer son compte à tout moment depuis les paramètres. Cette suppression entraîne l'effacement des données dans un délai de 30 jours.

9.2 Vaybe se réserve le droit de suspendre ou de résilier un compte en cas de violation des présentes CGU, de comportement abusif ou de non-paiement, après mise en demeure restée sans effet.`,
  },
  {
    title: '10. Limitation de responsabilité',
    content: `Dans les limites permises par la loi, la responsabilité de Vaybe ne saurait excéder le montant payé par le Recruteur au cours des trois derniers mois précédant le litige. Vaybe n'est pas responsable des dommages indirects, perte de profits ou de données résultant de l'utilisation ou de l'impossibilité d'utiliser le Service.`,
  },
  {
    title: '11. Droit applicable et juridiction',
    content: `Les présentes CGU sont régies par le droit béninois. En cas de litige, les parties s'engagent à rechercher une solution amiable avant tout recours judiciaire. À défaut, les tribunaux compétents de Cotonou, Bénin, seront saisis.`,
  },
  {
    title: '12. Modifications',
    content: `Vaybe se réserve le droit de modifier les présentes CGU à tout moment. Les Recruteurs seront informés par email au moins 15 jours avant l'entrée en vigueur des nouvelles conditions. La poursuite de l'utilisation du Service après cette date vaut acceptation.`,
  },
];

export default function CguPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]" style={{ fontFamily: 'Inter, -apple-system, sans-serif' }}>
      {/* Top nav */}
      <header className="sticky top-0 z-10 border-b border-[#E5E5E5] bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#F2600C] text-white">
              <BriefcaseBusiness size={15} strokeWidth={2.5} />
            </span>
            <span className="text-[14px] font-bold text-[#0E0E10]">Vaybe Recrutement</span>
          </Link>
          <Link href="/confidentialite" className="text-[13px] font-medium text-[#6B7280] transition hover:text-[#F2600C]">
            Politique de confidentialité →
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        {/* Hero */}
        <div className="mb-12">
          <span className="inline-flex items-center rounded-full bg-[#FFF4EE] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-[#F2600C]">
            Légal
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-[-0.025em] text-[#0E0E10] sm:text-4xl">
            Conditions Générales d&apos;Utilisation
          </h1>
          <p className="mt-3 text-[14px] text-[#9CA3AF]">Dernière mise à jour : {LAST_UPDATED}</p>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[#6B7280]">
            En utilisant Vaybe Recrutement, vous acceptez les présentes conditions. Prenez le temps de les lire attentivement.
          </p>
        </div>

        {/* Table of contents */}
        <nav className="mb-10 rounded-2xl border border-[#E5E5E5] bg-white p-5 shadow-sm">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.15em] text-[#9CA3AF]">Sommaire</p>
          <ol className="grid gap-1 sm:grid-cols-2">
            {sections.map((section) => (
              <li key={section.title}>
                <a
                  href={`#${section.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  className="text-[13px] text-[#6B7280] transition hover:text-[#F2600C]"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section) => (
            <section
              key={section.title}
              id={section.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}
              className="rounded-2xl border border-[#E5E5E5] bg-white p-6 shadow-sm sm:p-8"
            >
              <h2 className="mb-4 text-[17px] font-bold text-[#0E0E10]">{section.title}</h2>
              <div className="space-y-3">
                {section.content.split('\n\n').map((para, i) => (
                  <p key={i} className="whitespace-pre-line text-[14px] leading-[1.8] text-[#374151]">
                    {para}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Contact */}
        <div className="mt-10 rounded-2xl border border-[#FFD5C2] bg-[#FFF4EE] p-6 sm:p-8">
          <p className="text-[13px] font-semibold text-[#0E0E10]">Des questions sur ces conditions ?</p>
          <p className="mt-1 text-[13px] text-[#6B7280]">
            Contactez-nous à{' '}
            <a href="mailto:contact@vaybe.io" className="font-medium text-[#F2600C] hover:underline">
              contact@vaybe.io
            </a>
          </p>
        </div>
      </main>

      <footer className="border-t border-[#E5E5E5] bg-white py-6 text-center text-[12px] text-[#9CA3AF]">
        © {new Date().getFullYear()} Vaybe. Tous droits réservés. —{' '}
        <Link href="/confidentialite" className="hover:text-[#F2600C]">Politique de confidentialité</Link>
      </footer>
    </div>
  );
}

import Link from 'next/link';
import { BriefcaseBusiness } from 'lucide-react';

export const metadata = {
  title: 'Politique de Confidentialité — Vaybe Recrutement',
  description: 'Comment Vaybe Recrutement collecte, utilise et protège vos données personnelles.',
};

const LAST_UPDATED = '1er octobre 2026';

const sections = [
  {
    title: '1. Responsable du traitement',
    content: `Le responsable du traitement des données personnelles collectées via la plateforme Vaybe Recrutement est la société Vaybe, dont le siège social est situé à Cotonou, Bénin.

Pour toute question relative à vos données personnelles, vous pouvez nous contacter à l'adresse : contact@vaybe.io`,
  },
  {
    title: '2. Données collectées',
    content: `Nous collectons deux catégories de données :

Données des Recruteurs (entreprises inscrites) :
• Nom de l'entreprise, adresse email, mot de passe (haché)
• Informations de profil : logo, couleur de marque, slug
• Données de paiement (traitées par FedaPay — nous ne stockons pas les numéros de carte ou de mobile money)
• Données d'utilisation : postes publiés, candidatures reçues, statuts

Données des Candidats (transmises via le formulaire de candidature) :
• Nom complet, adresse email
• Poste visé, lettre de motivation
• CV (fichier), lien portfolio (optionnel)`,
  },
  {
    title: '3. Finalités du traitement',
    content: `Nous traitons vos données pour les finalités suivantes :

• Fourniture du Service : création et gestion de compte, publication d'offres, gestion des candidatures
• Communication : envoi d'emails de confirmation, notifications de changement de statut, emails transactionnels
• Facturation et paiement : traitement des abonnements Pro via FedaPay
• Sécurité : prévention des fraudes, authentification, protection des comptes
• Amélioration du Service : statistiques d'usage agrégées et anonymisées
• Obligations légales : conservation des données requises par la loi`,
  },
  {
    title: '4. Base légale',
    content: `Le traitement de vos données repose sur :

• L'exécution du contrat (CGU) pour la fourniture du Service
• Votre consentement pour les communications marketing (opt-in explicite)
• Notre intérêt légitime pour la sécurité et l'amélioration du Service
• Le respect d'obligations légales pour la conservation de certaines données`,
  },
  {
    title: '5. Conservation des données',
    content: `Données de compte Recruteur : conservées pendant toute la durée de l'abonnement actif, puis supprimées dans un délai de 30 jours suivant la fermeture du compte.

Données des Candidats : conservées aussi longtemps que le compte Recruteur est actif. En cas de suppression du compte Recruteur, les données candidats sont supprimées dans les 30 jours.

Données de facturation : conservées 5 ans conformément aux obligations comptables et fiscales.

Logs de sécurité : conservés 12 mois.`,
  },
  {
    title: '6. Partage des données',
    content: `Nous ne vendons ni ne louons vos données personnelles à des tiers.

Nous pouvons partager vos données avec :

• FedaPay : pour le traitement des paiements (données minimales nécessaires à la transaction)
• Prestataires d'hébergement : hébergement sécurisé des données sur des serveurs en Europe ou en Afrique de l'Ouest
• Autorités compétentes : uniquement si requis par la loi ou une décision judiciaire

Tout sous-traitant est soumis à des obligations contractuelles de confidentialité et de sécurité.`,
  },
  {
    title: '7. Sécurité',
    content: `Nous mettons en œuvre des mesures techniques et organisationnelles adaptées pour protéger vos données :

• Chiffrement des mots de passe (bcrypt)
• Tokens d'authentification stockés en cookie HttpOnly (inaccessibles depuis JavaScript)
• Communications chiffrées via HTTPS/TLS
• Accès aux données limité au personnel autorisé
• Sauvegardes régulières des données`,
  },
  {
    title: '8. Vos droits',
    content: `Conformément aux lois applicables sur la protection des données, vous disposez des droits suivants :

• Droit d'accès : obtenir une copie de vos données personnelles
• Droit de rectification : corriger des données inexactes
• Droit à l'effacement : demander la suppression de vos données
• Droit à la portabilité : recevoir vos données dans un format structuré
• Droit d'opposition : vous opposer à certains traitements

Pour exercer ces droits, contactez-nous à contact@vaybe.io. Nous nous engageons à répondre dans un délai de 30 jours.`,
  },
  {
    title: '9. Cookies',
    content: `Vaybe Recrutement utilise des cookies techniques strictement nécessaires au fonctionnement du Service :

• company_token : cookie d'authentification HttpOnly, durée 7 jours — sécurise votre session sans exposer le token à JavaScript
• sa_token : cookie d'authentification super-administrateur (usage interne uniquement)

Nous n'utilisons pas de cookies publicitaires ou de tracking tiers. Aucune bannière de consentement n'est nécessaire pour ces cookies fonctionnels.`,
  },
  {
    title: '10. Transferts internationaux',
    content: `Vos données peuvent être hébergées et traitées en dehors de votre pays de résidence. Nous nous assurons que tout transfert de données est encadré par des garanties appropriées (clauses contractuelles types ou décision d'adéquation).`,
  },
  {
    title: '11. Modifications',
    content: `Nous pouvons modifier cette politique de confidentialité à tout moment. Toute modification substantielle sera notifiée par email avec un préavis de 15 jours. La date de dernière mise à jour est indiquée en haut de cette page.`,
  },
  {
    title: '12. Contact et réclamations',
    content: `Pour toute question ou réclamation relative à vos données personnelles :

Email : contact@vaybe.io
Adresse : Vaybe, Cotonou, Bénin

Si vous estimez que vos droits ne sont pas respectés, vous pouvez saisir l'autorité de protection des données compétente dans votre pays.`,
  },
];

export default function ConfidentialitePage() {
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
          <Link href="/cgu" className="text-[13px] font-medium text-[#6B7280] transition hover:text-[#F2600C]">
            CGU →
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
            Politique de Confidentialité
          </h1>
          <p className="mt-3 text-[14px] text-[#9CA3AF]">Dernière mise à jour : {LAST_UPDATED}</p>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[#6B7280]">
            Votre vie privée compte. Cette page explique quelles données nous collectons, pourquoi et comment nous les protégeons.
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
          <p className="text-[13px] font-semibold text-[#0E0E10]">Questions sur vos données personnelles ?</p>
          <p className="mt-1 text-[13px] text-[#6B7280]">
            Écrivez-nous à{' '}
            <a href="mailto:contact@vaybe.io" className="font-medium text-[#F2600C] hover:underline">
              contact@vaybe.io
            </a>{' '}
            — nous répondons sous 30 jours.
          </p>
        </div>
      </main>

      <footer className="border-t border-[#E5E5E5] bg-white py-6 text-center text-[12px] text-[#9CA3AF]">
        © {new Date().getFullYear()} Vaybe. Tous droits réservés. —{' '}
        <Link href="/cgu" className="hover:text-[#F2600C]">CGU</Link>
      </footer>
    </div>
  );
}

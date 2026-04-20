'use client';

import { useState } from 'react';
// FIX-CONTRAST: lisibilite corrigee

const PRICING = {
  monthly: {
    starter: 'Gratuit',
    pro: '15 000 FCFA/mois',
    enterprise: 'Sur devis',
  },
  yearly: {
    starter: 'Gratuit',
    pro: '12 000 FCFA/mois',
    enterprise: 'Sur devis',
  },
};

const PLANS = [
  {
    key: 'starter',
    name: 'Starter',
    features: [
      '1 poste actif',
      '50 candidatures/mois',
      'Formulaire personnalisé',
      'Dashboard basique',
      'Support email',
    ],
    cta: 'Commencer gratuitement',
  },
  {
    key: 'pro',
    name: 'Pro',
    features: [
      'Postes illimités',
      'Candidatures illimitées',
      'Emails automatiques',
      'Export CSV',
      'Dashboard complet + statistiques',
      'Support prioritaire',
    ],
    cta: 'Commencer l\'essai gratuit',
    popular: true,
  },
  {
    key: 'enterprise',
    name: 'Entreprise',
    features: [
      'Tout le plan Pro',
      'Domaine personnalisé',
      'Intégrations sur mesure',
      'Onboarding dédié',
      'SLA garanti',
      'Account manager',
    ],
    cta: 'Nous contacter',
  },
];

/**
 * Pricing options with monthly/yearly switch.
 */
export default function PricingSection() {
  const [billingCycle, setBillingCycle] = useState('monthly');

  return (
    <section id="tarifs" className="bg-slate-50 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-black tracking-[-0.02em] text-slate-900 sm:text-4xl">
            Des tarifs simples et transparents
          </h2>
          <p className="mt-3 text-base text-slate-600 sm:text-lg">
            Sans engagement. Annulez quand vous voulez.
          </p>

          <div className="mx-auto mt-6 inline-flex rounded-full border border-slate-300 bg-white p-1">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                billingCycle === 'monthly' ? 'bg-teal-600 text-white' : 'text-slate-600'
              }`}
            >
              Mensuel
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('yearly')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                billingCycle === 'yearly' ? 'bg-teal-600 text-white' : 'text-slate-600'
              }`}
            >
              Annuel (-20%)
            </button>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {PLANS.map((plan) => {
            const isPopular = !!plan.popular;

            return (
              <article
                key={plan.name}
                className={`relative rounded-2xl border p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  isPopular
                    ? 'border-teal-600 bg-teal-600 shadow-2xl shadow-teal-200 lg:scale-[1.03]'
                    : 'border-slate-200 bg-white'
                }`}
              >
                {isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-amber-900">
                    Le plus populaire
                  </span>
                )}

                <h3 className={`text-xl font-extrabold ${isPopular ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                <p className={`mt-2 text-3xl font-black tracking-[-0.02em] ${isPopular ? 'text-white' : 'text-slate-900'}`}>
                  {PRICING[billingCycle][plan.key]}
                </p>

                <ul className={`mt-6 space-y-2 text-sm ${isPopular ? 'text-teal-100' : 'text-slate-600'}`}>
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span className={`mt-0.5 ${isPopular ? 'text-teal-200' : 'text-emerald-600'}`}>✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  className={`mt-8 w-full rounded-xl px-4 py-2.5 text-sm font-bold transition duration-300 ${
                    isPopular
                      ? 'bg-white text-teal-700 hover:bg-teal-50'
                      : 'border border-slate-300 text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {plan.cta}
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

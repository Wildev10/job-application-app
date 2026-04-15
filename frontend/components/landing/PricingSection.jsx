'use client';

import { useState } from 'react';

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
    <section id="tarifs" className="bg-white px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-black tracking-[-0.02em] text-[#111827] sm:text-4xl">
            Des tarifs simples et transparents
          </h2>
          <p className="mt-3 text-base text-[#6b7280] sm:text-lg">
            Sans engagement. Annulez quand vous voulez.
          </p>

          <div className="mx-auto mt-6 inline-flex rounded-full border border-[#d1d5db] bg-white p-1">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                billingCycle === 'monthly' ? 'bg-[#6366F1] text-white' : 'text-[#4b5563]'
              }`}
            >
              Mensuel
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('yearly')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                billingCycle === 'yearly' ? 'bg-[#6366F1] text-white' : 'text-[#4b5563]'
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
                className={`relative rounded-2xl border bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  isPopular
                    ? 'border-[#6366F1] shadow-2xl shadow-indigo-100 lg:scale-[1.03]'
                    : 'border-[#e5e7eb]'
                }`}
              >
                {isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#6366F1] px-3 py-1 text-xs font-bold text-white">
                    Le plus populaire
                  </span>
                )}

                <h3 className="text-xl font-extrabold text-[#111827]">{plan.name}</h3>
                <p className="mt-2 text-3xl font-black tracking-[-0.02em] text-[#111827]">
                  {PRICING[billingCycle][plan.key]}
                </p>

                <ul className="mt-6 space-y-2 text-sm text-[#4b5563]">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span className="mt-0.5 text-green-500">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  className={`mt-8 w-full rounded-xl px-4 py-2.5 text-sm font-bold transition duration-300 ${
                    isPopular
                      ? 'bg-[#6366F1] text-white hover:scale-105 hover:bg-[#4f46e5]'
                      : 'border border-[#d1d5db] text-[#111827] hover:bg-[#f9fafb]'
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

'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';

const PRICING = {
  monthly: {
    starter: 'Gratuit',
    starterSub: null,
    pro: '15 000 FCFA',
    proSub: '/mois',
    enterprise: 'Sur devis',
    enterpriseSub: null,
  },
  yearly: {
    starter: 'Gratuit',
    starterSub: null,
    pro: '12 000 FCFA',
    proSub: '/mois',
    enterprise: 'Sur devis',
    enterpriseSub: null,
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
    cta: "Commencer l'essai gratuit",
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
  const pricing = PRICING[billingCycle];

  return (
    <section id="tarifs" className="bg-white px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-[40px] font-bold tracking-[-0.02em] text-[#0E0E10] sm:text-[48px]">
            Des tarifs simples et transparents
          </h2>
          <p className="mt-4 text-[17px] text-[#6B7280]">
            Sans engagement. Annulez quand vous voulez.
          </p>

          {/* Toggle */}
          <div className="mx-auto mt-8 inline-flex rounded-full bg-[#0E0E10] p-1">
            {['monthly', 'yearly'].map((cycle) => (
              <button
                key={cycle}
                type="button"
                onClick={() => setBillingCycle(cycle)}
                className={`rounded-full px-5 py-2 text-[13px] font-semibold transition duration-200 ${
                  billingCycle === cycle ? 'bg-white text-[#0E0E10] shadow-sm' : 'text-[#9CA3AF] hover:text-white'
                }`}
              >
                {cycle === 'monthly' ? 'Mensuel' : 'Annuel (-20%)'}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
          {PLANS.map((plan) => {
            const isPopular = !!plan.popular;
            const priceValue = pricing[plan.key];
            const priceSub = pricing[`${plan.key}Sub`];

            return (
              <article
                key={plan.name}
                className={`relative rounded-[16px] border p-8 transition duration-200 hover:shadow-lg ${
                  isPopular
                    ? 'border-[#F2600C] bg-[#F2600C] shadow-xl lg:scale-[1.03]'
                    : 'border-[#E5E5E5] bg-white'
                }`}
              >
                {/* Popular badge */}
                {isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#FFD43B] px-4 py-1 text-[12px] font-bold text-[#0E0E10]">
                    Le plus populaire
                  </span>
                )}

                <h3 className={`text-[18px] font-bold ${isPopular ? 'text-white' : 'text-[#0E0E10]'}`}>
                  {plan.name}
                </h3>

                <div className="mt-3 flex items-baseline gap-1">
                  <span className={`text-[40px] font-bold leading-none tracking-[-0.02em] ${isPopular ? 'text-white' : 'text-[#0E0E10]'}`}>
                    {priceValue}
                  </span>
                  {priceSub && (
                    <span className={`text-[14px] ${isPopular ? 'text-white/70' : 'text-[#6B7280]'}`}>{priceSub}</span>
                  )}
                </div>

                <ul className="mt-7 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className={`flex items-start gap-2.5 text-[14px] ${isPopular ? 'text-white/90' : 'text-[#525252]'}`}>
                      <Check
                        size={15}
                        className={`mt-0.5 shrink-0 ${isPopular ? 'text-white' : 'text-[#F2600C]'}`}
                        strokeWidth={2.5}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  className={`mt-8 w-full rounded-[10px] px-4 py-3 text-[14px] font-bold transition duration-200 ${
                    isPopular
                      ? 'bg-white text-[#F2600C] hover:bg-[#FFF4EE]'
                      : plan.key === 'starter'
                        ? 'border border-[#F2600C] text-[#F2600C] hover:bg-[#FFF4EE]'
                        : 'border border-[#E5E5E5] text-[#525252] hover:bg-[#FAFAFA]'
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

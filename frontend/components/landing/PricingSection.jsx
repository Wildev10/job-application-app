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
          <h2 className="text-[40px] font-bold tracking-[-0.02em] text-[#0F172A] sm:text-[48px]">
            Des tarifs simples et transparents
          </h2>
          <p className="mt-4 text-[17px] text-[#64748B]">
            Sans engagement. Annulez quand vous voulez.
          </p>

          {/* Toggle */}
          <div className="mx-auto mt-8 inline-flex rounded-full bg-[#1E293B] p-1">
            {['monthly', 'yearly'].map((cycle) => (
              <button
                key={cycle}
                type="button"
                onClick={() => setBillingCycle(cycle)}
                className={`rounded-full px-5 py-2 text-[13px] font-semibold transition duration-200 ${
                  billingCycle === cycle ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#94A3B8] hover:text-white'
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
                    ? 'border-[#0F766E] bg-[#0F766E] shadow-xl lg:scale-[1.03]'
                    : 'border-[#E2E8F0] bg-white'
                }`}
              >
                {/* Popular badge */}
                {isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#FCD34D] px-4 py-1 text-[12px] font-bold text-[#92400E] whitespace-nowrap">
                    Le plus populaire
                  </span>
                )}

                <h3 className={`text-[18px] font-bold ${isPopular ? 'text-white' : 'text-[#0F172A]'}`}>
                  {plan.name}
                </h3>

                <div className="mt-3 flex items-baseline gap-1">
                  <span className={`text-[40px] font-bold leading-none tracking-[-0.02em] ${isPopular ? 'text-white' : 'text-[#0F172A]'}`}>
                    {priceValue}
                  </span>
                  {priceSub && (
                    <span className={`text-[14px] ${isPopular ? 'text-[#99F6E4]' : 'text-[#64748B]'}`}>{priceSub}</span>
                  )}
                </div>

                <ul className="mt-7 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className={`flex items-start gap-2.5 text-[14px] ${isPopular ? 'text-[#CCFBF1]' : 'text-[#475569]'}`}>
                      <Check
                        size={15}
                        className={`mt-0.5 shrink-0 ${isPopular ? 'text-[#5EEAD4]' : 'text-[#0D9488]'}`}
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
                      ? 'bg-white text-[#0F766E] hover:bg-[#F0FDF4]'
                      : plan.key === 'starter'
                        ? 'border border-[#0D9488] text-[#0D9488] hover:bg-[#F0FDF9]'
                        : 'border border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC]'
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

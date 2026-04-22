'use client';

import { Zap } from 'lucide-react';

/**
 * Render a compact visual badge for Starter or Pro plans.
 */
export default function PlanBadge({ plan = 'starter', size = 'md' }) {
  const isPro = plan === 'pro';
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  if (isPro) {
    return (
      <>
        <span className={`relative inline-flex items-center gap-1.5 overflow-hidden rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 font-medium text-white shadow-sm ${sizeClasses}`}>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-35"
            style={{
              background: 'linear-gradient(120deg, rgba(255,255,255,0) 25%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 75%)',
              backgroundSize: '220% 100%',
              animation: 'planBadgeShimmer 2.2s linear infinite',
            }}
          />
          <Zap size={size === 'sm' ? 12 : 14} className="relative" />
          <span className="relative">Pro ✦</span>
        </span>
        <style jsx>{`
          @keyframes planBadgeShimmer {
            0% {
              background-position: -140% 0;
            }
            100% {
              background-position: 180% 0;
            }
          }
        `}</style>
      </>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 font-medium text-slate-600 ${sizeClasses}`}>
      <Zap size={size === 'sm' ? 12 : 14} />
      <span>Starter</span>
    </span>
  );
}

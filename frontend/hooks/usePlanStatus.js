'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

const DEFAULT_PLAN_LIMITS = {
  plan: 'starter',
  is_pro: false,
  jobs: {
    limit: 2,
    current: 0,
    remaining: 2,
  },
  applications: {
    limit: 50,
    current_month: 0,
    remaining: 50,
  },
  features: {
    export_csv: false,
    advanced_stats: false,
    unlimited_jobs: false,
  },
};

const PlanStatusContext = createContext(null);

function normalizePlanLimits(payload) {
  return {
    plan: payload?.plan === 'pro' ? 'pro' : 'starter',
    is_pro: Boolean(payload?.is_pro),
    jobs: {
      limit: payload?.jobs?.limit ?? null,
      current: Number(payload?.jobs?.current || 0),
      remaining: payload?.jobs?.remaining ?? null,
    },
    applications: {
      limit: payload?.applications?.limit ?? null,
      current_month: Number(payload?.applications?.current_month || 0),
      remaining: payload?.applications?.remaining ?? null,
    },
    features: {
      export_csv: Boolean(payload?.features?.export_csv),
      advanced_stats: Boolean(payload?.features?.advanced_stats),
      unlimited_jobs: Boolean(payload?.features?.unlimited_jobs),
    },
  };
}

function useStandalonePlanStatus(enabled = true) {
  const [planLimits, setPlanLimits] = useState(DEFAULT_PLAN_LIMITS);
  const [loading, setLoading] = useState(true);

  const refreshPlanLimits = async () => {
    setLoading(true);

    try {
      const payload = await apiFetch('/company/plan-status', { method: 'GET' });
      setPlanLimits(normalizePlanLimits(payload));
    } catch (error) {
      console.error('Failed to load plan status:', error);
      setPlanLimits(DEFAULT_PLAN_LIMITS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    void refreshPlanLimits();
  }, [enabled]);

  const isPro = planLimits?.is_pro === true;
  const isStarter = !isPro;

  return {
    planLimits,
    loading,
    isPro,
    isStarter,
    canExportCSV: Boolean(planLimits?.features?.export_csv),
    jobsRemaining: planLimits?.jobs?.remaining ?? null,
    applicationsRemaining: planLimits?.applications?.remaining ?? null,
    refreshPlanLimits,
    // Backward-compatible alias used by existing pages.
    planStatus: planLimits,
  };
}

/**
 * Provide plan limits to admin pages with a single fetch at layout level.
 */
export function PlanStatusProvider({ children }) {
  const value = useStandalonePlanStatus();

  return <PlanStatusContext.Provider value={value}>{children}</PlanStatusContext.Provider>;
}

/**
 * Load plan limits for the authenticated company.
 */
export function usePlanStatus() {
  const contextValue = useContext(PlanStatusContext);
  const standaloneValue = useStandalonePlanStatus(contextValue === null);

  if (contextValue !== null) {
    return contextValue;
  }

  return standaloneValue;
}

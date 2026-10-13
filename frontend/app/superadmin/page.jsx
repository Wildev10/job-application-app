'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Building2,
  CreditCard,
  Percent,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import StatCard from '@/components/superadmin/StatCard';
import ActivityChart from '@/components/superadmin/ActivityChart';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';

/**
 * Render super admin dashboard with global stats and charts.
 */
export default function SuperAdminDashboardPage() {
  const { stats, loading } = useSuperAdmin();
  const [pieReady, setPieReady] = useState(false);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => setPieReady(true));
    return () => cancelAnimationFrame(frameId);
  }, []);

  const pieData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: 'Pro', value: stats.pro_count || 0, color: '#F2600C' },
      { name: 'Starter', value: stats.starter_count || 0, color: '#4B5563' },
    ];
  }, [stats]);

  const totalCompanies = stats?.total_companies || 0;
  const revenueThisMonth = Number(stats?.revenue_this_month || 0);
  const revenueLastMonth = Number(stats?.revenue_last_month || 0);
  const revenueDeltaPercent = revenueLastMonth > 0
    ? Number((((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100).toFixed(1))
    : 0;

  const formatFcfa = (value) =>
    `${new Intl.NumberFormat('fr-FR').format(value)} FCFA`;

  return (
    <section className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Vue d&apos;ensemble</h1>
          <p className="mt-0.5 text-sm text-gray-500">Métriques globales de la plateforme</p>
        </div>
        <p className="text-sm text-gray-400" suppressHydrationWarning>
          {new Date().toLocaleString('fr-FR')}
        </p>
      </div>

      {/* Row 1 — Company KPIs */}
      <div>
        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-gray-500">Entreprises</p>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total entreprises"
            value={totalCompanies}
            subtitle="Base clients globale"
            icon={Building2}
            color="emerald"
            loading={loading}
          />
          <StatCard
            title="Nouvelles cette semaine"
            value={stats?.new_companies_this_week ?? 0}
            subtitle="Créations 7 derniers jours"
            icon={TrendingUp}
            color="blue"
            loading={loading}
          />
          <StatCard
            title="Actives ce mois"
            value={stats?.active_companies_this_month ?? 0}
            subtitle="Ont reçu ≥1 candidature"
            icon={Activity}
            color="emerald"
            loading={loading}
          />
          <StatCard
            title="Taux Starter→Pro"
            value={`${stats?.conversion_rate ?? 0}%`}
            subtitle="Conversion commerciale"
            icon={Percent}
            color="emerald"
            loading={loading}
          />
        </div>
      </div>

      {/* Row 2 — Candidature KPIs */}
      <div>
        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-gray-500">Candidatures</p>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total candidatures"
            value={stats?.total_applications ?? 0}
            subtitle="Toutes périodes"
            icon={Users}
            color="amber"
            loading={loading}
          />
          <StatCard
            title="Ce mois-ci"
            value={stats?.applications_this_month ?? 0}
            subtitle="Activité mensuelle"
            icon={Users}
            color="amber"
            loading={loading}
          />
          <StatCard
            title="Cette semaine"
            value={stats?.applications_this_week ?? 0}
            subtitle="Activité hebdomadaire"
            icon={Users}
            color="amber"
            loading={loading}
          />
          <StatCard
            title="Moy. par entreprise"
            value={stats?.avg_applications_per_company ?? 0}
            subtitle="Engagement moyen"
            icon={Activity}
            color="blue"
            loading={loading}
          />
        </div>
      </div>

      {/* Row 3 — Revenue KPIs */}
      <div>
        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-gray-500">Revenus</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            title="Revenu total"
            value={formatFcfa(stats?.total_revenue ?? 0)}
            subtitle="Tous paiements approuvés"
            icon={Wallet}
            color="emerald"
            loading={loading}
          />
          <StatCard
            title="Ce mois-ci"
            value={formatFcfa(revenueThisMonth)}
            subtitle="Paiements approuvés"
            icon={CreditCard}
            color="emerald"
            loading={loading}
          />
          <StatCard
            title="Mois précédent"
            value={formatFcfa(revenueLastMonth)}
            subtitle="Comparaison mensuelle"
            icon={CreditCard}
            trend={revenueDeltaPercent}
            color="emerald"
            loading={loading}
          />
        </div>
      </div>

      {/* Charts row */}
      <div className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-xl border border-gray-700 bg-gray-900 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Inscriptions — 30 derniers jours</p>
          <div className="mt-4">
            <ActivityChart data={stats?.registrations_last_30_days || []} />
          </div>
        </article>

        <article className="rounded-xl border border-gray-700 bg-gray-900 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Candidatures — 30 derniers jours</p>
          <div className="mt-4">
            <ActivityChart data={stats?.applications_last_30_days || []} />
          </div>
        </article>
      </div>

      {/* Plan distribution + health cards */}
      <div className="grid gap-4 xl:grid-cols-5">
        <article className="min-w-0 rounded-xl border border-gray-700 bg-gray-900 p-5 xl:col-span-2">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Répartition des plans</p>
          <div className="mt-3 h-[240px]">
            {pieReady ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
                    {pieData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', color: '#F9FAFB' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full" aria-hidden />
            )}
          </div>
          <div className="-mt-4 text-center">
            <p className="text-xs uppercase tracking-widest text-gray-500">Total</p>
            <p className="text-2xl font-bold text-white">{totalCompanies}</p>
          </div>
          <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-400">
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#F2600C]" />
              Pro ({stats?.pro_count ?? 0})
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#4B5563]" />
              Starter ({stats?.starter_count ?? 0})
            </span>
          </div>
        </article>

        {/* Health indicators */}
        <div className="flex flex-col gap-4 xl:col-span-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Santé de la base</p>
          <article className="rounded-xl border border-red-500/20 bg-red-500/10 p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-red-300">Inactives depuis 30j</p>
            <p className="mt-2 text-3xl font-bold text-red-400">{stats?.companies_inactive_30_days ?? 0}</p>
            <p className="mt-1 text-xs text-red-300/60">Entreprises sans candidature depuis plus de 30 jours</p>
          </article>
          <article className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-300">Jamais actives</p>
            <p className="mt-2 text-3xl font-bold text-amber-400">{stats?.companies_with_zero_activity ?? 0}</p>
            <p className="mt-1 text-xs text-amber-300/60">Entreprises inscrites mais sans aucune candidature reçue</p>
          </article>
          <article className="rounded-xl border border-[#F2600C]/20 bg-[#F2600C]/10 p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-[#F2600C]">Actives ce mois</p>
            <p className="mt-2 text-3xl font-bold text-[#F2600C]">{stats?.active_companies_this_month ?? 0}</p>
            <p className="mt-1 text-xs text-[#F2600C]/60">Entreprises avec au moins une candidature ce mois-ci</p>
          </article>
        </div>
      </div>
    </section>
  );
}

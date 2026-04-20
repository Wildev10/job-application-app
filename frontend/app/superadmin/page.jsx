'use client';

import { useMemo } from 'react';
import { Building2, Percent, TrendingUp, Users } from 'lucide-react';
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

  const pieData = useMemo(() => {
    if (!stats) {
      return [];
    }

    return [
      { name: 'Pro', value: stats.pro_count || 0, color: '#6EE7B7' },
      { name: 'Starter', value: stats.starter_count || 0, color: '#4B5563' },
    ];
  }, [stats]);

  const totalCompanies = (stats?.total_companies || 0);

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold text-white">Vue d&apos;ensemble</h1>
        <p className="text-sm text-gray-400">{new Date().toLocaleString('fr-FR')}</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        <StatCard
          title="Total entreprises"
          value={stats?.total_companies ?? 0}
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
          title="Candidatures ce mois"
          value={stats?.applications_this_month ?? 0}
          subtitle="Activité mensuelle"
          icon={Users}
          color="amber"
          loading={loading}
        />
        <StatCard
          title="Taux conversion Starter→Pro"
          value={`${stats?.conversion_rate ?? 0}%`}
          subtitle="Conversion commerciale"
          icon={Percent}
          color="emerald"
          loading={loading}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        <article className="rounded-xl border border-gray-700 bg-gray-900 p-5 xl:col-span-3">
          <p className="text-xs uppercase tracking-widest text-gray-400">Inscriptions 30 derniers jours</p>
          <div className="mt-4">
            <ActivityChart data={stats?.registrations_last_30_days || []} />
          </div>
        </article>

        <article className="rounded-xl border border-gray-700 bg-gray-900 p-5 xl:col-span-2">
          <p className="text-xs uppercase tracking-widest text-gray-400">Répartition des plans</p>
          <div className="mt-3 h-[280px]">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={100} paddingAngle={2}>
                  {pieData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    border: '1px solid #374151',
                    color: '#F9FAFB',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="-mt-7 text-center">
            <p className="text-xs uppercase tracking-widest text-gray-500">Total</p>
            <p className="text-2xl font-bold text-white">{totalCompanies}</p>
          </div>
          <div className="mt-4 flex items-center justify-center gap-5 text-sm text-gray-400">
            <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#6EE7B7]" />Pro</span>
            <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#4B5563]" />Starter</span>
          </div>
        </article>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-xs uppercase tracking-widest text-red-300">Entreprises inactives (30j)</p>
          <p className="mt-2 text-2xl font-bold text-red-400">{stats?.companies_inactive_30_days ?? 0}</p>
        </article>
        <article className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
          <p className="text-xs uppercase tracking-widest text-amber-300">Jamais utilisé</p>
          <p className="mt-2 text-2xl font-bold text-amber-400">{stats?.companies_with_zero_activity ?? 0}</p>
        </article>
        <article className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
          <p className="text-xs uppercase tracking-widest text-emerald-300">Actives ce mois</p>
          <p className="mt-2 text-2xl font-bold text-emerald-400">{stats?.active_companies_this_month ?? 0}</p>
        </article>
      </div>
    </section>
  );
}

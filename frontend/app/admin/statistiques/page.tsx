'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Calendar, Lock, TrendingUp, Users } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { usePlanStatus } from '@/hooks/usePlanStatus';

type DayEntry = { date: string; label: string; count: number };

type StatsPayload = {
  applications: {
    total: number;
    this_month: number;
    this_week: number;
  };
  last_days: {
    days_count: number;
    max_days_allowed: number;
    data: DayEntry[];
  };
};

const DAY_OPTIONS = [
  { value: 7, label: '7 jours' },
  { value: 30, label: '30 jours' },
  { value: 90, label: '90 jours' },
];

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[#E5E5E5] bg-white px-3 py-2 shadow-lg">
      <p className="text-[12px] font-semibold text-[#0E0E10]">{label}</p>
      <p className="mt-0.5 text-[13px] font-bold text-[#F2600C]">
        {payload[0].value} candidature{payload[0].value !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

export default function StatistiquesPage() {
  const { isPro } = usePlanStatus();
  const [days, setDays] = useState(30);
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async (d: number) => {
    setLoading(true);
    try {
      const data = await apiFetch(`/applications/stats?days=${d}`, { method: 'GET' });
      setStats(data as StatsPayload);
    } catch {
      // keep previous data on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStats(days);
  }, [days, loadStats]);

  const kpis = stats
    ? [
        {
          label: 'Total candidatures',
          value: stats.applications.total,
          icon: Users,
          color: 'bg-[#FFF4EE] text-[#F2600C]',
        },
        {
          label: 'Ce mois-ci',
          value: stats.applications.this_month,
          icon: Calendar,
          color: 'bg-[#EFF6FF] text-[#3B82F6]',
        },
        {
          label: 'Cette semaine',
          value: stats.applications.this_week,
          icon: TrendingUp,
          color: 'bg-[#F0FDF4] text-[#22A559]',
        },
      ]
    : [];

  const chartData = stats?.last_days.data ?? [];
  const maxCount = Math.max(...chartData.map((d) => d.count), 1);

  // Thin out labels on small windows to avoid overlap
  const tickEvery = days <= 7 ? 1 : days <= 30 ? 5 : 10;
  const visibleTicks = chartData
    .filter((_, i) => i % tickEvery === 0 || i === chartData.length - 1)
    .map((d) => d.label);

  return (
    <section className="space-y-5">
      {/* Header */}
      <div className="rounded-2xl border border-[#E5E5E5] bg-white px-6 py-5 shadow-sm sm:px-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9CA3AF]">Analytique</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-[-0.025em] text-[#0E0E10]">Statistiques</h1>
        <p className="mt-1 text-sm text-[#6B7280]">Suivez l&apos;évolution de vos candidatures dans le temps.</p>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-[#E5E5E5] bg-white p-5">
                <div className="h-10 w-10 animate-pulse rounded-xl bg-[#F0F0F0]" />
                <div className="mt-4 h-8 w-14 animate-pulse rounded-lg bg-[#F0F0F0]" />
                <div className="mt-2 h-3 w-28 animate-pulse rounded-full bg-[#F0F0F0]" />
              </div>
            ))
          : kpis.map((kpi) => {
              const Icon = kpi.icon;
              return (
                <article key={kpi.label} className="rounded-xl border border-[#E5E5E5] bg-white p-5 shadow-sm">
                  <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${kpi.color}`}>
                    <Icon size={18} strokeWidth={2} />
                  </div>
                  <p className="mt-3 text-[32px] font-extrabold leading-none tracking-tight text-[#0E0E10]">{kpi.value}</p>
                  <p className="mt-1.5 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">{kpi.label}</p>
                </article>
              );
            })}
      </div>

      {/* Chart */}
      <div className="rounded-2xl border border-[#E5E5E5] bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9CA3AF]">Évolution</p>
            <h2 className="mt-0.5 text-base font-bold text-[#0E0E10]">Candidatures reçues</h2>
          </div>

          {/* Day selector */}
          <div className="flex items-center gap-1 rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] p-1">
            {DAY_OPTIONS.map((opt) => {
              const isLocked = !isPro && opt.value > 7;
              const isActive = days === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    if (!isLocked) setDays(opt.value);
                  }}
                  disabled={isLocked}
                  title={isLocked ? 'Disponible sur le plan Pro' : undefined}
                  className={`relative flex items-center gap-1 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition ${
                    isActive
                      ? 'bg-[#F2600C] text-white shadow-sm'
                      : isLocked
                        ? 'cursor-not-allowed text-[#D1D5DB]'
                        : 'text-[#6B7280] hover:bg-white hover:text-[#0E0E10]'
                  }`}
                >
                  {isLocked && <Lock size={10} className="shrink-0" />}
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="flex h-56 items-center justify-center">
            <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#F2600C]/30 border-t-[#F2600C]" />
          </div>
        ) : chartData.length === 0 || maxCount === 0 ? (
          <div className="flex h-56 flex-col items-center justify-center gap-2 text-center">
            <TrendingUp size={32} className="text-[#E5E5E5]" />
            <p className="text-sm font-medium text-[#9CA3AF]">Aucune candidature sur cette période</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F2600C" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#F2600C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
                ticks={visibleTicks}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#F2600C', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#F2600C"
                strokeWidth={2}
                fill="url(#areaGradient)"
                dot={false}
                activeDot={{ r: 4, fill: '#F2600C', stroke: 'white', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {!isPro && (
          <div className="mt-4 flex flex-col gap-2 rounded-xl border border-[#FFD5C2] bg-[#FFF4EE] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[13px] font-semibold text-[#F2600C]">
              <Lock size={13} className="mr-1 inline" />
              Historique 30 et 90 jours disponible sur le plan Pro
            </p>
            <Link
              href="/admin/upgrade"
              className="inline-flex w-fit items-center gap-1 rounded-lg bg-[#F2600C] px-3.5 py-2 text-[12px] font-bold text-white transition hover:bg-[#D44F08]"
            >
              Passer au Pro →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

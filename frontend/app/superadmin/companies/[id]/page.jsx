'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ActivityChart from '@/components/superadmin/ActivityChart';
import { useSuperAdminCompanies } from '@/hooks/useSuperAdminCompanies';

/**
 * Render a standalone company detail page for direct deep-link access.
 */
export default function SuperAdminCompanyDetailPage({ params }) {
  const { id } = params;
  const { fetchCompanyById } = useSuperAdminCompanies();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await fetchCompanyById(id);
        setData(response);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [fetchCompanyById, id]);

  if (loading) {
    return <p className="text-sm text-gray-400">Chargement...</p>;
  }

  if (!data?.company) {
    return <p className="text-sm text-red-400">Entreprise introuvable.</p>;
  }

  return (
    <section className="space-y-5">
      <Link href="/superadmin/companies" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white">
        <ArrowLeft size={14} /> Retour aux entreprises
      </Link>

      <article className="rounded-xl border border-gray-700 bg-gray-900 p-5">
        <p className="text-xs uppercase tracking-widest text-gray-500">Informations générales</p>
        <h1 className="mt-2 text-2xl font-bold text-white">{data.company.name}</h1>
        <p className="text-sm text-gray-400">{data.company.email}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-gray-700 bg-gray-800/40 p-3">
            <p className="text-xs uppercase tracking-widest text-gray-500">Plan</p>
            <p className="mt-1 text-sm font-semibold text-white">{data.company.plan || 'starter'}</p>
          </div>
          <div className="rounded-lg border border-gray-700 bg-gray-800/40 p-3">
            <p className="text-xs uppercase tracking-widest text-gray-500">Postes</p>
            <p className="mt-1 text-sm font-semibold text-white">{Array.isArray(data.jobs) ? data.jobs.length : 0}</p>
          </div>
          <div className="rounded-lg border border-gray-700 bg-gray-800/40 p-3">
            <p className="text-xs uppercase tracking-widest text-gray-500">Suspendue</p>
            <p className="mt-1 text-sm font-semibold text-white">{data.company.is_suspended ? 'Oui' : 'Non'}</p>
          </div>
        </div>
      </article>

      <article className="rounded-xl border border-gray-700 bg-gray-900 p-5">
        <p className="text-xs uppercase tracking-widest text-gray-500">Stats candidatures</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-gray-700 bg-gray-800/40 p-3">
            <p className="text-xs text-gray-500">Total</p>
            <p className="mt-1 text-lg font-semibold text-white">{data.applications_stats?.total || 0}</p>
          </div>
          <div className="rounded-lg border border-gray-700 bg-gray-800/40 p-3">
            <p className="text-xs text-gray-500">En cours</p>
            <p className="mt-1 text-lg font-semibold text-white">{data.applications_stats?.reviewing || 0}</p>
          </div>
          <div className="rounded-lg border border-gray-700 bg-gray-800/40 p-3">
            <p className="text-xs text-gray-500">Acceptées</p>
            <p className="mt-1 text-lg font-semibold text-white">{data.applications_stats?.accepted || 0}</p>
          </div>
          <div className="rounded-lg border border-gray-700 bg-gray-800/40 p-3">
            <p className="text-xs text-gray-500">Refusées</p>
            <p className="mt-1 text-lg font-semibold text-white">{data.applications_stats?.rejected || 0}</p>
          </div>
        </div>
      </article>

      <article className="rounded-xl border border-gray-700 bg-gray-900 p-5">
        <p className="text-xs uppercase tracking-widest text-gray-500">Dernières candidatures</p>
        <div className="mt-3 space-y-3">
          {Array.isArray(data.recent_applications) && data.recent_applications.length > 0 ? data.recent_applications.map((application) => (
            <div key={application.id} className="rounded-lg border border-gray-700 bg-gray-800/40 p-3">
              <p className="text-sm font-semibold text-white">{application.nom}</p>
              <p className="text-xs text-gray-400">{application.email} - {application.job?.title || 'Poste non renseigné'}</p>
            </div>
          )) : <p className="text-sm text-gray-500">Aucune candidature récente.</p>}
        </div>
      </article>

      <article className="rounded-xl border border-gray-700 bg-gray-900 p-5">
        <p className="text-xs uppercase tracking-widest text-gray-500">Historique activité</p>
        <div className="mt-3">
          <ActivityChart data={data.activity_last_30_days || []} height={260} />
        </div>
      </article>
    </section>
  );
}

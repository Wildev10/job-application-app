'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import Swal from 'sweetalert2';
import CompanyTable from '@/components/superadmin/CompanyTable';
import CompanyDetailModal from '@/components/superadmin/CompanyDetailModal';
import { useSuperAdminCompanies } from '@/hooks/useSuperAdminCompanies';
import { getSuperAdminToken } from '@/lib/superAdminAuth';

/**
 * Render super admin companies management page with filters, table and modal details.
 */
export default function SuperAdminCompaniesPage() {
  const {
    companies,
    pagination,
    loading,
    fetchCompanies,
    fetchCompanyById,
    suspendCompany,
    activateCompany,
    impersonateCompany,
  } = useSuperAdminCompanies();

  const [search, setSearch] = useState('');
  const [plan, setPlan] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('recent');
  const [page, setPage] = useState(1);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const params = useMemo(() => ({
    search,
    plan,
    status,
    sort,
    per_page: 20,
    page,
  }), [search, plan, status, sort, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchCompanies(params);
    }, 200);

    return () => clearTimeout(timer);
  }, [fetchCompanies, params]);

  const openDetails = async (company) => {
    try {
      const details = await fetchCompanyById(company.id);
      setSelectedCompany(details);
      setDetailOpen(true);
    } catch (error) {
      await Swal.fire({
        background: '#111827',
        color: '#F9FAFB',
        icon: 'error',
        title: 'Erreur',
        text: error instanceof Error ? error.message : 'Impossible de charger cette entreprise.',
      });
    }
  };

  const handleSuspend = async (company) => {
    const result = await Swal.fire({
      background: '#111827',
      color: '#F9FAFB',
      icon: 'warning',
      title: `Suspendre ${company.name} ?`,
      showCancelButton: true,
      confirmButtonText: 'Suspendre',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#374151',
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await suspendCompany(company.id);
      await fetchCompanies(params);
    } catch (error) {
      await Swal.fire({
        background: '#111827',
        color: '#F9FAFB',
        icon: 'error',
        title: 'Suspension impossible',
        text: error instanceof Error ? error.message : 'Impossible de suspendre cette entreprise.',
      });
    }
  };

  const handleActivate = async (company) => {
    try {
      await activateCompany(company.id);
      await fetchCompanies(params);
    } catch (error) {
      await Swal.fire({
        background: '#111827',
        color: '#F9FAFB',
        icon: 'error',
        title: 'Activation impossible',
        text: error instanceof Error ? error.message : 'Impossible d\'activer cette entreprise.',
      });
    }
  };

  const handleImpersonate = async (company) => {
    try {
      const response = await impersonateCompany(company.id);
      localStorage.setItem('impersonate_token', response.company_token);
      localStorage.setItem('impersonate_company_name', company.name);

      const currentSuperAdminToken = getSuperAdminToken();
      if (currentSuperAdminToken) {
        localStorage.setItem('sa_token_backup', currentSuperAdminToken);
      }

      window.open('/admin', '_blank', 'noopener,noreferrer');

      await Swal.fire({
        background: '#111827',
        color: '#F9FAFB',
        icon: 'success',
        title: 'Impersonation activée',
        text: `Un nouvel onglet admin a été ouvert pour ${company.name}.`,
        confirmButtonColor: '#10B981',
      });
    } catch (error) {
      await Swal.fire({
        background: '#111827',
        color: '#F9FAFB',
        icon: 'error',
        title: 'Impersonation impossible',
        text: error instanceof Error ? error.message : 'Impossible de démarrer l\'impersonation.',
      });
    }
  };

  return (
    <section className="space-y-5">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">Entreprises</h1>
          <span className="rounded-full border border-gray-700 bg-gray-800 px-2.5 py-1 text-xs text-gray-300">
            {pagination?.total || 0}
          </span>
        </div>

        <div className="relative w-full lg:w-64">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
            placeholder="Rechercher"
            className="w-full rounded-lg border border-gray-700 bg-gray-800 py-2.5 pl-9 pr-3 text-white placeholder:text-gray-500 outline-none focus:border-emerald-500"
          />
        </div>
      </header>

      <div className="grid gap-3 md:grid-cols-3">
        <select
          value={plan}
          onChange={(event) => {
            setPage(1);
            setPlan(event.target.value);
          }}
          className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white"
        >
          <option value="">Tous les plans</option>
          <option value="starter">Starter</option>
          <option value="pro">Pro</option>
        </select>

        <select
          value={status}
          onChange={(event) => {
            setPage(1);
            setStatus(event.target.value);
          }}
          className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white"
        >
          <option value="">Tous les statuts</option>
          <option value="active">Actives</option>
          <option value="inactive">Inactives</option>
          <option value="suspended">Suspendues</option>
        </select>

        <select
          value={sort}
          onChange={(event) => {
            setPage(1);
            setSort(event.target.value);
          }}
          className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white"
        >
          <option value="recent">Plus récentes</option>
          <option value="oldest">Plus anciennes</option>
          <option value="most_applications">Plus de candidatures</option>
        </select>
      </div>

      {loading ? (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5 text-sm text-gray-400">
          Chargement des entreprises...
        </div>
      ) : (
        <CompanyTable
          rows={companies}
          onView={openDetails}
          onSuspend={handleSuspend}
          onActivate={handleActivate}
          onImpersonate={handleImpersonate}
        />
      )}

      <footer className="flex items-center justify-between border-t border-gray-800 bg-gray-900 px-4 py-3 text-sm text-gray-400">
        <button
          type="button"
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          disabled={(pagination?.currentPage || 1) <= 1}
          className="rounded-md border border-gray-700 px-3 py-1.5 disabled:opacity-50"
        >
          Précédent
        </button>

        <p>Page {pagination?.currentPage || 1} / {pagination?.lastPage || 1}</p>

        <button
          type="button"
          onClick={() => setPage((prev) => prev + 1)}
          disabled={(pagination?.currentPage || 1) >= (pagination?.lastPage || 1)}
          className="rounded-md border border-gray-700 px-3 py-1.5 disabled:opacity-50"
        >
          Suivant
        </button>
      </footer>

      <CompanyDetailModal
        open={detailOpen}
        data={selectedCompany}
        onClose={() => setDetailOpen(false)}
        onSuspend={handleSuspend}
        onActivate={handleActivate}
        onImpersonate={handleImpersonate}
      />
    </section>
  );
}

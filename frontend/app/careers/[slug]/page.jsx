'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Briefcase, MapPin, Tag } from 'lucide-react';
import { apiFetch } from '@/lib/api';

/**
 * Public careers page listing all open positions for a given company.
 */
export default function CareersPage() {
  const params = useParams();
  const slug = typeof params?.slug === 'string' ? params.slug : '';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const load = async () => {
      setLoading(true);
      try {
        const payload = await apiFetch(`/jobs/public/${slug}`, { method: 'GET' });
        setData(payload);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [slug]);

  const primaryColor = useMemo(() => data?.company?.color || '#F2600C', [data]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAFAFA] px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-3xl space-y-4">
          <div className="h-12 w-48 animate-pulse rounded-xl bg-[#E5E5E5]" />
          <div className="h-4 w-72 animate-pulse rounded-full bg-[#E5E5E5]" />
          <div className="mt-8 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-[#E5E5E5]" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (notFound || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAFAFA] px-4">
        <div className="w-full max-w-md rounded-2xl border border-[#E5E5E5] bg-white p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F5F5F5]">
            <Briefcase size={24} className="text-[#9CA3AF]" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-[#0E0E10]">Entreprise introuvable</h1>
          <p className="mt-2 text-sm text-[#6B7280]">
            Le lien est invalide ou cette entreprise n&apos;existe pas.
          </p>
        </div>
      </main>
    );
  }

  const { company, jobs } = data;

  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      {/* Hero header */}
      <header className="border-b border-[#E5E5E5] bg-white">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-10 sm:px-6 sm:py-12">
          <div className="flex items-center gap-4">
            {company.logo ? (
              <Image
                src={company.logo}
                alt={company.name}
                width={56}
                height={56}
                unoptimized
                className="h-14 w-14 rounded-xl border border-[#E5E5E5] object-contain bg-white p-1"
              />
            ) : (
              <div
                className="flex h-14 w-14 items-center justify-center rounded-xl text-xl font-bold text-white"
                style={{ backgroundColor: primaryColor }}
              >
                {company.name?.slice(0, 1)?.toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#9CA3AF]">Offres d&apos;emploi</p>
              <h1 className="text-2xl font-extrabold tracking-[-0.02em] text-[#0E0E10]">{company.name}</h1>
              {company.tagline && (
                <p className="mt-0.5 text-sm text-[#6B7280]">{company.tagline}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold text-white"
              style={{ backgroundColor: primaryColor }}
            >
              {jobs.length} poste{jobs.length !== 1 ? 's' : ''} ouvert{jobs.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </header>

      {/* Job listings */}
      <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {jobs.length === 0 ? (
          <div className="rounded-2xl border border-[#E5E5E5] bg-white p-12 text-center">
            <Briefcase size={36} className="mx-auto text-[#D1D5DB]" />
            <p className="mt-4 text-base font-semibold text-[#374151]">Aucun poste ouvert pour le moment</p>
            <p className="mt-1 text-sm text-[#9CA3AF]">Revenez bientôt pour découvrir nos offres.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {jobs.map((job) => (
              <li key={job.slug}>
                <Link
                  href={`/apply/${company.slug}/${job.slug}`}
                  className="group flex flex-col gap-3 rounded-2xl border border-[#E5E5E5] bg-white p-5 shadow-sm transition hover:border-[#F2600C]/30 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex-1">
                    <h2 className="text-[15px] font-bold text-[#0E0E10] group-hover:text-[#F2600C] transition-colors">
                      {job.title}
                    </h2>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {job.role && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#F5F5F5] px-2.5 py-1 text-[11px] font-semibold text-[#6B7280]">
                          <Tag size={10} />
                          {job.role}
                        </span>
                      )}
                      {job.location && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#F5F5F5] px-2.5 py-1 text-[11px] font-semibold text-[#6B7280]">
                          <MapPin size={10} />
                          {job.location}
                        </span>
                      )}
                      {job.type_label && (
                        <span
                          className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold text-white"
                          style={{ backgroundColor: primaryColor }}
                        >
                          {job.type_label}
                        </span>
                      )}
                    </div>
                    {job.expires_at && (
                      <p className="mt-2 text-[11px] text-[#9CA3AF]">
                        Expire le {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(job.expires_at))}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-white transition group-hover:opacity-90"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Postuler
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-8 text-center text-xs text-[#D1D5DB]">
          Propulsé par{' '}
          <span className="font-semibold text-[#9CA3AF]">Vaybe Recrutement</span>
        </p>
      </section>
    </main>
  );
}

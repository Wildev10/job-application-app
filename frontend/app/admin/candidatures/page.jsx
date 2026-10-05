"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ApplicationList from '@/app/components/ApplicationList';

/**
 * Render the applications management page.
 */
function AdminCandidaturesContent() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get('job_id');
  const rawStatus = searchParams.get('status');
  const initialStatusFilter = rawStatus || 'all';

  return <ApplicationList initialJobId={jobId} initialStatusFilter={initialStatusFilter} />;
}

export default function AdminCandidaturesPage() {
  return (
    <Suspense fallback={<div className="text-sm text-[#737373]">Chargement...</div>}>
      <AdminCandidaturesContent />
    </Suspense>
  );
}

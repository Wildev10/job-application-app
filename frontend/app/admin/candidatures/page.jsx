"use client";

import { useSearchParams } from 'next/navigation';
import ApplicationList from '@/app/components/ApplicationList';

/**
 * Render the applications management page.
 */
export default function AdminCandidaturesPage() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get('job_id');

  return <ApplicationList initialJobId={jobId} />;
}

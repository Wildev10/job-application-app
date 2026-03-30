import ApplicationList from '@/app/components/ApplicationList';

/**
 * Render the admin page containing applications list and filters.
 */
export default function AdminPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <ApplicationList />
    </main>
  );
}

import ApplicationList from '@/app/components/ApplicationList';

/**
 * Render the admin page containing applications list and filters.
 */
export default function AdminPage() {
  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-[#fafaf9] px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-20">
      <ApplicationList />
    </main>
  );
}

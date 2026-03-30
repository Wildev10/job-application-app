import ApplicationForm from '@/app/components/ApplicationForm';

/**
 * Render the public application form page.
 */
export default function Home() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_#c7d2fe_0%,_#eef2ff_38%,_#f8fafc_100%)]" />
      <div className="pointer-events-none absolute -left-24 top-12 h-64 w-64 rounded-full bg-indigo-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-cyan-300/25 blur-3xl" />
      <ApplicationForm />
    </main>
  );
}

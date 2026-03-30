import ApplicationForm from '@/app/components/ApplicationForm';

/**
 * Render the public application form page.
 */
export default function Home() {
  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-[#fafaf9] px-4 py-14 sm:px-6 sm:py-16 lg:px-10 lg:py-24">
      <section className="mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-[1.05fr_1.35fr] lg:gap-20">
        <div className="space-y-8 lg:pr-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#737373]">
            Recrutement 2026
          </p>
          <h1 className="max-w-xl text-4xl font-extrabold tracking-[-0.02em] text-[#0f0f0f] sm:text-5xl lg:text-6xl">
            Construisez la suite avec nous.
          </h1>
          <p className="max-w-lg text-base font-medium text-[#525252] sm:text-lg">
            Nous recherchons des profils dev et designer qui aiment résoudre des problemes
            concrets, collaborer et faire evoluer les produits avec exigence.
          </p>
          <div className="h-px w-20 bg-[#d4d4d4]" />
          <p className="max-w-md text-sm text-[#737373]">
            Prenez quelques minutes pour presenter votre parcours. Nous lisons chaque candidature
            avec attention.
          </p>
        </div>

        <ApplicationForm />
      </section>
    </main>
  );
}

import Link from 'next/link';

/**
 * Final conversion section with high-contrast gradient background.
 */
export default function CTASection() {
  return (
    <section className="bg-teal-700 px-4 py-20 sm:px-6 lg:px-8">
      <div className="relative mx-auto w-full max-w-4xl text-center">
        <h2 className="text-3xl font-black tracking-[-0.02em] text-white sm:text-4xl">
          Prêt à transformer votre recrutement ?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-white/85 sm:text-lg">
          Rejoignez des centaines d&apos;entreprises qui recrutent mieux avec Vaybe Recrutement.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/register"
            className="rounded-2xl bg-teal-300 px-6 py-3 text-sm font-bold text-slate-950 transition duration-300 hover:bg-teal-200"
          >
            Créer mon compte gratuit
          </Link>
          <a
            href="mailto:contact@vaybe.tech"
            className="rounded-2xl border border-white/70 px-6 py-3 text-sm font-bold text-white transition duration-300 hover:bg-white/10"
          >
            Parler à un expert
          </a>
        </div>
      </div>
    </section>
  );
}

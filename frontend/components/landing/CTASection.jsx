import Link from 'next/link';

/**
 * Final conversion section with high-contrast dark background and orange CTA.
 */
export default function CTASection() {
  return (
    <section className="bg-[#0E0E10] px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto w-full max-w-3xl text-center">
        <h2 className="text-[40px] font-bold leading-tight tracking-[-0.02em] text-white sm:text-[48px]">
          Prêt à transformer votre recrutement ?
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-[17px] leading-relaxed text-[#9CA3AF]">
          Rejoignez des centaines d&apos;entreprises qui recrutent mieux avec Vaybe Recrutement.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/register"
            className="rounded-full bg-[#F2600C] px-8 py-4 text-[15px] font-bold text-white shadow-lg transition duration-200 hover:bg-[#D44F08] hover:shadow-xl"
          >
            Créer mon compte gratuit
          </Link>
          <a
            href="mailto:contact@vaybe.tech"
            className="rounded-full border border-white/20 px-8 py-4 text-[15px] font-semibold text-white transition duration-200 hover:bg-white/10"
          >
            Parler à un expert
          </a>
        </div>
      </div>
    </section>
  );
}

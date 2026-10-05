import Link from 'next/link';

/**
 * Final conversion section with high-contrast gradient background.
 */
export default function CTASection() {
  return (
    <section
      className="px-4 py-24 sm:px-6 lg:px-8 lg:py-28"
      style={{ background: 'linear-gradient(135deg, #0F766E 0%, #0D9488 100%)' }}
    >
      <div className="mx-auto w-full max-w-3xl text-center">
        <h2 className="text-[40px] font-bold leading-tight tracking-[-0.02em] text-white sm:text-[48px]">
          Prêt à transformer votre recrutement ?
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-[17px] leading-relaxed text-[#CCFBF1]">
          Rejoignez des centaines d&apos;entreprises qui recrutent mieux avec Vaybe Recrutement.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/register"
            className="rounded-full bg-white px-8 py-4 text-[15px] font-bold text-[#0D9488] shadow-lg transition duration-200 hover:shadow-xl hover:bg-[#F0FDF4]"
          >
            Créer mon compte gratuit
          </Link>
          <a
            href="mailto:contact@vaybe.tech"
            className="rounded-full border border-white/60 px-8 py-4 text-[15px] font-semibold text-white transition duration-200 hover:bg-white/10"
          >
            Parler à un expert
          </a>
        </div>
      </div>
    </section>
  );
}

import Link from 'next/link';

/**
 * Public marketing footer with product, company and legal links.
 */
export default function Footer() {
  return (
    <footer className="bg-gray-900 px-4 py-14 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6]">
              <span className="h-3 w-3 rounded-full border-2 border-white/90" />
              <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-white/90" />
            </span>
            <p className="text-lg font-extrabold">Vaybe Recrutement</p>
          </div>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-gray-300">
            La plateforme SaaS qui aide les startups, PMEs et entreprises en Afrique de l&apos;Ouest à recruter plus vite et avec plus de clarté.
          </p>

          <div className="mt-5 flex items-center gap-4 text-sm text-gray-300">
            <a href="#" className="transition hover:text-white">LinkedIn</a>
            <a href="#" className="transition hover:text-white">Twitter/X</a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-white">Produit</h3>
          <ul className="mt-4 space-y-2 text-sm text-gray-300">
            <li><a href="#fonctionnalites" className="transition hover:text-white">Fonctionnalités</a></li>
            <li><a href="#tarifs" className="transition hover:text-white">Tarifs</a></li>
            <li><a href="#comment-ca-marche" className="transition hover:text-white">Démo</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-white">Entreprise</h3>
          <ul className="mt-4 space-y-2 text-sm text-gray-300">
            <li><Link href="#" className="transition hover:text-white">À propos</Link></li>
            <li><Link href="#" className="transition hover:text-white">Contact</Link></li>
            <li><Link href="#" className="transition hover:text-white">Blog</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-white">Legal</h3>
          <ul className="mt-4 space-y-2 text-sm text-gray-300">
            <li><Link href="#" className="transition hover:text-white">CGU</Link></li>
            <li><Link href="#" className="transition hover:text-white">Politique de confidentialité</Link></li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-10 w-full max-w-7xl border-t border-gray-800 pt-6 text-xs text-gray-400 sm:text-sm">
        © 2025 Vaybe. Tous droits réservés.
      </div>
    </footer>
  );
}

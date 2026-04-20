import Link from 'next/link';
import { BriefcaseBusiness } from 'lucide-react';
// FIX-CONTRAST: lisibilite corrigee

/**
 * Public marketing footer with product, company and legal links.
 */
export default function Footer() {
  return (
    <footer className="bg-slate-950 px-4 py-14 text-slate-400 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-cyan-300 text-slate-950">
              <BriefcaseBusiness size={18} strokeWidth={2.5} />
            </span>
            <p className="text-lg font-extrabold">Vaybe Recrutement</p>
          </div>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
            La plateforme SaaS qui aide les startups, PMEs et entreprises en Afrique de l&apos;Ouest à recruter plus vite et avec plus de clarté.
          </p>

          <div className="mt-5 flex items-center gap-4 text-sm text-slate-400">
            <a href="#" className="transition hover:text-white">LinkedIn</a>
            <a href="#" className="transition hover:text-white">Twitter/X</a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-white">Produit</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-400">
            <li><a href="#fonctionnalites" className="transition hover:text-white">Fonctionnalités</a></li>
            <li><a href="#tarifs" className="transition hover:text-white">Tarifs</a></li>
            <li><a href="#comment-ca-marche" className="transition hover:text-white">Démo</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-white">Entreprise</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-400">
            <li><Link href="#" className="transition hover:text-white">À propos</Link></li>
            <li><Link href="#" className="transition hover:text-white">Contact</Link></li>
            <li><Link href="#" className="transition hover:text-white">Blog</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-white">Legal</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-400">
            <li><Link href="#" className="transition hover:text-white">CGU</Link></li>
            <li><Link href="#" className="transition hover:text-white">Politique de confidentialité</Link></li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-10 w-full max-w-7xl border-t border-slate-800 pt-6 text-xs text-slate-600 sm:text-sm">
        © 2025 Vaybe. Tous droits réservés.
      </div>
    </footer>
  );
}

import Link from 'next/link';
import { BriefcaseBusiness } from 'lucide-react';

/**
 * Public marketing footer with product, company and legal links.
 */
export default function Footer() {
  return (
    <footer className="bg-[#0E0E10] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">

        {/* Brand column */}
        <div>
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#F2600C] text-white">
              <BriefcaseBusiness size={17} strokeWidth={2.5} />
            </span>
            <span className="text-[15px] font-bold text-white">Vaybe Recrutement</span>
          </div>
          <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-[#9CA3AF]">
            La plateforme SaaS qui aide les startups, PMEs et entreprises en Afrique de l&apos;Ouest à recruter plus vite et avec plus de clarté.
          </p>
          <div className="mt-5 flex items-center gap-4">
            <a href="#" className="text-[14px] text-[#9CA3AF] transition duration-200 hover:text-white">LinkedIn</a>
            <a href="#" className="text-[14px] text-[#9CA3AF] transition duration-200 hover:text-white">Twitter/X</a>
          </div>
        </div>

        {/* Produit */}
        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[#525252]">Produit</h3>
          <ul className="mt-4 space-y-3">
            <li><a href="#fonctionnalites" className="text-[14px] text-[#9CA3AF] transition duration-200 hover:text-white">Fonctionnalités</a></li>
            <li><a href="#tarifs" className="text-[14px] text-[#9CA3AF] transition duration-200 hover:text-white">Tarifs</a></li>
            <li><a href="#comment-ca-marche" className="text-[14px] text-[#9CA3AF] transition duration-200 hover:text-white">Démo</a></li>
          </ul>
        </div>

        {/* Entreprise */}
        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[#525252]">Entreprise</h3>
          <ul className="mt-4 space-y-3">
            <li><Link href="#" className="text-[14px] text-[#9CA3AF] transition duration-200 hover:text-white">À propos</Link></li>
            <li><Link href="#" className="text-[14px] text-[#9CA3AF] transition duration-200 hover:text-white">Contact</Link></li>
            <li><Link href="#" className="text-[14px] text-[#9CA3AF] transition duration-200 hover:text-white">Blog</Link></li>
          </ul>
        </div>

        {/* Légal */}
        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[#525252]">Légal</h3>
          <ul className="mt-4 space-y-3">
            <li><Link href="#" className="text-[14px] text-[#9CA3AF] transition duration-200 hover:text-white">CGU</Link></li>
            <li><Link href="#" className="text-[14px] text-[#9CA3AF] transition duration-200 hover:text-white">Politique de confidentialité</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mx-auto mt-12 w-full max-w-7xl border-t border-[#1A1A1C] pt-6">
        <p className="text-[13px] text-[#525252]">
          © {new Date().getFullYear()} Vaybe. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}

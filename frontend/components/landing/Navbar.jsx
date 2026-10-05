'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BriefcaseBusiness, Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { href: '#fonctionnalites', label: 'Fonctionnalités' },
  { href: '#comment-ca-marche', label: 'Comment ça marche' },
  { href: '#tarifs', label: 'Tarifs' },
  { href: '#temoignages', label: 'Témoignages' },
];

/**
 * Public landing navigation with sticky behavior and mobile drawer.
 */
export default function Navbar() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 bg-white/95 backdrop-blur-md transition-all duration-200 ${
        isScrolled ? 'border-b border-[#E2E8F0] shadow-sm' : 'border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex h-[68px] w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 text-[#0F172A]">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#0D9488] text-white">
            <BriefcaseBusiness size={18} strokeWidth={2.5} />
          </span>
          <span className="text-[15px] font-semibold tracking-[-0.01em] sm:text-base">Vaybe Recrutement</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[14px] font-medium text-[#475569] transition duration-200 hover:text-[#0D9488]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/login"
            className="text-[14px] font-medium text-[#0F172A] transition duration-200 hover:text-[#0D9488]"
          >
            Se connecter
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-[#0D9488] px-6 py-2.5 text-[14px] font-semibold text-white transition duration-200 hover:bg-[#0F766E]"
          >
            Essayer gratuitement
          </Link>
        </div>

        {/* Mobile burger */}
        <button
          type="button"
          onClick={() => setIsDrawerOpen((prev) => !prev)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#475569] transition hover:bg-[#F1F5F9] lg:hidden"
          aria-label="Ouvrir le menu"
        >
          {isDrawerOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        className={`overflow-hidden border-t border-[#E2E8F0] bg-white transition-all duration-200 lg:hidden ${
          isDrawerOpen ? 'max-h-96' : 'max-h-0'
        }`}
      >
        <div className="space-y-4 px-4 py-5 sm:px-6">
          <nav className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsDrawerOpen(false)}
                className="text-[14px] font-medium text-[#475569] transition hover:text-[#0D9488]"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="grid grid-cols-1 gap-2 pt-2 sm:grid-cols-2">
            <Link
              href="/login"
              onClick={() => setIsDrawerOpen(false)}
              className="rounded-full border border-[#E2E8F0] px-4 py-2.5 text-center text-[14px] font-medium text-[#0F172A]"
            >
              Se connecter
            </Link>
            <Link
              href="/register"
              onClick={() => setIsDrawerOpen(false)}
              className="rounded-full bg-[#0D9488] px-4 py-2.5 text-center text-[14px] font-semibold text-white"
            >
              Essayer gratuitement
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

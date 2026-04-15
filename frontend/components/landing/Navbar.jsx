'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

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
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b border-transparent bg-white/90 backdrop-blur transition-all duration-300 ${
        isScrolled ? 'shadow-[0_8px_22px_-18px_rgba(15,23,42,0.45)]' : ''
      }`}
    >
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-[#111827]">
          <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6]">
            <span className="h-3 w-3 rounded-full border-2 border-white/90" />
            <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-white/90" />
          </span>
          <span className="text-base font-extrabold tracking-[-0.02em] sm:text-lg">Vaybe Recrutement</span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[#4b5563] transition duration-300 hover:text-[#6366F1]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/login"
            className="rounded-xl border border-[#6366F1] px-4 py-2 text-sm font-semibold text-[#6366F1] transition duration-300 hover:bg-[#eef2ff]"
          >
            Se connecter
          </Link>
          <Link
            href="/register"
            className="rounded-xl bg-[#6366F1] px-4 py-2 text-sm font-semibold text-white transition duration-300 hover:scale-105 hover:bg-[#4f46e5]"
          >
            Essayer gratuitement
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setIsDrawerOpen((previous) => !previous)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#e5e7eb] text-xl text-[#374151] transition hover:bg-[#f8fafc] lg:hidden"
          aria-label="Ouvrir le menu"
        >
          {isDrawerOpen ? '×' : '☰'}
        </button>
      </div>

      <div
        className={`overflow-hidden border-t border-[#eef2ff] bg-white transition-all duration-300 lg:hidden ${
          isDrawerOpen ? 'max-h-80' : 'max-h-0'
        }`}
      >
        <div className="space-y-4 px-4 py-5 sm:px-6">
          <nav className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsDrawerOpen(false)}
                className="text-sm font-medium text-[#374151] transition hover:text-[#6366F1]"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Link
              href="/login"
              onClick={() => setIsDrawerOpen(false)}
              className="rounded-xl border border-[#6366F1] px-4 py-2 text-center text-sm font-semibold text-[#6366F1]"
            >
              Se connecter
            </Link>
            <Link
              href="/register"
              onClick={() => setIsDrawerOpen(false)}
              className="rounded-xl bg-[#6366F1] px-4 py-2 text-center text-sm font-semibold text-white"
            >
              Essayer gratuitement
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

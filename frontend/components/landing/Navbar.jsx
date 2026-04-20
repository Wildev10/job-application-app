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
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b border-transparent bg-white/95 backdrop-blur-xl transition-all duration-300 ${
        isScrolled ? 'border-slate-200 shadow-[0_14px_30px_-24px_rgba(15,23,42,0.35)]' : ''
      }`}
    >
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-slate-900">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-cyan-300 text-slate-950">
            <BriefcaseBusiness size={20} strokeWidth={2.5} />
          </span>
          <span className="text-base font-extrabold tracking-[-0.02em] sm:text-lg">Vaybe Recrutement</span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 transition duration-300 hover:text-teal-700"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/login"
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition duration-300 hover:border-teal-400 hover:text-teal-700"
          >
            Se connecter
          </Link>
          <Link
            href="/register"
            className="rounded-xl bg-teal-500 px-4 py-2 text-sm font-semibold text-slate-950 transition duration-300 hover:bg-teal-400"
          >
            Essayer gratuitement
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setIsDrawerOpen((previous) => !previous)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 lg:hidden"
          aria-label="Ouvrir le menu"
        >
          {isDrawerOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <div
        className={`overflow-hidden border-t border-slate-200 bg-white transition-all duration-300 lg:hidden ${
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
                className="text-sm font-medium text-slate-700 transition hover:text-teal-700"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Link
              href="/login"
              onClick={() => setIsDrawerOpen(false)}
              className="rounded-xl border border-slate-300 px-4 py-2 text-center text-sm font-semibold text-slate-700"
            >
              Se connecter
            </Link>
            <Link
              href="/register"
              onClick={() => setIsDrawerOpen(false)}
              className="rounded-xl bg-teal-500 px-4 py-2 text-center text-sm font-semibold text-slate-950"
            >
              Essayer gratuitement
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

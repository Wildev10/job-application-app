import type { Metadata } from "next";
import Link from 'next/link';
import { Plus_Jakarta_Sans } from 'next/font/google';
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Job Application App',
  description: 'Plateforme de gestion des candidatures',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${plusJakarta.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground">
        <header className="fixed inset-x-0 top-0 z-50 border-b border-[#e5e5e5] bg-[#fafaf9]/95 backdrop-blur">
          <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" className="text-sm font-extrabold tracking-[-0.02em] text-[#0f0f0f]">
              JOB APPLICATION
            </Link>
            <nav className="flex items-center gap-6 text-sm font-medium text-[#525252]">
              <Link href="/" className="hover:text-[#0f0f0f]">
                Candidature
              </Link>
              <Link href="/admin" className="hover:text-[#0f0f0f]">
                Admin
              </Link>
            </nav>
          </div>
        </header>
        <div className="pt-14">{children}</div>
      </body>
    </html>
  );
}

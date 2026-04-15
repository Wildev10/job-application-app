import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from 'next/font/google';
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Vaybe Recrutement',
  description: 'Plateforme SaaS de gestion des candidatures pour les entreprises',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${plusJakarta.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}

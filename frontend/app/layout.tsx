import type { Metadata } from "next";
import { Inter, Sora } from 'next/font/google';
import "./globals.css";

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const sora = Sora({
  variable: '--font-sora',
  subsets: ['latin'],
  weight: ['600', '700', '800'],
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
    <html lang="fr" data-scroll-behavior="smooth" className={`${inter.variable} ${sora.variable} h-full antialiased`}>
      <body className={`${inter.className} min-h-full bg-background text-foreground`}>
        {children}
      </body>
    </html>
  );
}

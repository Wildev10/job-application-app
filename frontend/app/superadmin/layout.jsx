'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/superadmin/Sidebar';
import { getSuperAdmin } from '@/lib/superAdminAuth';

function resolveTitle(pathname) {
  if (pathname === '/superadmin') {
    return 'Vue d\'ensemble';
  }
  if (pathname === '/superadmin/companies') {
    return 'Entreprises';
  }
  if (pathname.startsWith('/superadmin/companies/')) {
    return 'Détail entreprise';
  }
  if (pathname === '/superadmin/broadcast') {
    return 'Broadcast';
  }
  return 'Super Admin';
}

/**
 * Render dedicated super admin shell with fixed sidebar and live topbar clock.
 */
export default function SuperAdminLayout({ children }) {
  const pathname = usePathname();
  const [now, setNow] = useState(() => new Date());
  const [superAdminName, setSuperAdminName] = useState('Super Admin');

  const isLoginRoute = pathname === '/superadmin/login';

  useEffect(() => {
    if (isLoginRoute) {
      return;
    }

    // Defer client-only localStorage read to avoid hydration mismatch.
    const nameTimer = setTimeout(() => {
      const profile = getSuperAdmin();
      if (profile?.name) {
        setSuperAdminName(profile.name);
      }
    }, 0);

    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => {
      clearTimeout(nameTimer);
      clearInterval(interval);
    };
  }, [isLoginRoute]);

  const currentTitle = useMemo(() => resolveTitle(pathname), [pathname]);

  if (isLoginRoute) {
    return children;
  }

  return (
    <div className="min-h-screen bg-[#0A0F1E]">
      <Sidebar />

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-gray-800 bg-gray-900/50 px-5 backdrop-blur">
          <p className="font-semibold text-white">{currentTitle}</p>
          <div className="flex items-center gap-4 text-sm font-mono text-gray-400">
            <span suppressHydrationWarning>{now.toLocaleString('fr-FR')}</span>
            <span suppressHydrationWarning>{superAdminName}</span>
          </div>
        </header>

        <main className="p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

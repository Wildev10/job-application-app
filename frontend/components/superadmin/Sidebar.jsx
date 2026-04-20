'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { Building2, LayoutDashboard, LogOut, Megaphone, Shield } from 'lucide-react';
import { superAdminLogout } from '@/lib/superAdminAuth';
import { saFetch } from '@/lib/superAdminApi';

const NAV_ITEMS = [
  {
    section: 'TABLEAU DE BORD',
    links: [
      { href: '/superadmin', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    section: 'GESTION',
    links: [
      { href: '/superadmin/companies', label: 'Entreprises', icon: Building2 },
      { href: '/superadmin/broadcast', label: 'Broadcast', icon: Megaphone },
    ],
  },
];

/**
 * Render the fixed super admin dark sidebar and navigation links.
 */
export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Se déconnecter ?',
      text: 'Votre session Super Admin va être fermée.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, déconnecter',
      cancelButtonText: 'Annuler',
      background: '#111827',
      color: '#F9FAFB',
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#374151',
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await saFetch('/superadmin/auth/logout', { method: 'POST' });
    } catch {
      // Clear local session even if API logout fails.
    }

    superAdminLogout();
    router.push('/superadmin/login');
  };

  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 flex-col border-r border-gray-800 bg-[#0D1326] px-4 py-5 lg:flex">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-emerald-500/20 p-2 text-emerald-400">
          <Shield size={20} />
        </div>
        <div>
          <p className="text-sm font-bold text-white">Super Admin</p>
          <p className="text-xs text-gray-500">Vaybe Platform</p>
        </div>
      </div>

      <div className="mt-6 inline-flex w-fit items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
        ● CONNECTÉ
      </div>

      <nav className="mt-8 flex-1 space-y-6">
        {NAV_ITEMS.map((group) => (
          <div key={group.section}>
            <p className="mb-2 px-2 text-xs uppercase tracking-widest text-gray-500">{group.section}</p>
            <div className="space-y-1">
              {group.links.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all',
                      isActive
                        ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white',
                    ].join(' ')}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-gray-800 pt-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-400 transition hover:bg-white/5 hover:text-red-400"
        >
          <LogOut size={16} />
          <span>Se déconnecter</span>
        </button>
      </div>
    </aside>
  );
}

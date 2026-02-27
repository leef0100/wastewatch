'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useStore } from '@/stores/useStore';
import { WHOP_URL, APP_NAME } from '@/lib/constants';
import {
  LayoutDashboard,
  AlertTriangle,
  Building2,
  Users,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Eye,
  Scale,
  ExternalLink,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Command Center', icon: LayoutDashboard },
  { href: '/dashboard/investigations', label: 'Investigations', icon: Scale },
  { href: '/dashboard/flags', label: 'Red Flags', icon: AlertTriangle },
  { href: '/dashboard/departments', label: 'Departments', icon: Building2 },
  { href: '/dashboard/vendors', label: 'Vendors & Contracts', icon: Users },
  { href: '/dashboard/reports', label: 'Reports & Export', icon: FileText },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const sidebarOpen = useStore((s) => s.sidebarOpen);
  const setSidebarOpen = useStore((s) => s.setSidebarOpen);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 flex flex-col',
        sidebarOpen ? 'w-64' : 'w-[72px]'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-sidebar-border shrink-0">
        <div className="flex items-center justify-center w-9 h-9 rounded-md bg-gold">
          <Eye className="w-4 h-4 text-white" />
        </div>
        {sidebarOpen && (
          <div className="flex flex-col">
            <span className="font-semibold text-sm leading-tight text-white">{APP_NAME}</span>
            <span className="text-[10px] text-sidebar-foreground/60">Fraud Detection</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-white border-l-2 border-gold -ml-px'
                  : 'text-sidebar-foreground hover:text-white hover:bg-sidebar-accent/50'
              )}
            >
              <item.icon className={cn('w-5 h-5 shrink-0', isActive && 'text-gold')} />
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade button */}
      {sidebarOpen && (
        <div className="px-3 py-3 border-t border-sidebar-border shrink-0">
          <a
            href={WHOP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full h-9 rounded-md bg-gold text-white text-sm font-medium hover:bg-gold/90 transition-colors"
          >
            Upgrade
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Collapse toggle */}
      <div className="px-3 py-3 border-t border-sidebar-border shrink-0">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center justify-center w-full h-9 rounded-md text-sidebar-foreground hover:text-white hover:bg-sidebar-accent/50 transition-colors"
        >
          {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>
    </aside>
  );
}

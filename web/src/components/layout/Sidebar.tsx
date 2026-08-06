"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Ticket, User, Users, FileText, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

import { Logo } from '@/components/branding/Logo';

export type Role = 'customer' | 'agent' | 'admin';

export interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  roles: Role[];
}

const navConfig: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['customer', 'agent', 'admin'] },
  { title: 'Tickets', href: '/dashboard/tickets', icon: Ticket, roles: ['customer', 'agent', 'admin'] },
  { title: 'Agents', href: '/dashboard/agents', icon: Users, roles: ['admin'] },
  { title: 'Analytics', href: '/dashboard/analytics', icon: FileText, roles: ['admin'] },
  { title: 'Settings', href: '/dashboard/settings', icon: Settings, roles: ['admin'] },
  { title: 'Profile', href: '/profile', icon: User, roles: ['customer', 'agent', 'admin'] },
];

export function Sidebar({ currentRole = 'agent' }: { currentRole?: Role }) {
  const pathname = usePathname();

  const filteredNav = navConfig.filter(item => item.roles.includes(currentRole));

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      window.location.href = '/login';
    }
  };

  return (
    <aside className="w-64 bg-sidebar flex flex-col h-screen sticky top-0 border-r border-sidebar-border text-sidebar-foreground">
      <div className="p-6 flex items-center">
        <Logo variant="dark" size="md" />
      </div>

      <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {filteredNav.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-primary-foreground" : "text-sidebar-foreground/70")} />
              {item.title}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-sidebar-border/10">
        <button 
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/80 hover:bg-destructive/10 hover:text-destructive transition-colors"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}

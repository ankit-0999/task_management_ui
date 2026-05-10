'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, LayoutDashboard, FolderKanban, CheckSquare, LogOut, ChevronRight, UserCircle2 } from 'lucide-react';
import { getStoredUserRole, getStoredUserName, UserRole } from '@/lib/auth';
import api from '@/lib/api';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userName?: string;
}

export function DashboardLayout({ children, userName = 'User' }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [resolvedUserName, setResolvedUserName] = useState(userName);
  const router = useRouter();
  const pathname = usePathname();
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    const hydrateUserName = async () => {
      if (isMounted) {
        setResolvedUserName(userName);
      }

      const storedRole = getStoredUserRole();
      if (storedRole && isMounted) {
        setUserRole(storedRole);
      }

      const storedName = getStoredUserName();
      if (storedName) {
        if (isMounted) {
          setResolvedUserName(storedName);
        }
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }

      try {
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
          return;
        }

        const payload = JSON.parse(atob(tokenParts[1]));
        const userId = Number(payload.sub);
        if (!Number.isFinite(userId)) {
          return;
        }

        const response = await api.get('/users/');
        const users = Array.isArray(response.data) ? response.data : [];
        const currentUser = users.find((u: any) => Number(u.id) === userId);
        if (currentUser?.name && isMounted) {
          localStorage.setItem('user_name', currentUser.name);
          setResolvedUserName(currentUser.name);
        }
      } catch {
        // Keep fallback label when user name cannot be resolved.
      }
    };

    hydrateUserName();

    return () => {
      isMounted = false;
    };
  }, [userName]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };

    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [profileMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user_name');
    router.push('/login');
  };

  const displayName = resolvedUserName || userName;
  const isAdmin = userRole === 'Admin';
  const initials = displayName?.trim()?.charAt(0)?.toUpperCase() || 'U';

  // Role-based navigation items
  const getNavItems = () => {
    const baseItems = [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard, description: 'Overview and insights' },
      ...(isAdmin
        ? [{ name: 'Project Management', href: '/projects', icon: FolderKanban, description: 'Manage all projects' }]
        : []),
      { name: 'Task Management', href: '/tasks', icon: CheckSquare, description: 'Track assigned work' },
    ];

    return baseItems;
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-transparent">
      <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/70 bg-white/90 backdrop-blur-xl shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
        <div className="mx-auto flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden inline-flex items-center justify-center rounded-xl p-2 text-gray-600 hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7199D6] to-indigo-500 text-white font-black shadow-lg shadow-blue-200/60">
                T
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-950 leading-none">Task Manager</p>
                <p className="mt-0.5 text-[11px] text-gray-500">Disha-style workspace</p>
              </div>
            </Link>
          </div>

          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setProfileMenuOpen((prev) => !prev)}
              className="inline-flex items-center justify-center rounded-full p-1 text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Open profile menu"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#7199D6] to-indigo-500 text-white font-bold shadow-md shadow-blue-200/60">
                {initials}
              </div>
            </button>

            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-gray-200 bg-white shadow-xl p-3 z-50">
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                  <UserCircle2 className="h-8 w-8 text-[#7199D6]" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-950">{displayName}</p>
                    <p className="truncate text-xs text-gray-500">{isAdmin ? 'Admin' : 'Member'}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-white via-gray-50 to-gray-100 border-r border-gray-200/70 shadow-[0_12px_40px_rgba(15,23,42,0.08)] transform transition-transform duration-300 ease-in-out md:translate-x-0 md:top-16 md:h-[calc(100vh-4rem)] ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">


          <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center rounded-2xl px-4 py-3.5 text-sm font-medium transition-all duration-300 border ${isActive
                    ? 'border-transparent bg-gradient-to-r from-[#7199D6] to-indigo-600 text-white shadow-lg shadow-blue-200/60'
                    : 'border-transparent text-gray-700 hover:bg-white hover:border-gray-200 hover:shadow-sm'
                    }`}
                >
                  <div className={`mr-3 flex h-10 w-10 items-center justify-center rounded-xl transition-all ${isActive
                    ? 'bg-white/15'
                    : 'bg-gray-100 group-hover:bg-blue-50'
                    }`}>
                    <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-[#7199D6]'}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <span className="block truncate">{item.name}</span>
                      <ChevronRight className={`h-4 w-4 ${isActive ? 'text-white/80' : 'text-gray-400'}`} />
                    </div>
                    <p className={`mt-0.5 text-xs ${isActive ? 'text-white/85' : 'text-gray-500'}`}>
                      {item.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-gray-200/70 p-4">
            <div className="rounded-2xl bg-white/90 border border-gray-200/70 p-4 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">Signed in as</p>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#7199D6] to-indigo-500 text-white font-bold">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-950">{displayName}</p>
                  <p className="truncate text-xs text-gray-500">{isAdmin ? 'Admin access' : 'Member access'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="min-h-screen pt-16 md:pl-72">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur-xl shadow-[0_-8px_30px_rgba(15,23,42,0.06)] pb-safe">
        <div className="grid grid-cols-3 gap-1 px-2 py-2">
          {navItems.slice(0, 3).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-[11px] font-medium transition-colors ${isActive ? 'bg-blue-50 text-[#7199D6]' : 'text-gray-500'}`}
              >
                <Icon className="h-5 w-5" />
                <span className="mt-1 truncate">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

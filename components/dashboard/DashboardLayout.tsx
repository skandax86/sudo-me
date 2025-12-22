'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { DomainId, getSidebarItems, SidebarItem, getDomainConfig } from '@/lib/domains';

// ============================================================================
// CONTEXT
// ============================================================================

interface DashboardContextValue {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  userDomains: DomainId[];
  userName: string;
  currentStreak: number;
  isLoading: boolean;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardLayout');
  }
  return context;
}

// ============================================================================
// SIDEBAR COMPONENT
// ============================================================================

interface SidebarProps {
  items: SidebarItem[];
  collapsed: boolean;
  onToggle: () => void;
  userName: string;
  streak: number;
}

function Sidebar({ items, collapsed, onToggle, userName, streak }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-white border-r border-slate-200 shadow-sm z-40 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo / Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl">🚀</span>
            <span className="font-bold text-xl bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              Tracky
            </span>
          </Link>
        )}
        {collapsed && (
          <Link href="/dashboard" className="mx-auto">
            <span className="text-2xl">🚀</span>
          </Link>
        )}
        <button
          onClick={onToggle}
          className={`p-2 hover:bg-slate-100 rounded-lg transition ${collapsed ? 'mx-auto' : ''}`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* User Info */}
      {!collapsed && (
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
              {userName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-800 truncate">{userName || 'User'}</p>
              <p className="text-xs text-slate-500">
                🔥 {streak} day streak
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Items */}
      <nav className="p-2 flex-1 overflow-y-auto">
        <ul className="space-y-1">
          {items.map((item) => {
            const isActive = item.isActive || pathname === item.href;
            
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-violet-100 text-violet-700 font-medium'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  } ${collapsed ? 'justify-center' : ''}`}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="text-xl">{item.icon}</span>
                  {!collapsed && (
                    <span className="flex-1">{item.label}</span>
                  )}
                  {!collapsed && isActive && (
                    <span className="w-2 h-2 bg-violet-500 rounded-full" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Actions */}
      <div className="p-2 border-t border-slate-100">
        <Link
          href="/auth/logout"
          className={`flex items-center gap-3 px-3 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'Logout' : undefined}
        >
          <span className="text-xl">🚪</span>
          {!collapsed && <span>Logout</span>}
        </Link>
      </div>
    </aside>
  );
}

// ============================================================================
// MOBILE BOTTOM NAV
// ============================================================================

interface MobileNavProps {
  items: SidebarItem[];
}

function MobileNav({ items }: MobileNavProps) {
  const pathname = usePathname();
  const visibleItems = items.slice(0, 5); // Show max 5 items

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 md:hidden z-50">
      <ul className="flex justify-around items-center h-16">
        {visibleItems.map((item) => {
          const isActive = item.isActive || pathname === item.href;
          
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-2 ${
                  isActive ? 'text-violet-600' : 'text-slate-500'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-[10px] font-medium">{item.label.split(' ')[0]}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// ============================================================================
// MAIN LAYOUT
// ============================================================================

interface DashboardLayoutProps {
  children: ReactNode;
  userDomains: DomainId[];
  userName: string;
  currentStreak?: number;
}

export default function DashboardLayout({
  children,
  userDomains,
  userName,
  currentStreak = 0,
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Load sidebar state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-collapsed');
    if (savedState !== null) {
      setSidebarCollapsed(savedState === 'true');
    }
  }, []);

  // Save sidebar state
  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', String(newState));
  };

  const sidebarItems = getSidebarItems(userDomains, pathname);

  const contextValue: DashboardContextValue = {
    sidebarCollapsed,
    toggleSidebar,
    userDomains,
    userName,
    currentStreak,
    isLoading,
  };

  return (
    <DashboardContext.Provider value={contextValue}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-indigo-50/30">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar
            items={sidebarItems}
            collapsed={sidebarCollapsed}
            onToggle={toggleSidebar}
            userName={userName}
            streak={currentStreak}
          />
        </div>

        {/* Main Content */}
        <main
          className={`transition-all duration-300 pb-20 md:pb-0 ${
            sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'
          }`}
        >
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileNav items={sidebarItems} />
      </div>
    </DashboardContext.Provider>
  );
}


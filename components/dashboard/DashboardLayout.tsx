'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rocket, 
  Home, 
  Calendar, 
  BarChart3, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Flame,
  Activity,
  Brain,
  Wallet,
  BookOpen,
  Briefcase,
  Heart,
  User
} from 'lucide-react';
import { DomainId, getSidebarItems, SidebarItem } from '@/lib/domains';
import { ThemeToggle } from '@/components/theme';
import { isSupabaseReady, getSupabaseClient } from '@/lib/supabase/client';

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

// Domain icons mapping
const domainIconMap: Record<string, typeof Activity> = {
  health: Activity,
  discipline: Brain,
  finance: Wallet,
  learning: BookOpen,
  career: Briefcase,
  personal: Heart,
  home: Home,
  log: Calendar,
  scorecard: BarChart3,
  settings: Settings,
};

// ============================================================================
// TOP HEADER COMPONENT
// ============================================================================

interface TopHeaderProps {
  userName: string;
  streak: number;
}

function TopHeader({ userName, streak }: TopHeaderProps) {
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = async () => {
    if (!isSupabaseReady()) return;
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--border-subtle)]">
      <div className="h-full flex items-center justify-between px-4 md:px-6">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Rocket size={28} className="text-[var(--gold-primary)]" />
          <span className="text-xl font-medium text-[var(--text-primary)] hidden sm:inline">Tracky</span>
        </Link>

        {/* Center: Breadcrumb / Current Page (optional) */}
        <div className="hidden md:flex items-center gap-2 text-sm">
          <span className="text-[var(--text-ghost)]">Home</span>
          <ChevronRight size={14} className="text-[var(--text-ghost)]" />
          <span className="text-[var(--gold-primary)]">Health & Fitness</span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Streak Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--gold-primary)]/10 border border-[var(--gold-primary)]/20">
            <Flame size={14} className="text-[var(--gold-primary)]" />
            <span className="text-xs font-medium text-[var(--gold-primary)]">{streak} day streak</span>
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Profile Dropdown */}
          <div className="relative">
            <motion.button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--gold-primary)] to-[var(--gold-soft)] flex items-center justify-center">
                <User size={14} className="text-[var(--obsidian-deepest)]" />
              </div>
              <span className="text-[var(--text-muted)] text-sm hidden sm:block max-w-[100px] truncate">
                {userName || 'User'}
              </span>
            </motion.button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {showProfileMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowProfileMenu(false)} 
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] shadow-2xl overflow-hidden z-50"
                  >
                    <Link 
                      href="/dashboard" 
                      className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] transition-colors"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <Home size={16} />
                      Dashboard
                    </Link>
                    <Link 
                      href="/dashboard/settings" 
                      className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] transition-colors"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <Settings size={16} />
                      Settings
                    </Link>
                    <div className="border-t border-[var(--border-subtle)]" />
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[var(--status-error)] hover:bg-[var(--status-error)]/10 transition-colors"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
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
    <motion.aside
      className="fixed left-0 top-16 h-[calc(100vh-4rem)] bg-[var(--surface-card)] border-r border-[var(--border-subtle)] z-40"
      initial={false}
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Collapse Toggle */}
      <div className="h-12 flex items-center justify-end px-3 border-b border-[var(--border-subtle)]">
        <motion.button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-[var(--surface-2)] transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {collapsed ? (
            <ChevronRight size={18} className="text-[var(--text-muted)]" />
          ) : (
            <ChevronLeft size={18} className="text-[var(--text-muted)]" />
          )}
        </motion.button>
      </div>

      {/* Navigation Items */}
      <nav className="p-2 flex-1 overflow-y-auto">
        <ul className="space-y-1">
          {items.map((item) => {
            const isActive = item.isActive || pathname === item.href;
            const Icon = domainIconMap[item.id] || Activity;
            
            return (
              <li key={item.id}>
                <Link href={item.href}>
                  <motion.div
                    className={`
                      flex items-center gap-3 px-3 py-3 rounded-[16px] transition-all
                      ${isActive
                        ? 'bg-[var(--gold-soft)] text-[var(--gold-primary)]'
                        : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]'
                      }
                      ${collapsed ? 'justify-center' : ''}
                    `}
                    whileHover={{ x: collapsed ? 0 : 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon size={20} strokeWidth={1.5} />
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          className="flex-1 font-medium text-sm"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {!collapsed && isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="w-1.5 h-1.5 rounded-full bg-[var(--gold-primary)]"
                      />
                    )}
                  </motion.div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Actions */}
      <div className="p-2 border-t border-[var(--border-subtle)]">
        <Link href="/dashboard/settings">
          <motion.div
            className={`
              flex items-center gap-3 px-3 py-3 rounded-[16px] text-[var(--text-muted)] 
              hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] transition-all
              ${collapsed ? 'justify-center' : ''}
            `}
            whileHover={{ x: collapsed ? 0 : 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <Settings size={20} strokeWidth={1.5} />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-sm"
                >
                  Settings
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </Link>
      </div>
    </motion.aside>
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
  const visibleItems = items.slice(0, 4);

  return (
    <motion.nav 
      className="fixed bottom-0 left-0 right-0 bg-[var(--surface-card)] border-t border-[var(--border-subtle)] md:hidden z-50 backdrop-blur-xl"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <ul className="flex justify-around items-center h-16 px-2">
        {visibleItems.map((item) => {
          const isActive = item.isActive || pathname === item.href;
          const Icon = domainIconMap[item.id] || Activity;
          
          return (
            <li key={item.id}>
              <Link href={item.href}>
                <motion.div
                  className={`
                    flex flex-col items-center gap-1 px-4 py-2 rounded-[12px]
                    ${isActive ? 'text-[var(--gold-primary)]' : 'text-[var(--text-muted)]'}
                  `}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon size={22} strokeWidth={1.5} />
                  <span className="text-[10px] font-medium">{item.label.split(' ')[0]}</span>
                  {isActive && (
                    <motion.div
                      layoutId="mobileActiveIndicator"
                      className="absolute -bottom-1 w-4 h-0.5 rounded-full bg-[var(--gold-primary)]"
                    />
                  )}
                </motion.div>
              </Link>
            </li>
          );
        })}
        <li>
          <Link href="/dashboard/settings">
            <motion.div
              className={`
                flex flex-col items-center gap-1 px-4 py-2 rounded-[12px]
                ${pathname === '/dashboard/settings' ? 'text-[var(--gold-primary)]' : 'text-[var(--text-muted)]'}
              `}
              whileTap={{ scale: 0.9 }}
            >
              <Settings size={22} strokeWidth={1.5} />
              <span className="text-[10px] font-medium">Settings</span>
            </motion.div>
          </Link>
        </li>
      </ul>
    </motion.nav>
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
  const [isLoading] = useState(false);
  
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-collapsed');
    if (savedState !== null) {
      setSidebarCollapsed(savedState === 'true');
    }
  }, []);

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
      <div className="min-h-screen bg-[var(--background)]">
        {/* Fixed Top Header - Always visible */}
        <TopHeader userName={userName} streak={currentStreak} />

        {/* Desktop Sidebar - Below header */}
        <div className="hidden md:block">
          <Sidebar
            items={sidebarItems}
            collapsed={sidebarCollapsed}
            onToggle={toggleSidebar}
            userName={userName}
            streak={currentStreak}
          />
        </div>

        {/* Main Content - Offset for header and sidebar */}
        <main className="pt-16 pb-20 md:pb-0">
          {/* Mobile: No sidebar margin */}
          <div className="md:hidden">
            {children}
          </div>
          {/* Desktop: Sidebar margin */}
          <motion.div 
            className="hidden md:block"
            animate={{ marginLeft: sidebarCollapsed ? 72 : 240 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileNav items={sidebarItems} />
      </div>
    </DashboardContext.Provider>
  );
}

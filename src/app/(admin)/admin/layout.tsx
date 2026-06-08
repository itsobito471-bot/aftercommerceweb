'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getAdminProfile } from '../../../services/adminApi';
import { User } from '../../../types/admin-lms';
import logoIcon from '@/assets/images/logo-icon.svg';

/**
 * LMS Administrative Layout
 * Replicates the original Angular side-nav design, custom styles, themes, and shell structures
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const currentPath = usePathname();

  // Profile data & loading states
  const [profile, setProfile] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Layout states (mirroring Angular side-nav component states)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLightTheme, setIsLightTheme] = useState(true);
  const [windowWidth, setWindowWidth] = useState(1200);

  // Custom react modal for premium logout confirmation (replaces SweetAlert2 dependency)
  const [showLogoutModal, setShowLogoutModal] = useState(false);


  // Navigation Links structure mirroring Angular menuItems
  const menuItems = [
    {
      label: 'Dashboard',
      route: '/admin',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="9" />
          <rect x="14" y="3" width="7" height="5" />
          <rect x="14" y="12" width="7" height="9" />
          <rect x="3" y="16" width="7" height="5" />
        </svg>
      ),
    },
    {
      label: 'Students',
      route: '/admin/students',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87" />
          <path d="M16 3.13a4 4 0 010 7.75" />
        </svg>
      ),
    },
    {
      label: 'Kyc',
      route: '/admin/kyc',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
    },
    {
      label: 'Assessment Templates',
      route: '/admin/assessment-templates',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      ),
    },
    {
      label: 'Categories',
      route: '/admin/courses/categories',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
    },
    {
      label: 'Course Catalog',
      route: '/admin/courses',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
        </svg>
      ),
    },
    {
      label: 'Team Management',
      route: '/admin/staff',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87" />
          <path d="M16 3.13a4 4 0 010 7.75" />
        </svg>
      ),
    },
    {
      label: 'Affiliates & Payouts',
      route: '/admin/affiliates',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="5" x2="5" y2="19" />
          <circle cx="6.5" cy="6.5" r="2.5" />
          <circle cx="17.5" cy="17.5" r="2.5" />
        </svg>
      ),
    },
    {
      label: 'Transactions',
      route: '/admin/transactions',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        </svg>
      ),
    },
  ];

  // Resolve current active page title
  const getPageTitle = () => {
    const match = menuItems.find(
      (item) => currentPath === item.route || currentPath.startsWith(item.route + '/')
    );
    return match ? match.label : 'Dashboard';
  };

  // Window resizing listener
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    setWindowWidth(window.innerWidth);
    const handleResize = () => {
      const w = window.innerWidth;
      setWindowWidth(w);
      if (w >= 768) {
        setIsMobileOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync state values on initial mounting
  useEffect(() => {
    // Restore theme configurations
    const savedTheme = localStorage.getItem('ac-theme');
    if (savedTheme === 'dark') {
      setIsLightTheme(false);
      document.documentElement.removeAttribute('data-theme');
    } else {
      setIsLightTheme(true);
      document.documentElement.setAttribute('data-theme', 'light');
    }

    // Restore sidebar collapse parameters
    const savedCollapsed = localStorage.getItem('ac-sidebar-collapsed');
    if (savedCollapsed === 'true') {
      setIsSidebarCollapsed(true);
    }

    // Load active credentials data & authorize
    let active = true;
    async function checkAuth() {
      try {
        const userProfile = await getAdminProfile();
        
        if (!active) return;
        
        const isAuthorized = ['super_admin', 'admin', 'staff'].includes(userProfile.role);
        if (!isAuthorized) {
          throw new Error('Unauthorized role access');
        }

        setProfile(userProfile);
        setAuthLoading(false);
      } catch (err) {
        if (!active) return;
        router.push('/admin-login');
      }
    }

    checkAuth();
    return () => {
      active = false;
    };
  }, [router]);

  // Collapsible toggle helper
  const toggleSidebar = () => {
    if (windowWidth < 768) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      const nextCollapsed = !isSidebarCollapsed;
      setIsSidebarCollapsed(nextCollapsed);
      localStorage.setItem('ac-sidebar-collapsed', String(nextCollapsed));
    }
  };

  // Theme switcher helper
  const toggleTheme = () => {
    const nextLightTheme = !isLightTheme;
    setIsLightTheme(nextLightTheme);
    if (nextLightTheme) {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('ac-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('ac-theme', 'dark');
    }
  };

  // Confirm logout actions
  const executeLogout = () => {
    localStorage.removeItem('ac-theme');
    localStorage.removeItem('ac-sidebar-collapsed');
    localStorage.removeItem('admin_token');
    document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict; Secure';
    router.push('/admin-login');
  };

  // Profile initials helper
  const getUserInitials = () => {
    if (!profile?.name) return 'AD';
    return profile.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (authLoading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-900 text-slate-100">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="absolute h-16 w-16 animate-ping rounded-full bg-indigo-500/20"></div>
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
        </div>
        <p className="mt-6 text-sm font-medium tracking-wide text-indigo-300 animate-pulse">
          Verifying security credentials...
        </p>
      </div>
    );
  }

  const userName = profile?.name || 'Store Admin';
  const userRole = profile?.role ? profile.role.replace('_', ' ') : 'Store Admin';

  return (
    <div className={`shell animate-bg-appear`} data-theme={isLightTheme ? 'light' : undefined}>
      
      {/* Dynamic Background Layout Grid & Ambient Orbs */}
      <div className="shell-bg-grid" aria-hidden="true"></div>
      <div className="shell-bg-orb shell-bg-orb--tl" aria-hidden="true"></div>
      <div className="shell-bg-orb shell-bg-orb--br" aria-hidden="true"></div>

      {/* 1. MOBILE BACKDROP OVERLAY */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="sidebar-backdrop animate-bg-appear"
        ></div>
      )}

      {/* 2. SIDEBAR NAVIGATION CONTAINER */}
      <aside 
        className={`sidebar animate-sidebar ${
          windowWidth >= 768
            ? isSidebarCollapsed
              ? 'sidebar--collapsed'
              : 'sidebar--expanded'
            : isMobileOpen
            ? 'sidebar--mobile-open'
            : 'sidebar--mobile-closed'
        }`}
      >
        {/* Brand Header */}
        <div className="sidebar__brand">
          {isSidebarCollapsed && windowWidth >= 768 ? (
            <img 
              src={logoIcon.src} 
              alt="After Commerce" 
              className="sidebar__brand-logo-collapsed h-8 w-auto object-contain mx-auto" 
            />
          ) : (
            <div className="sidebar__brand-text select-none flex items-center gap-2.5">
              <img 
                src={logoIcon.src} 
                alt="After Commerce" 
                className="sidebar__brand-logo h-7 w-auto object-contain" 
              />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] border-l border-[var(--glass-border)] pl-2.5 leading-none">
                Admin Panel
              </span>
            </div>
          )}
          
          {isMobileOpen && (
            <button 
              onClick={() => setIsMobileOpen(false)}
              className="sidebar__mobile-close ml-auto"
              aria-label="Close sidebar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Sidebar Nav List */}
        <nav className="sidebar__nav scrollbar-premium" aria-label="Main navigation">
          {(!isSidebarCollapsed || windowWidth < 768) && (
            <p className="sidebar__section-label">Overview</p>
          )}
          
          <ul className="sidebar__nav-list">
            {menuItems.map((item, index) => {
              // Custom matching route check (home maps to /admin root)
              const isActive = 
                item.route === '/admin' 
                  ? currentPath === '/admin' 
                  : currentPath.startsWith(item.route);

              return (
                <li key={item.route} className={`sidebar__nav-item stagger-${index + 1}`}>
                  <Link
                    href={item.route}
                    title={isSidebarCollapsed && windowWidth >= 768 ? item.label : ''}
                    onClick={() => setIsMobileOpen(false)}
                    className={`sidebar__link group ${
                      isActive ? 'sidebar__link--active' : ''
                    } ${isSidebarCollapsed && windowWidth >= 768 ? 'sidebar__footer-action--icon-only' : ''}`}
                  >
                    <span className="sidebar__link-icon">{item.icon}</span>
                    {(!isSidebarCollapsed || windowWidth < 768) && (
                      <span className="sidebar__link-label">{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer Operations */}
        <div className="sidebar__footer">
          {/* Settings shortcut */}
          <Link 
            href="/admin/settings"
            className={`sidebar__footer-action ${
              isSidebarCollapsed && windowWidth >= 768 ? 'sidebar__footer-action--icon-only' : ''
            }`}
          >
            <span className="sidebar__link-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 008 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
            </span>
            {(!isSidebarCollapsed || windowWidth < 768) && (
              <span className="sidebar__link-label">Settings</span>
            )}
          </Link>

          {/* Profile Shortcut */}
          <Link 
            href="/admin/profile"
            className={`sidebar__footer-action ${
              isSidebarCollapsed && windowWidth >= 768 ? 'sidebar__footer-action--icon-only' : ''
            }`}
          >
            <span className="sidebar__link-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </span>
            {(!isSidebarCollapsed || windowWidth < 768) && (
              <span className="sidebar__link-label">My Profile</span>
            )}
          </Link>

          {/* Logout button */}
          <button 
            onClick={() => setShowLogoutModal(true)}
            className={`sidebar__footer-action sidebar__footer-action--logout ${
              isSidebarCollapsed && windowWidth >= 768 ? 'sidebar__footer-action--icon-only' : ''
            }`}
            title={isSidebarCollapsed && windowWidth >= 768 ? 'Sign Out' : ''}
          >
            <span className="sidebar__link-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </span>
            {(!isSidebarCollapsed || windowWidth < 768) && (
              <span className="sidebar__link-label">Sign Out</span>
            )}
          </button>
        </div>
      </aside>

      {/* 3. CONTENT AREA */}
      <div className="content-area">
        
        {/* TOPBAR PANEL */}
        <header className="topbar animate-header">
          
          <div className="topbar__left">
            {/* Hamburger menu button */}
            <button 
              onClick={toggleSidebar}
              className="topbar__icon-btn"
              aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            {windowWidth >= 768 && (
              <div className="topbar__breadcrumb select-none">
                <span className="topbar__breadcrumb-root text-slate-400">AfterCommerce</span>
                <span className="topbar__breadcrumb-sep text-slate-600">›</span>
                <span className="topbar__breadcrumb-page text-slate-200">{getPageTitle()}</span>
              </div>
            )}
          </div>

          <div className="topbar__right">
            
            {/* Search Pill */}
            <div className="topbar__search">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input type="text" placeholder="Search orders, products..." className="topbar__search-input" />
            </div>

            {/* Theme Toggle Button */}
            <button onClick={toggleTheme} className="topbar__icon-btn" aria-label="Toggle theme">
              {!isLightTheme ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
              )}
            </button>

            {/* Notifications Button */}
            <div className="topbar__notif-wrap">
              <button className="topbar__icon-btn" aria-label="Notifications">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 01-3.46 0" />
                </svg>
              </button>
              <span className="topbar__notif-dot" aria-hidden="true"></span>
            </div>

            {/* User Menu Chip Pill */}
            <button className="topbar__user-chip" id="user-menu-btn" aria-label="User menu">
              <div className="topbar__avatar select-none">{getUserInitials()}</div>
              {windowWidth >= 900 && (
                <div className="topbar__user-info select-none">
                  <span className="topbar__user-name">{userName}</span>
                  <span className="topbar__user-role">{userRole}</span>
                </div>
              )}
            </button>

          </div>
        </header>

        {/* Main Content Area */}
        <main className="main-content scrollbar-premium animate-main">
          {children}
        </main>
      </div>


      {/* 5. CONFIRMATION LOGOUT MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Modal Backdrop */}
          <div 
            onClick={() => setShowLogoutModal(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          ></div>
          
          {/* Modal Box */}
          <div className="relative w-full max-w-sm rounded-2xl border border-[var(--glass-border)] bg-[var(--color-bg-surface)] p-6 shadow-2xl backdrop-blur-xl animate-card-enter">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              
              <h3 className="mt-4 text-lg font-bold text-[var(--color-text-primary)]">Confirm Logout</h3>
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                Are you sure you want to log out of your session?
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 rounded-lg border border-[var(--glass-border)] bg-transparent py-2.5 text-sm font-semibold text-[var(--color-text-muted)] hover:bg-[var(--glass-bg-hover)] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={executeLogout}
                className="flex-1 rounded-lg bg-[#ef4444] py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-600/15 hover:bg-[#dc2626] active:scale-98 transition-all"
              >
                Yes, logout
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

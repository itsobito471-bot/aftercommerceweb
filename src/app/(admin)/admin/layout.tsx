'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getAdminProfile, getDocumentUrl } from '../../../services/adminApi';
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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Layout states (mirroring Angular side-nav component states)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLightTheme, setIsLightTheme] = useState(false);
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
    // Restore theme configurations (Default Dark Mode)
    const savedTheme = localStorage.getItem('ac-theme');
    if (savedTheme === 'light') {
      setIsLightTheme(true);
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      setIsLightTheme(false);
      document.documentElement.removeAttribute('data-theme');
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

        if (userProfile.avatar_doc_id) {
          try {
            const docRes = await getDocumentUrl(userProfile.avatar_doc_id);
            if (docRes.success && docRes.data.url) {
              setAvatarUrl(docRes.data.url);
            }
          } catch (err) {
            console.error('Failed to load avatar URL', err);
          }
        }

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
            <div className="select-none flex flex-row items-center gap-2.5">
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
              // Find the best match (longest route) so we don't highlight both parent and child
              const bestMatch = menuItems
                .filter(m => currentPath === m.route || currentPath.startsWith(m.route + '/'))
                .sort((a, b) => b.route.length - a.route.length)[0];
              
              const isActive = item.route === '/admin'
                ? currentPath === '/admin'
                : bestMatch?.route === item.route;

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
              currentPath === '/admin/settings' ? 'sidebar__footer-action--active' : ''
            } ${
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
              currentPath === '/admin/profile' ? 'sidebar__footer-action--active' : ''
            } ${
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
        <header className="topbar animate-header relative z-50">
          
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
            <div className="relative group">
              <button className="topbar__icon-btn" aria-label="Notifications">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 01-3.46 0" />
                </svg>
              </button>
              <span className="topbar__notif-dot" aria-hidden="true"></span>
              
              {/* Notification Dropdown */}
              <div className="absolute right-0 mt-2 w-72 rounded-xl border border-[var(--glass-border)] bg-[var(--color-bg-surface)] p-3 shadow-xl backdrop-blur-xl z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0 before:absolute before:-top-4 before:left-0 before:w-full before:h-4">
                <h4 className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] border-b border-[var(--glass-border)] pb-2 mb-2">Notifications</h4>
                <div className="flex flex-col gap-1 max-h-64 overflow-y-auto scrollbar-premium">
                  <div className="rounded-lg p-2 hover:bg-[var(--glass-bg-hover)] cursor-pointer transition-colors border-l-2 border-[var(--color-accent)] bg-[var(--color-accent-dim)]">
                    <p className="text-[13px] font-semibold text-[var(--color-text-primary)]">New Registration</p>
                    <p className="text-xs text-[var(--color-text-subtle)] mt-0.5">A new student signed up.</p>
                  </div>
                  <div className="rounded-lg p-2 hover:bg-[var(--glass-bg-hover)] cursor-pointer transition-colors">
                    <p className="text-[13px] font-semibold text-[var(--color-text-primary)]">Course Published</p>
                    <p className="text-xs text-[var(--color-text-subtle)] mt-0.5">"Advanced React" is live.</p>
                  </div>
                </div>
                <button className="mt-2 w-full rounded-md py-1.5 text-center text-[11px] font-bold uppercase tracking-wider text-[var(--color-accent)] hover:bg-[var(--glass-bg-hover)]">Mark all as read</button>
              </div>
            </div>

            {/* User Menu Chip Pill */}
            <div className="relative group">
              <button className="topbar__user-chip" id="user-menu-btn" aria-label="User menu">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt={userName} 
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-[var(--glass-border)] shadow-sm"
                  />
                ) : (
                  <div className="topbar__avatar select-none">{getUserInitials()}</div>
                )}
                {windowWidth >= 900 && (
                  <div className="topbar__user-info select-none">
                    <span className="topbar__user-name">{profile?.display_name || userName}</span>
                    <span className="topbar__user-role">{userRole}</span>
                  </div>
                )}
              </button>
              
              {/* Profile Dropdown */}
              <div className="absolute right-0 mt-2 w-52 rounded-xl border border-[var(--glass-border)] bg-[var(--color-bg-surface)] p-2 shadow-xl backdrop-blur-xl z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0 before:absolute before:-top-4 before:left-0 before:w-full before:h-4">
                <div className="px-3 py-2 mb-1 border-b border-[var(--glass-border)]">
                  <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{profile?.display_name || userName}</p>
                  <p className="text-xs text-[var(--color-text-subtle)] truncate">{profile?.email || 'admin@lms.com'}</p>
                </div>
                
                <Link href="/admin/profile" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--glass-bg-hover)] transition-colors">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                  My Profile
                </Link>
                <Link href="/admin/settings" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--glass-bg-hover)] transition-colors">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  Change Password
                </Link>
                
                <div className="my-1 border-t border-[var(--glass-border)]"></div>
                
                <button onClick={() => setShowLogoutModal(true)} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                  Sign Out
                </button>
              </div>
            </div>

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

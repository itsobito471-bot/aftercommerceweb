'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import logoIcon from '@/assets/images/logo-icon.svg';

interface NavbarProps {
  onNavigate?: (sectionId: string) => void;
  isLoggedIn?: boolean;
}

interface StudentUser {
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
}

export default function Navbar({ onNavigate, isLoggedIn = false }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);
  const [hasStudentAuth, setHasStudentAuth] = useState(false);
  const [studentUser, setStudentUser] = useState<StudentUser | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Detect if student user is logged in
    const token = typeof window !== 'undefined' ? localStorage.getItem('student_token') : null;
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('student_user') : null;
    if (userStr) {
      try {
        setStudentUser(JSON.parse(userStr));
      } catch {
        // ignore
      }
    }
    setHasStudentAuth(Boolean(token) || isLoggedIn);

    const handleScroll = () => {
      const programsEl = document.getElementById('programs');
      if (programsEl) {
        const rect = programsEl.getBoundingClientRect();
        setIsScrolledPastHero(rect.top <= 140);
      } else {
        setIsScrolledPastHero(window.scrollY > window.innerHeight * 2.2);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoggedIn]);

  // Click outside listener for profile dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleConfirmLogout = () => {
    localStorage.removeItem('student_token');
    localStorage.removeItem('student_user');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    document.cookie = 'student_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'admin_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setHasStudentAuth(false);
    setIsLogoutModalOpen(false);
    window.location.reload();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      {/* Position remains stable at pt-4 sm:pt-5, only container width shrinks subtly */}
      <div 
        className={`mx-auto px-4 sm:px-6 pt-4 sm:pt-5 transition-[max-width] duration-500 ease-out ${
          isScrolledPastHero 
            ? 'max-w-6xl' 
            : 'max-w-7xl'
        }`}
      >
        {/* Floating Liquid Glass Navigation Bar - Height, padding, and border-radius remain rock solid */}
        <div 
          className="pointer-events-auto rounded-2xl px-5 sm:px-7 py-3 sm:py-3.5 flex items-center justify-between transition-[background,box-shadow,border-color] duration-500 ease-out"
          style={{
            background: isScrolledPastHero
              ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.88) 0%, rgba(248, 250, 252, 0.78) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.75) 0%, rgba(248, 250, 252, 0.58) 100%)',
            backdropFilter: 'blur(22px) saturate(190%)',
            WebkitBackdropFilter: 'blur(22px) saturate(190%)',
            border: '1px solid rgba(255, 255, 255, 0.75)',
            boxShadow: isScrolledPastHero
              ? '0 12px 36px -4px rgba(27, 43, 85, 0.10), inset 0 1px 0 rgba(255, 255, 255, 0.95), inset 0 -1px 0 rgba(0, 0, 0, 0.04)'
              : '0 10px 30px -5px rgba(27, 43, 85, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9), inset 0 -1px 0 rgba(0, 0, 0, 0.03)'
          }}
        >
          {/* Brand Logo - consistent sizing without jumping */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
            <div className="w-9 h-7 sm:w-11 sm:h-8 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <img 
                src={logoIcon.src} 
                alt="After Commerce Logo" 
                className="w-full h-full object-contain select-none pointer-events-none" 
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-[14px] sm:text-[15px] tracking-wider text-[#1A1A2E] leading-tight font-['Poppins',sans-serif]">
                AFTER COMMERCE
              </span>
            </div>
          </Link>

          {/* Navigation Center Links */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-8 text-[13px] font-medium text-slate-600 font-['Poppins',sans-serif]">
            <Link
              href="/courses"
              className="hover:text-[#2B4788] transition-colors cursor-pointer"
            >
              Courses
            </Link>
            <a
              href="#programs"
              onClick={(e) => {
                e.preventDefault();
                onNavigate?.('programs');
              }}
              className="hover:text-[#2B4788] transition-colors cursor-pointer"
            >
              Programs
            </a>
            <a
              href="#career-tracks"
              onClick={(e) => {
                e.preventDefault();
                onNavigate?.('career-tracks');
              }}
              className="hover:text-[#2B4788] transition-colors cursor-pointer"
            >
              Career Tracks
            </a>
            <a
              href="#about"
              onClick={(e) => {
                e.preventDefault();
                onNavigate?.('about');
              }}
              className="hover:text-[#2B4788] transition-colors cursor-pointer"
            >
              About
            </a>
            <a
              href="#resources"
              onClick={(e) => {
                e.preventDefault();
                onNavigate?.('resources');
              }}
              className="hover:text-[#2B4788] transition-colors cursor-pointer"
            >
              Resources
            </a>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {!hasStudentAuth ? (
              /* When logged OUT: Show GET STARTED */
              <Link
                href="/onboarding"
                className="inline-flex items-center justify-center bg-[#1A1A2E] hover:bg-slate-800 text-white font-bold tracking-wider text-xs px-5 sm:px-6 py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                GET STARTED
              </Link>
            ) : (
              /* When logged IN: Show ONLY the profile icon with dropdown menu */
              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  aria-label="Student Account Menu"
                  title="My Account"
                  className="w-10 h-10 rounded-xl bg-[#1E3494] hover:bg-[#2B4788] text-white flex items-center justify-center transition-all duration-200 shadow-sm hover:scale-105 active:scale-95 cursor-pointer ring-2 ring-transparent focus:ring-blue-300"
                >
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div
                    className="absolute right-0 top-full mt-3 w-64 rounded-2xl p-2 shadow-2xl border border-white/90 z-50 animate-fade-in font-['Poppins',sans-serif]"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.96) 0%, rgba(248, 250, 252, 0.92) 100%)',
                      backdropFilter: 'blur(24px) saturate(190%)',
                      WebkitBackdropFilter: 'blur(24px) saturate(190%)',
                      boxShadow: '0 20px 45px -10px rgba(27, 43, 85, 0.18), 0 0 0 1px rgba(255, 255, 255, 0.8) inset'
                    }}
                  >
                    {/* Header with user info */}
                    <div className="px-3.5 py-3 border-b border-slate-100 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E3494] to-[#2B4788] text-white flex items-center justify-center font-bold text-sm shadow-inner shrink-0">
                        {studentUser?.name ? studentUser.name.slice(0, 2).toUpperCase() : 'AC'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#1A1A2E] truncate font-['Poppins',sans-serif]">
                          {studentUser?.name || 'Student Candidate'}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate font-mono">
                          {studentUser?.email || 'Logged In'}
                        </p>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-1.5 flex flex-col gap-0.5">
                      <Link
                        href={studentUser?.role === 'admin' || studentUser?.role === 'staff' ? '/admin' : '/'}
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-[#1E3494] hover:bg-blue-50/80 transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                          <rect width="7" height="9" x="3" y="3" rx="1" />
                          <rect width="7" height="5" x="14" y="3" rx="1" />
                          <rect width="7" height="9" x="14" y="12" rx="1" />
                          <rect width="7" height="5" x="3" y="16" rx="1" />
                        </svg>
                        <span>Dashboard</span>
                      </Link>

                      <Link
                        href={studentUser?.role === 'admin' || studentUser?.role === 'staff' ? '/admin' : '/'}
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-[#1E3494] hover:bg-blue-50/80 transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                          <path d="M6 6h10" />
                          <path d="M6 10h10" />
                        </svg>
                        <span>My Courses</span>
                      </Link>
                    </div>

                    {/* Divider */}
                    <div className="my-1 border-t border-slate-100" />

                    {/* Logout trigger */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        setIsLogoutModalOpen(true);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50/90 transition-colors cursor-pointer text-left"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-500">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" x2="9" y1="12" y2="12" />
                      </svg>
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-black/5 transition-colors"
              aria-label="Toggle menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu with matching Liquid Glass design */}
        {mobileMenuOpen && (
          <div 
            className="pointer-events-auto md:hidden mt-3 p-4 rounded-2xl shadow-xl flex flex-col gap-3 font-['Poppins',sans-serif] animate-card-enter border border-white/60"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.94) 0%, rgba(248, 250, 252, 0.88) 100%)',
              backdropFilter: 'blur(24px) saturate(190%)',
              WebkitBackdropFilter: 'blur(24px) saturate(190%)',
            }}
          >
            <Link
              href="/courses"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-xl hover:bg-slate-100/70 text-slate-700 font-medium"
            >
              Courses
            </Link>
            <a
              href="#programs"
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate?.('programs');
              }}
              className="py-2 px-3 rounded-xl hover:bg-slate-100/70 text-slate-700 font-medium"
            >
              Programs
            </a>
            <a
              href="#career-tracks"
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate?.('career-tracks');
              }}
              className="py-2 px-3 rounded-xl hover:bg-slate-100/70 text-slate-700 font-medium"
            >
              Career Tracks
            </a>
            <a
              href="#about"
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate?.('about');
              }}
              className="py-2 px-3 rounded-xl hover:bg-slate-100/70 text-slate-700 font-medium"
            >
              About
            </a>
            <a
              href="#resources"
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate?.('resources');
              }}
              className="py-2 px-3 rounded-xl hover:bg-slate-100/70 text-slate-700 font-medium"
            >
              Resources
            </a>

            {/* Mobile Auth / Profile section */}
            <div className="pt-2 border-t border-slate-200/60 flex flex-col gap-2">
              {!hasStudentAuth ? (
                <Link
                  href="/onboarding"
                  onClick={() => setMobileMenuOpen(false)}
                  className="bg-[#1A1A2E] text-white text-xs font-bold px-5 py-2.5 rounded-xl text-center"
                >
                  GET STARTED
                </Link>
              ) : (
                <div className="flex flex-col gap-1">
                  <div className="px-2 py-1 text-xs font-bold text-slate-800">
                    {studentUser?.name || 'Student Account'}
                  </div>
                  <Link
                    href={studentUser?.role === 'admin' || studentUser?.role === 'staff' ? '/admin' : '/'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-1.5 px-3 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href={studentUser?.role === 'admin' || studentUser?.role === 'staff' ? '/admin' : '/'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-1.5 px-3 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100"
                  >
                    My Courses
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsLogoutModalOpen(true);
                    }}
                    className="py-1.5 px-3 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 text-left"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[100] pointer-events-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in font-['Poppins',sans-serif]">
          <div 
            className="w-full max-w-sm rounded-3xl p-6 sm:p-7 border border-white/90 shadow-2xl text-center transform transition-all animate-scale-in"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.94) 100%)',
              backdropFilter: 'blur(24px) saturate(190%)',
              WebkitBackdropFilter: 'blur(24px) saturate(190%)',
              boxShadow: '0 25px 60px -15px rgba(27, 43, 85, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.9) inset'
            }}
          >
            {/* Warning / Logout Icon */}
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center text-2xl mb-4 shadow-inner">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" x2="9" y1="12" y2="12" />
              </svg>
            </div>

            {/* Heading & Notice */}
            <h3 className="text-lg font-extrabold text-[#1A1A2E] tracking-tight">
              Are you sure you want to log out?
            </h3>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              You will be signed out of your session. You can sign back in anytime to access your enrolled courses and calibration progress.
            </p>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 hover:border-slate-400 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmLogout}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

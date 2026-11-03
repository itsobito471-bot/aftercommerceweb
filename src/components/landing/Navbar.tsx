'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import logoIcon from '@/assets/images/logo-icon.svg';

interface NavbarProps {
  onNavigate?: (sectionId: string) => void;
  isLoggedIn?: boolean;
}

export default function Navbar({ onNavigate, isLoggedIn = false }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);
  const [hasStudentAuth, setHasStudentAuth] = useState(false);

  useEffect(() => {
    // Detect if student user is logged in
    const token = typeof window !== 'undefined' ? localStorage.getItem('student_token') : null;
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
  }, []);

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
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center bg-[#1A1A2E] hover:bg-slate-800 text-white font-bold tracking-wider text-xs px-5 sm:px-6 py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow hover:scale-[1.02] active:scale-95"
            >
              GET STARTED
            </Link>

            {/* Profile icon shown only when user is authenticated */}
            {hasStudentAuth && (
              <button
                onClick={() => {
                  if (confirm('Do you want to log out of your student session?')) {
                    localStorage.removeItem('student_token');
                    localStorage.removeItem('student_user');
                    document.cookie = 'student_token=; path=/; max-age=0;';
                    setHasStudentAuth(false);
                    window.location.reload();
                  }
                }}
                aria-label="User Account"
                title="Student Profile (Click to logout)"
                className="w-9 h-9 rounded-xl bg-[#1E3494] hover:bg-[#2B4788] text-white flex items-center justify-center transition-transform hover:scale-105 shadow-sm"
              >
                <svg
                  width="18"
                  height="18"
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
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.88) 0%, rgba(248, 250, 252, 0.80) 100%)',
              backdropFilter: 'blur(24px) saturate(190%)',
              WebkitBackdropFilter: 'blur(24px) saturate(190%)',
            }}
          >
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
            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-end">
              <Link
                href="/onboarding"
                className="bg-[#1A1A2E] text-white text-xs font-bold px-5 py-2.5 rounded-xl"
              >
                GET STARTED
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

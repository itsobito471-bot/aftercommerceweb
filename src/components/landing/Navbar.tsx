'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import logoIcon from '@/assets/images/logo-icon.svg';

interface NavbarProps {
  onNavigate?: (sectionId: string) => void;
}

export default function Navbar({ onNavigate }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <div className="flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#121624] flex items-center justify-center p-1.5 shadow-md border border-slate-800/80 group-hover:scale-105 transition-transform duration-200">
              <img 
                src={logoIcon.src} 
                alt="After Commerce Logo" 
                className="w-full h-full object-contain select-none pointer-events-none" 
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-[15px] tracking-wide text-[#1A1A2E] leading-tight font-['Poppins',sans-serif]">
                AFTER COMMERCE
              </span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-slate-500 font-semibold leading-none mt-0.5">
                KERNEL // SYS.01
              </span>
            </div>
          </Link>

          {/* Navigation Center Pill */}
          <nav className="hidden md:flex items-center bg-white/85 backdrop-blur-md border border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.04)] rounded-full px-7 py-2.5">
            <div className="flex items-center gap-8 text-[13px] font-medium text-slate-600 font-['Poppins',sans-serif]">
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
            </div>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <Link
              href="/admin-login"
              className="hidden sm:inline-flex items-center font-mono text-xs font-semibold tracking-wider text-slate-700 hover:text-[#2B4788] transition-colors uppercase px-2 py-1"
            >
              LOG IN
            </Link>

            <Link
              href="/admin-login"
              className="inline-flex items-center justify-center bg-[#1A1A2E] hover:bg-slate-800 text-white text-xs font-bold tracking-wider px-5 py-2.5 rounded-full transition-all duration-200 shadow-sm hover:shadow hover:scale-[1.02] active:scale-95"
            >
              GET STARTED
            </Link>

            <Link
              href="/admin-login"
              aria-label="User Account"
              className="w-9 h-9 rounded-full bg-[#1E3494] hover:bg-[#2B4788] text-white flex items-center justify-center transition-transform hover:scale-105 shadow-sm"
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
            </Link>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 p-4 bg-white/95 backdrop-blur-lg border border-slate-200 rounded-2xl shadow-xl flex flex-col gap-3 font-['Poppins',sans-serif] animate-card-enter">
            <a
              href="#programs"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-slate-50 text-slate-700 font-medium"
            >
              Programs
            </a>
            <a
              href="#career-tracks"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-slate-50 text-slate-700 font-medium"
            >
              Career Tracks
            </a>
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-slate-50 text-slate-700 font-medium"
            >
              About
            </a>
            <a
              href="#resources"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-slate-50 text-slate-700 font-medium"
            >
              Resources
            </a>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <Link
                href="/admin-login"
                className="text-xs font-mono font-semibold text-slate-700"
              >
                LOG IN
              </Link>
              <Link
                href="/admin-login"
                className="bg-[#1A1A2E] text-white text-xs font-bold px-4 py-2 rounded-full"
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

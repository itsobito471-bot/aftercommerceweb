'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * 404 - Page Not Found Component
 * Renders a glassmorphic error page with floating gradient orbs, animated mascot guidance,
 * theme adaptation support, and primary actions (Go Back history and Home routing).
 */
export default function NotFound() {
  const router = useRouter();
  const [isLightTheme, setIsLightTheme] = useState(true);

  // Sync theme attributes on mounting
  useEffect(() => {
    const savedTheme = localStorage.getItem('ac-theme');
    if (savedTheme === 'dark') {
      setIsLightTheme(false);
      document.documentElement.removeAttribute('data-theme');
    } else {
      setIsLightTheme(true);
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

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

  return (
    <div 
      className="flex min-h-screen w-screen items-center justify-center relative overflow-hidden bg-[var(--color-bg-deep)] transition-colors duration-300 px-4 select-none"
      data-theme={isLightTheme ? 'light' : undefined}
    >
      {/* Dot-grid overlay & Ambient Orbs matching dashboard layout */}
      <div className="shell-bg-grid" aria-hidden="true"></div>
      <div className="shell-bg-orb shell-bg-orb--tl" aria-hidden="true"></div>
      <div className="shell-bg-orb shell-bg-orb--br" aria-hidden="true"></div>

      {/* Floating Theme Toggle (Top Right) */}
      <button 
        type="button"
        onClick={toggleTheme} 
        className="absolute top-6 right-6 z-20 flex items-center justify-center h-10 w-10 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-all shadow-md active:scale-95 cursor-pointer" 
        aria-label="Toggle theme"
      >
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

      {/* Main Glassmorphic 404 Card */}
      <div className="glass-card text-center max-w-md p-10 rounded-2xl shadow-2xl relative z-10 animate-card-enter bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-xl flex flex-col items-center">
        
        {/* Floating Mascot element */}
        <div className="flex flex-col items-center mb-6">
          <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 shadow-lg shadow-amber-500/35 flex items-center justify-center animate-bounce duration-1000 mb-4 select-none">
            <span className="text-5xl">🤔</span>
          </div>
          <span className="text-xs font-bold text-orange-500 dark:text-orange-400 uppercase tracking-widest bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
            Path Blocked
          </span>
        </div>

        {/* 404 Text */}
        <h1 className="text-7xl font-extrabold tracking-tight bg-gradient-to-r from-orange-400 to-[#FF6B35] bg-clip-text text-transparent select-none">
          404
        </h1>
        <h2 className="text-xl font-bold text-[var(--color-text-primary)] mt-3">
          Page Not Found
        </h2>
        <p className="text-xs text-[var(--color-text-muted)] leading-relaxed mt-2.5 max-w-xs">
          The dashboard guide tried scanning the coordinates, but this directory does not exist or has been relocated.
        </p>

        {/* Dashed separator */}
        <div className="w-full border-t border-dashed border-[var(--glass-border)] my-6"></div>

        {/* Interactive action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-5 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all select-none active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Go Back
          </button>
          
          <button
            type="button"
            onClick={() => router.push('/admin')}
            className="flex-1 btn-primary flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-bold shadow-md cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            Dashboard
          </button>
        </div>

      </div>
    </div>
  );
}

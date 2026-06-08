'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

/**
 * Catch-All Administrative 404 Page
 * Renders inside the Admin Layout Shell (maintaining side navigation bar and headers)
 * when a user navigates to an invalid path under /admin/*.
 */
export default function AdminNotFoundPage() {
  const router = useRouter();

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl select-none">
      
      {/* Page Header */}
      <div className="page-header select-none">
        <div className="header-content">
          <div className="page-label-wrap">
            <span className="page-label-root">Error</span>
            <span className="page-label-sep">›</span>
            <span className="page-label-current">404</span>
          </div>
          <h1 className="page-title text-[var(--color-text-primary)] font-bold tracking-tight">
            Content Not Found
          </h1>
          <p className="page-subtitle text-slate-500 mt-1">
            The requested page does not exist or has been moved.
          </p>
        </div>
        
        <button 
          type="button" 
          onClick={() => router.push('/admin')}
          className="flex items-center gap-2 border border-[var(--glass-border)] bg-[var(--color-bg-surface)] px-4 py-2 text-xs font-bold text-[var(--color-text-primary)] rounded-lg shadow-sm hover:bg-[var(--glass-bg-hover)] transition-all select-none active:scale-98 cursor-pointer"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Main Card */}
      <div className="glass-card rounded-2xl shadow-xl animate-card-enter bg-[var(--color-bg-surface)] border border-[var(--glass-border)] flex flex-col items-center justify-center p-10 min-h-[500px] md:min-h-[600px]">
        
        {/* Mascot Element */}
        <div className="flex flex-col items-center mb-6">
          <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 shadow-lg shadow-amber-500/35 flex items-center justify-center animate-bounce duration-1000 mb-4 select-none">
            <span className="text-4xl">🤔</span>
          </div>
          <span className="text-xs font-bold text-orange-500 dark:text-orange-400 uppercase tracking-widest bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
            Path Blocked
          </span>
        </div>

        {/* 404 Content */}
        <h1 className="text-6xl font-extrabold tracking-tight bg-gradient-to-r from-orange-400 to-[#FF6B35] bg-clip-text text-transparent">
          404
        </h1>
        <h2 className="text-lg font-bold text-[var(--color-text-primary)] mt-3 text-center">
          Page Not Found
        </h2>
        <p className="text-xs text-[var(--color-text-muted)] text-center leading-relaxed mt-2.5 max-w-xs">
          The dashboard guide scanned this admin directory, but the requested page does not exist or has been moved.
        </p>

        {/* Dashed Separator */}
        <div className="w-full max-w-xs border-t border-dashed border-[var(--glass-border)] my-6"></div>

        {/* Action Buttons */}
        <div className="flex gap-3 w-full max-w-xs justify-center">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all select-none active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
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
            className="flex-1 btn-primary flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold shadow-md cursor-pointer"
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

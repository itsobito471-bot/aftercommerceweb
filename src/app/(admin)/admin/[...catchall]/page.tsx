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
    <div className="flex flex-col items-center justify-center py-12 animate-fade-in select-none">
      
      {/* Glassmorphic 404 Card inside layout container */}
      <div className="glass-card text-center max-w-md p-10 rounded-2xl shadow-xl flex flex-col items-center bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-xl">
        
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
        <h2 className="text-lg font-bold text-[var(--color-text-primary)] mt-3">
          Content Not Found
        </h2>
        <p className="text-xs text-[var(--color-text-muted)] leading-relaxed mt-2.5 max-w-xs">
          The dashboard guide scanned this admin directory, but the requested page does not exist or has been moved.
        </p>

        {/* Dashed Separator */}
        <div className="w-full border-t border-dashed border-[var(--glass-border)] my-6"></div>

        {/* Action Buttons */}
        <div className="flex gap-3 w-full justify-center">
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

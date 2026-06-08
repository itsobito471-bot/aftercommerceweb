'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import logoIcon from '@/assets/images/logo-icon.svg';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Theme support matching dashboard layout
  const [isLightTheme, setIsLightTheme] = useState(true);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');

      const response = await axios.post(`${BACKEND_URL}/api/admin/auth/login`, {
        email,
        password,
      });

      const { success, token, message } = response.data;

      if (success && token) {
        localStorage.setItem('admin_token', token);

        const expiresDate = new Date();
        expiresDate.setDate(expiresDate.getDate() + 7);
        document.cookie = `admin_token=${token}; path=/; expires=${expiresDate.toUTCString()}; SameSite=Strict; Secure`;

        router.push('/admin');
      } else {
        setErrorMsg(message || 'Authentication failed. Please verify credentials.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const serverMessage = err.response?.data?.message || 'Network connection failed. Verify server is running.';
      setErrorMsg(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="flex min-h-screen w-screen items-center justify-center relative overflow-hidden bg-[var(--color-bg-deep)] transition-colors duration-300 px-4 py-12 sm:px-6 lg:px-8 select-none"
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
        className="absolute top-6 right-6 z-20 flex items-center justify-center h-10 w-10 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-all shadow-md active:scale-95" 
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

      {/* Login Card Box (Inherits standard Glass Card styling) */}
      <div className="glass-card relative z-10 w-full max-w-md space-y-8 p-8 backdrop-blur-xl animate-card-enter">
        
        {/* Brand Header with Real SVG Logo */}
        <div className="flex flex-col items-center text-center">
          <img 
            src={logoIcon.src} 
            alt="AfterCommerce Logo" 
            className="h-14 w-auto object-contain mb-4 select-none pointer-events-none" 
          />
          <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
            Admin Console Login
          </h2>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Sign in to manage courses, KYC reviews, and platform metrics.
          </p>
        </div>

        {/* Form Validation alerts */}
        {errorMsg && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs font-semibold text-red-300 flex items-center gap-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p>{errorMsg}</p>
          </div>
        )}

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            
            {/* Email Input */}
            <div className="glass-form-group">
              <label htmlFor="email-address" className="glass-label">
                Email Address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="glass-input mt-1"
                placeholder="admin@aftercommerce.com"
              />
            </div>

            {/* Password Input */}
            <div className="glass-form-group">
              <label htmlFor="password" className="glass-label">
                Security Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="glass-input mt-1"
                placeholder="••••••••••••"
              />
            </div>

          </div>

          {/* Submit Action Button using the premium btn-primary class */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Verifying clearance...</span>
                </div>
              ) : (
                <>
                  <span>Authenticate Identity</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

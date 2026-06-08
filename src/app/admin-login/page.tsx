'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

/**
 * LMS Admin Login Panel
 * Handles administrator credentials authorization, cookie token setting, and session initiation
 */
export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');

      // Call the backend login endpoint
      const response = await axios.post(`${BACKEND_URL}/api/admin/auth/login`, {
        email,
        password,
      });

      const { success, token, message } = response.data;

      if (success && token) {
        // Set local storage session
        localStorage.setItem('admin_token', token);

        // Set standard cookie for Next.js Middleware edge authorization check
        // Expires in 7 days
        const expiresDate = new Date();
        expiresDate.setDate(expiresDate.getDate() + 7);
        document.cookie = `admin_token=${token}; path=/; expires=${expiresDate.toUTCString()}; SameSite=Strict; Secure`;

        // Redirect to protected dashboard pages
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
    <div className="flex min-h-screen w-screen items-center justify-center bg-slate-950 px-4 py-12 sm:px-6 lg:px-8">
      {/* Dynamic Background Orbs */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-indigo-600/10 blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-emerald-600/10 blur-3xl"></div>

      <div className="relative z-10 w-full max-w-md space-y-8 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-8 backdrop-blur-xl shadow-2xl">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-600/25">
            <span className="text-2xl font-bold text-white">L</span>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white">
            Admin Console Login
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to manage courses, KYC reviews, and platform metrics.
          </p>
        </div>

        {/* Form Validation alerts */}
        {errorMsg && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            <div className="flex gap-2">
              <span>⚠️</span>
              <p className="font-medium">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            
            {/* Email Input */}
            <div>
              <label htmlFor="email-address" className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
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
                className="mt-1 block w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3.5 py-3 text-sm text-white placeholder-slate-600 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                placeholder="admin@example.com"
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
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
                className="mt-1 block w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3.5 py-3 text-sm text-white placeholder-slate-600 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                placeholder="••••••••••••"
              />
            </div>

          </div>

          {/* Submit Action Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="relative flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 active:scale-98 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Verifying clearance...</span>
                </div>
              ) : (
                'Authenticate Identity'
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

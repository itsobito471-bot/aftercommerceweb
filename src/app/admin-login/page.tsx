'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import logoIcon from '@/assets/images/logo-icon.svg';
import loginArt from '@/assets/images/login-art.png';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

type Step = 'login' | '2fa' | 'setup';

export default function AdminLoginPage() {
  const router = useRouter();
  
  // View States
  const [step, setStep] = useState<Step>('login');
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Data Handoff States
  const [tempToken, setTempToken] = useState('');
  const [userEmail, setUserEmail] = useState('');
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Timer Variables
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [canResend, setCanResend] = useState(false);

  // Theme support matching dashboard layout (Default Dark Mode)
  const [isLightTheme, setIsLightTheme] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('ac-theme');
    if (savedTheme === 'light') {
      setIsLightTheme(true);
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      setIsLightTheme(false);
      document.documentElement.removeAttribute('data-theme');
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

  // Timer Effect
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeRemaining === 0 && step !== 'login') {
      setCanResend(true);
    }
  }, [timeRemaining, step]);

  const startTimer = (durationInSeconds: number) => {
    setTimeRemaining(durationInSeconds);
    setCanResend(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSuccessfulLogin = async (token: string) => {
    localStorage.setItem('admin_token', token);
    const expiresDate = new Date();
    expiresDate.setDate(expiresDate.getDate() + 7);
    document.cookie = `admin_token=${token}; path=/; expires=${expiresDate.toUTCString()}; SameSite=Strict; Secure`;

    // Fetch user details to mirror angular logic
    try {
      const userRes = await axios.get(`${BACKEND_URL}/api/admin/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (userRes.data?.success) {
        const userDetail = btoa(encodeURIComponent(JSON.stringify(userRes.data.data)));
        localStorage.setItem('me', userDetail);
        router.push('/admin');
      } else {
        setErrorMsg('User details not found.');
        setLoading(false);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to fetch profile.');
      setLoading(false);
    }
  };

  const onLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter an email address.');
      return;
    }
    // Password might not be needed for first time login, backend handles this.
    try {
      setLoading(true);
      setErrorMsg('');

      const response = await axios.post(`${BACKEND_URL}/api/admin/auth/login`, {
        email,
        password,
      });

      const res = response.data;

      // Intercept 1: User has 2FA enabled
      if (res?.requires2FA) {
        setTempToken(res.tempToken);
        setStep('2fa');
        startTimer(300); // 5 Minutes for 2FA
        setLoading(false);
        return;
      }

      // Intercept 2: User is logging in for the very first time
      if (res?.requiresSetup) {
        setUserEmail(email);
        setStep('setup');
        startTimer(600); // 10 Minutes for Setup OTP
        setLoading(false);
        return;
      }

      // Standard Login Success
      if (res?.token) {
        await handleSuccessfulLogin(res.token);
      } else {
        setErrorMsg('Authentication failed.');
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMsg(err.response?.data?.message || 'Network connection failed.');
      setLoading(false);
    }
  };

  const onOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setErrorMsg('Please enter the 6-digit code.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');

      const response = await axios.post(`${BACKEND_URL}/api/admin/auth/login/2fa`, {
        tempToken,
        code: otp
      });

      if (response.data?.token) {
        setTimeRemaining(0);
        await handleSuccessfulLogin(response.data.token);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Invalid 2FA code.');
      setLoading(false);
    }
  };

  const onSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setErrorMsg('Please enter the 6-digit code.');
      return;
    }
    if (newPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');

      const response = await axios.post(`${BACKEND_URL}/api/admin/auth/complete-setup`, {
        email: userEmail,
        otp,
        newPassword
      });

      if (response.data?.token) {
        setTimeRemaining(0);
        await handleSuccessfulLogin(response.data.token);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Setup failed.');
      setLoading(false);
    }
  };

  const resendCode = async () => {
    // Note: Re-triggers the login process to resend the code based on email
    try {
      setLoading(true);
      setErrorMsg('');
      const reqEmail = step === 'setup' ? userEmail : email;
      await axios.post(`${BACKEND_URL}/api/admin/auth/login`, {
        email: reqEmail,
        password: step === 'setup' ? undefined : password
      });
      // Restart timer
      startTimer(step === 'setup' ? 600 : 300);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  const goBackToLogin = () => {
    setTimeRemaining(0);
    setStep('login');
    setTempToken('');
    setUserEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setErrorMsg('');
  };

  return (
    <div 
      className="flex min-h-screen w-screen relative overflow-hidden bg-[var(--color-bg-deep)] transition-colors duration-300 select-none"
      data-theme={isLightTheme ? 'light' : undefined}
    >
      {/* Left side: Premium Branding */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-center items-center bg-[var(--color-bg-surface)] border-r border-[var(--glass-border)] overflow-hidden">
        {/* Dynamic Backgrounds */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-brand-blue)]/5 via-transparent to-[var(--color-sky-blue)]/10 z-0"></div>
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-[var(--color-brand-blue)]/10 blur-[120px] rounded-full z-0"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[var(--color-sky-blue)]/10 blur-[100px] rounded-full z-0"></div>
        <div className="shell-bg-grid opacity-40 z-0" aria-hidden="true"></div>
        
        <div className="relative z-10 p-12 max-w-lg text-center animate-fade-in flex flex-col items-center justify-center h-full w-full" style={{ animationDelay: '100ms' }}>
          <div className="relative w-full max-w-sm aspect-square mb-8 rounded-3xl overflow-hidden shadow-2xl transition-transform duration-700 hover:scale-[1.02] border border-white/5 bg-white/5 backdrop-blur-sm">
            <img 
              src={loginArt.src} 
              alt="Commerce Dashboard Art" 
              className="w-full h-full object-cover mix-blend-screen opacity-90" 
            />
            {/* Overlay gradient to blend bottom edge into the dark background */}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-surface)] to-transparent via-transparent"></div>
          </div>

          <h1 className="text-[2.75rem] font-extrabold tracking-tight text-[var(--color-text-primary)] mb-6 leading-[1.15]">
            Command your <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand-blue)] to-[#818cf8]">Commerce Engine</span>
          </h1>
          <p className="text-[var(--color-text-muted)] text-[1.05rem] leading-relaxed font-medium">
            Manage your courses, automate affiliate payouts, and oversee platform performance from a single unified control center.
          </p>
          
          <div className="mt-12 flex items-center justify-center gap-6 text-[var(--color-text-subtle)] text-sm font-semibold">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div> System Operational</div>
            <div className="w-1 h-1 rounded-full bg-[var(--color-text-subtle)]/30"></div>
            <div>v2.0.0</div>
          </div>
        </div>
      </div>

      {/* Right side: Login form */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10">
        <div className="shell-bg-grid lg:hidden opacity-30" aria-hidden="true"></div>
        <div className="shell-bg-orb shell-bg-orb--tl opacity-60" aria-hidden="true"></div>
        <div className="shell-bg-orb shell-bg-orb--br opacity-60" aria-hidden="true"></div>

        {/* Floating Theme Toggle (Top Right) */}
        <button 
          type="button"
          onClick={toggleTheme} 
          className="absolute top-6 right-6 z-20 flex items-center justify-center h-10 w-10 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--glass-bg-hover)] transition-all shadow-sm active:scale-95 backdrop-blur-md" 
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

        {/* Login Card Box */}
        <div className="glass-card relative z-10 w-full max-w-[420px] space-y-8 p-8 sm:p-10 backdrop-blur-2xl animate-card-enter border border-[var(--glass-border)] shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-3xl">
        
        {/* Form Validation alerts */}
        {errorMsg && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs font-semibold text-red-300 flex items-center gap-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="flex-shrink-0">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p>{errorMsg}</p>
          </div>
        )}

        {/* STEP 1: STANDARD LOGIN */}
        {step === 'login' && (
          <div className="animate-fade-in">
            <div className="flex flex-col items-center text-center">
              <img 
                src={logoIcon.src} 
                alt="AfterCommerce Logo" 
                className="h-14 w-auto object-contain mb-4 select-none pointer-events-none" 
              />
              <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
                Welcome back
              </h2>
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                Sign in to your admin portal
              </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={onLoginSubmit}>
              <div className="space-y-4">
                
                {/* Email Input */}
                <div className="glass-form-group">
                  <label htmlFor="email-address" className="glass-label text-[11px] font-bold uppercase tracking-wider">
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
                  <label htmlFor="password" className="glass-label text-[11px] font-bold uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative mt-1">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      className="glass-input w-full pr-10"
                      placeholder="••••••••••••"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button type="button" className="text-[13px] font-medium text-[var(--color-accent)] hover:underline">
                  Forgot password?
                </button>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>Verifying...</span>
                  </div>
                ) : (
                  <>
                    <span>Login</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </>
                )}
              </button>
            </form>
            
            <p className="mt-6 text-center text-xs text-[var(--color-text-subtle)]">
              Secure admin access &mdash; authorised users only
            </p>
          </div>
        )}

        {/* STEP 2: 2FA VERIFICATION */}
        {step === '2fa' && (
          <div className="animate-fade-in">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-[var(--color-accent-dim)] text-[var(--color-accent)] flex items-center justify-center mb-4 border border-[var(--glass-border)] shadow-sm">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
                Two-factor auth
              </h2>
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                Enter the 6-digit code sent to your device.
              </p>
            </div>

            <form className="mt-6 space-y-5" onSubmit={onOtpSubmit}>
              <div className="glass-form-group">
                <label htmlFor="otp-2fa" className="glass-label text-[11px] font-bold uppercase tracking-wider">
                  Verification Code
                </label>
                <input
                  id="otp-2fa"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  disabled={loading}
                  className="glass-input mt-1 text-center text-2xl tracking-[0.5em] font-mono"
                  placeholder="000000"
                />
              </div>

              <div className="flex items-center justify-between text-[13px]">
                {!canResend ? (
                  <span className="text-[var(--color-text-muted)]">
                    Code expires in <span className="font-medium text-[var(--color-text-primary)]">{formatTime(timeRemaining)}</span>
                  </span>
                ) : (
                  <button type="button" onClick={resendCode} className="font-medium text-[var(--color-accent)] hover:underline">
                    Resend Code
                  </button>
                )}
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>Verifying...</span>
                  </div>
                ) : (
                  <>
                    <span>Verify & Sign in</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </>
                )}
              </button>

              <button type="button" onClick={goBackToLogin} className="flex w-full items-center justify-center gap-2 text-[13px] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] mt-4 transition-colors">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                Back to login
              </button>
            </form>
          </div>
        )}

        {/* STEP 3: FIRST-TIME SETUP */}
        {step === 'setup' && (
          <div className="animate-fade-in">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-[var(--color-accent-dim)] text-[var(--color-accent)] flex items-center justify-center mb-4 border border-[var(--glass-border)] shadow-sm">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
                Account Setup
              </h2>
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                Enter the code sent to your email to set your password.
              </p>
            </div>

            <form className="mt-6 space-y-5" onSubmit={onSetupSubmit}>
              <div className="glass-form-group">
                <label htmlFor="setup-otp" className="glass-label text-[11px] font-bold uppercase tracking-wider">
                  Verification Code
                </label>
                <input
                  id="setup-otp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  disabled={loading}
                  className="glass-input mt-1 text-center text-xl tracking-widest font-mono"
                  placeholder="000 000"
                />
              </div>

              <div className="flex items-center justify-between text-[13px]">
                {!canResend ? (
                  <span className="text-[var(--color-text-muted)]">
                    Code expires in <span className="font-medium text-[var(--color-text-primary)]">{formatTime(timeRemaining)}</span>
                  </span>
                ) : (
                  <button type="button" onClick={resendCode} className="font-medium text-[var(--color-accent)] hover:underline">
                    Resend Code
                  </button>
                )}
              </div>

              <div className="glass-form-group pt-2">
                <label htmlFor="newPassword" className="glass-label text-[11px] font-bold uppercase tracking-wider">
                  New Password
                </label>
                <div className="relative mt-1">
                  <input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={loading}
                    className="glass-input w-full pr-10"
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="glass-form-group">
                <label htmlFor="confirmPassword" className="glass-label text-[11px] font-bold uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative mt-1">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    className="glass-input w-full pr-10"
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <span>Complete Setup</span>
                )}
              </button>

              <button type="button" onClick={goBackToLogin} className="flex w-full items-center justify-center gap-2 text-[13px] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] mt-4 transition-colors">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                Back to login
              </button>
            </form>
          </div>
        )}

        </div>
      </div>
    </div>
  );
}

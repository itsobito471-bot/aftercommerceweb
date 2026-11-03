'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import logoIcon from '@/assets/images/logo-icon.svg';
import mascotAtlas from '@/assets/images/mascot-atlas.png';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

type AuthMode = 'register' | 'login';
type OnboardingPhase = 'auth' | 'category' | 'course_selection' | 'course_single';

interface CategoryItem {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  courseCount?: number;
  routeCode?: string;
  gateCode?: string;
  trackTag?: string;
  tierTag?: string;
}

interface CourseItem {
  _id: string;
  title: string;
  description?: string;
  category_id?: { _id: string; name: string };
  price?: number;
  sale_price?: number;
  featured_image_url?: string;
  duration?: string;
  rating?: number;
  tutor?: string;
  nodesCount?: number;
  progress?: number;
  claimed?: boolean;
}

// Fallback high-fidelity commerce categories matching Image 2
const FALLBACK_CATEGORIES: CategoryItem[] = [
  {
    _id: 'cat_ca',
    name: 'Chartered Accountancy',
    description: 'Foundations & strategic audit with real industry reporting practice.',
    routeCode: 'CA',
    gateCode: 'Gate A-12',
    trackTag: 'Track: Direct',
    tierTag: 'TIER 1 EXPEDITION',
    courseCount: 3
  },
  {
    _id: 'cat_cma',
    name: 'Cost & Management',
    description: 'Costing architectures, executive strategy, and financial modeling.',
    routeCode: 'CMA',
    gateCode: 'Gate B-04',
    trackTag: 'Track: Corporate',
    tierTag: 'CMA CERTIFIED',
    courseCount: 2
  },
  {
    _id: 'cat_bcom',
    name: 'Bachelor of Commerce',
    description: 'Fortify degree foundations with applied commercial accounting skills.',
    routeCode: 'BCOM',
    gateCode: 'Gate C-08',
    trackTag: 'Track: Foundation',
    tierTag: 'UNDERGRAD PRO',
    courseCount: 1
  },
  {
    _id: 'cat_job',
    name: 'Get Job-Ready',
    description: 'Master advanced Excel, GST filing, compliance, and corporate ledgers.',
    routeCode: 'JOB',
    gateCode: 'Gate D-16',
    trackTag: 'Track: Accelerated',
    tierTag: 'CAREER SPRINT',
    courseCount: 4
  }
];

// Fallback sample courses matching Image 3
const FALLBACK_COURSES: CourseItem[] = [
  {
    _id: 'c1',
    title: 'Basics of Taxation: Corporate GST & Deductions',
    description: 'Master corporate GST mechanisms, input tax credit reconciliation, cross-border filing defenses, and TDS claim pipelines.',
    tutor: 'Ahmed Muneer, CPA',
    duration: '140 Mins',
    rating: 4.9,
    nodesCount: 30,
    progress: 73,
    price: 3499
  },
  {
    _id: 'c2',
    title: 'Advanced Accounting',
    description: 'Consolidated statements, holding companies, and GAAP accounting structures.',
    tutor: 'Ahmed Muneer, CPA',
    duration: '120 Mins',
    rating: 4.8,
    nodesCount: 38,
    progress: 45,
    price: 2999
  },
  {
    _id: 'c3',
    title: 'GST Essentials & Systemic Audit',
    description: 'Audit trails, automated scrutiny checks, and input tax compliance verification.',
    tutor: 'Sneha Kapoor, CA',
    duration: '90 Mins',
    rating: 4.9,
    nodesCount: 24,
    progress: 100,
    claimed: true,
    price: 2499
  },
  {
    _id: 'c4',
    title: 'Financial Statement Analysis',
    description: 'Ratio engines, forensic balance sheet auditing, and cash flow decomposition.',
    tutor: 'Rohan Verma, FCA',
    duration: '100 Mins',
    rating: 4.8,
    nodesCount: 26,
    progress: 12,
    price: 2799
  }
];

export default function OnboardingPage() {
  const router = useRouter();

  // Phase tracker
  const [phase, setPhase] = useState<OnboardingPhase>('auth');
  const [authMode, setAuthMode] = useState<AuthMode>('register');

  // Registration & Login Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Category & Course Data States
  const [categories, setCategories] = useState<CategoryItem[]>(FALLBACK_CATEGORIES);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('cat_ca');
  const [courses, setCourses] = useState<CourseItem[]>(FALLBACK_COURSES);
  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null);

  // Fetch categories from backend on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/public/categories-with-courses`);
        if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          // Enrich with routes and badges
          const enriched = res.data.data.map((cat: CategoryItem, idx: number) => ({
            ...cat,
            routeCode: cat.routeCode || cat.name.split(' ').map((w: string) => w[0]).join('').slice(0, 3).toUpperCase() || `R0${idx + 1}`,
            gateCode: cat.gateCode || `Gate ${String.fromCharCode(65 + idx)}-0${idx + 4}`,
            trackTag: cat.trackTag || (idx % 2 === 0 ? 'Track: Direct' : 'Track: Corporate'),
            tierTag: cat.tierTag || (idx === 0 ? 'TIER 1 EXPEDITION' : 'ACCREDITED')
          }));
          setCategories(enriched);
          setSelectedCategoryId(enriched[0]._id);
        }
      } catch {
        // Fallback already preloaded
      }
    };
    fetchCategories();
  }, []);

  // Handle Auth submission
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (authMode === 'register') {
      if (!name.trim()) return setErrorMsg('Please enter your full name.');
      if (!email.trim()) return setErrorMsg('Please enter a valid email address.');
      if (password.length < 6) return setErrorMsg('Password must be at least 6 characters.');
      if (password !== confirmPassword) return setErrorMsg('Passwords do not match.');

      try {
        setLoading(true);
        const res = await axios.post(`${BACKEND_URL}/api/auth/register`, {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          password
        });

        if (res.data?.success) {
          if (res.data.token) {
            localStorage.setItem('student_token', res.data.token);
            localStorage.setItem('student_user', JSON.stringify(res.data.user || {}));
            document.cookie = `student_token=${res.data.token}; path=/; max-age=604800; SameSite=Lax`;
          }

          setSuccessMsg('Account registered! Calibrating expedition...');
          
          // Determine single category skip rule
          setTimeout(() => {
            handlePostAuthTransition();
          }, 600);
        } else {
          setErrorMsg(res.data?.message || 'Registration failed.');
        }
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        setErrorMsg(error.response?.data?.message || 'Failed to connect. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      // Login mode
      if (!email.trim() || !password) return setErrorMsg('Please enter your email and password.');

      try {
        setLoading(true);
        const res = await axios.post(`${BACKEND_URL}/api/auth/login`, {
          email: email.trim(),
          password
        });

        if (res.data?.success) {
          if (res.data.token) {
            localStorage.setItem('student_token', res.data.token);
            localStorage.setItem('student_user', JSON.stringify(res.data.user || {}));
            document.cookie = `student_token=${res.data.token}; path=/; max-age=604800; SameSite=Lax`;
          }

          setSuccessMsg('Signed in! Proceeding to your courses...');
          setTimeout(() => {
            handlePostAuthTransition();
          }, 600);
        } else {
          setErrorMsg(res.data?.message || 'Invalid credentials.');
        }
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        setErrorMsg(error.response?.data?.message || 'Invalid email or password.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Check category count rule
  const handlePostAuthTransition = () => {
    // Active categories with courses
    const activeCategoriesWithCourses = categories.filter(c => (c.courseCount ?? 1) > 0);

    // If only one category exists (or only one has courses), select it and skip directly to course selection
    if (activeCategoriesWithCourses.length === 1) {
      const singleCat = activeCategoriesWithCourses[0];
      setSelectedCategoryId(singleCat._id);
      loadCoursesForCategory(singleCat._id);
    } else {
      setPhase('category');
    }
  };

  // Load courses for selected category
  const loadCoursesForCategory = async (categoryId: string) => {
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/api/public/courses?categoryId=${categoryId}`);
      let fetchedCourses = FALLBACK_COURSES;
      if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        fetchedCourses = res.data.data;
      }
      setCourses(fetchedCourses);

      // If only 1 course is available, display single course breakdown + payment
      if (fetchedCourses.length === 1) {
        setSelectedCourse(fetchedCourses[0]);
        setPhase('course_single');
      } else {
        setPhase('course_selection');
      }
    } catch {
      setCourses(FALLBACK_COURSES);
      setPhase('course_selection');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryContinue = () => {
    loadCoursesForCategory(selectedCategoryId);
  };

  return (
    <div className="relative min-h-screen bg-[#F8F9FC] text-[#1A1A2E] font-['Poppins',sans-serif] flex flex-col justify-between selection:bg-[#2B4788] selection:text-white">
      {/* Background radial lattice texture matching landing page */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(30, 41, 59, 0.18) 1.2px, transparent 1.2px)',
          backgroundSize: '28px 28px',
          backgroundColor: '#F8F9FC'
        }}
      />

      {/* Ambient gradient glow in background */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#2B4788]/10 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-80 h-80 bg-[#FF6B35]/10 rounded-full filter blur-3xl pointer-events-none" />

      {/* ── TOP HEADER / STEP CONTROLS (Matching Image 2 Style) ── */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 pt-5 pb-2 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-8 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
            <img 
              src={logoIcon.src} 
              alt="After Commerce Logo" 
              className="w-full h-full object-contain select-none pointer-events-none" 
            />
          </div>
          <span className="font-extrabold text-[15px] tracking-wider text-[#1A1A2E] font-['Poppins',sans-serif]">
            AFTER COMMERCE
          </span>
        </Link>

        {/* Phase step indicator */}
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/90 border border-slate-200/90 shadow-sm text-xs font-mono font-semibold text-slate-600">
            <span>
              {phase === 'auth' && 'Step 1 of 3 • Auth'}
              {phase === 'category' && 'Step 2 of 3 • Destination'}
              {(phase === 'course_selection' || phase === 'course_single') && 'Step 3 of 3 • Curriculum'}
            </span>
            <div className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${phase === 'auth' ? 'bg-[#FF6B35]' : 'bg-[#2B4788]'}`} />
              <span className={`w-2 h-2 rounded-full ${phase === 'category' ? 'bg-[#2B4788]' : 'bg-slate-300'}`} />
              <span className={`w-2 h-2 rounded-full ${phase.startsWith('course') ? 'bg-[#2B4788]' : 'bg-slate-300'}`} />
            </div>
          </div>

          <Link
            href="/"
            className="text-xs font-semibold text-slate-500 hover:text-[#2B4788] transition-colors flex items-center gap-1.5 ml-2"
          >
            <span>Skip for now</span>
          </Link>
        </div>
      </header>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-6 sm:py-10">

        {/* ════════════════════════════════════════════════════════════════
            PHASE 1: AUTHENTICATION + ATLAS MASCOT GUIDE COMPANION
           ════════════════════════════════════════════════════════════════ */}
        {phase === 'auth' && (
          <div className="w-full max-w-4xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 animate-fade-in">
            
            {/* Left/Companion Column: Mascot Avatar Guide */}
            <div className="hidden lg:flex flex-col items-center text-center max-w-xs">
              <div className="relative group cursor-pointer mb-5">
                {/* Outer Glass Aura Ring */}
                <div className="w-44 h-44 rounded-3xl p-3 bg-white/70 backdrop-blur-md border border-white/90 shadow-[0_15px_35px_rgba(27,43,85,0.08)] flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <img 
                    src={mascotAtlas.src} 
                    alt="Atlas Guidance Companion" 
                    className="w-full h-full object-contain rounded-2xl select-none"
                  />
                </div>
                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#1A1A2E] text-white font-mono text-[10px] font-bold uppercase tracking-wider shadow">
                  ATLAS GUIDANCE
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur border border-slate-200/90 rounded-2xl p-4 shadow-sm text-left relative">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-[10px] font-bold text-slate-700 tracking-wider">EXPEDITION READY</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-['Poppins',sans-serif]">
                  &quot;Welcome candidate! Fill your details to calibrate your destination chart and claim priority entry passes.&quot;
                </p>
              </div>
            </div>

            {/* Right Column: Liquid Glass Auth Card */}
            <div className="w-full max-w-md">
              <div 
                className="rounded-3xl p-7 sm:p-9 shadow-[0_20px_50px_rgba(27,43,85,0.08),0_1px_2px_rgba(255,255,255,0.9)_inset] border border-white/80 transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.90) 0%, rgba(248, 250, 252, 0.82) 100%)',
                  backdropFilter: 'blur(20px) saturate(190%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(190%)',
                }}
              >
                {/* Header Title */}
                <div className="text-center mb-6">
                  <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-[#2B4788] font-mono text-[10px] font-bold uppercase tracking-wider mb-2.5 border border-blue-100">
                    {authMode === 'register' ? 'STUDENT ONBOARDING' : 'STUDENT PORTAL'}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A2E] tracking-tight">
                    {authMode === 'register' ? 'Create your account' : 'Welcome back'}
                  </h1>
                  <p className="mt-1.5 text-xs text-slate-500">
                    {authMode === 'register' 
                      ? 'Start your journey into high-performance commerce' 
                      : 'Enter your credentials to continue learning'}
                  </p>
                </div>

                {/* Error & Success Alerts */}
                {errorMsg && (
                  <div className="mb-5 p-3 rounded-xl bg-red-50/90 border border-red-200 text-red-600 text-xs font-medium flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="mb-5 p-3 rounded-xl bg-emerald-50/90 border border-emerald-200 text-emerald-700 text-xs font-medium flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {authMode === 'register' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Full Name <span className="text-orange-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Sarah Jenkins"
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2B4788]/20 focus:border-[#2B4788] transition-all shadow-sm"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Email Address <span className="text-orange-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2B4788]/20 focus:border-[#2B4788] transition-all shadow-sm"
                    />
                  </div>

                  {authMode === 'register' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2B4788]/20 focus:border-[#2B4788] transition-all shadow-sm"
                      />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        Password <span className="text-orange-500">*</span>
                      </label>
                      {authMode === 'login' && (
                        <a
                          href="#forgot-password"
                          onClick={(e) => {
                            e.preventDefault();
                            alert('Password reset link has been dispatched to your email address.');
                          }}
                          className="text-[11px] font-medium text-[#2B4788] hover:underline"
                        >
                          Forgot password?
                        </a>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 pr-10 rounded-xl bg-white border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2B4788]/20 focus:border-[#2B4788] transition-all shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-medium"
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>

                  {authMode === 'register' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Confirm Password <span className="text-orange-500">*</span>
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2B4788]/20 focus:border-[#2B4788] transition-all shadow-sm"
                      />
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 px-4 rounded-xl bg-[#1A1A2E] hover:bg-slate-800 text-white font-bold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {loading && (
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      )}
                      <span>{authMode === 'register' ? 'COMPLETE ONBOARDING' : 'SIGN IN'}</span>
                      <span>→</span>
                    </button>
                  </div>
                </form>

                {/* Mode Switcher */}
                <div className="mt-6 pt-5 border-t border-slate-200/80 text-center">
                  {authMode === 'register' ? (
                    <p className="text-xs text-slate-600">
                      Already a student?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('login');
                          setErrorMsg('');
                          setSuccessMsg('');
                        }}
                        className="font-bold text-[#2B4788] hover:underline cursor-pointer ml-1"
                      >
                        Login here
                      </button>
                    </p>
                  ) : (
                    <p className="text-xs text-slate-600">
                      New to After Commerce?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('register');
                          setErrorMsg('');
                          setSuccessMsg('');
                        }}
                        className="font-bold text-[#FF6B35] hover:underline cursor-pointer ml-1"
                      >
                        Register now
                      </button>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            PHASE 2: "WHERE ARE YOU HEADED?" CATEGORY BOARDING PASS TICKETS
           ════════════════════════════════════════════════════════════════ */}
        {phase === 'category' && (
          <div className="w-full max-w-4xl mx-auto flex flex-col items-center animate-fade-in">
            {/* Header Manifest Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50/80 border border-blue-200/60 text-[#2B4788] font-mono text-[10px] font-bold uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-[#2B4788] animate-pulse" />
              EXPEDITION MANIFEST • 2025
            </div>

            {/* Headline with wavy accent */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1A1A2E] text-center tracking-tight font-['Poppins',sans-serif]">
              Where are you <span className="text-[#2B4788] relative inline-block underline decoration-wavy decoration-cyan-400">headed?</span>
            </h1>
            <p className="mt-2 text-sm text-slate-500 text-center max-w-md">
              Pick your destination. We&apos;ll calibrate the chart and plan the route.
            </p>

            {/* 2x2 Boarding Pass Perforated Tickets Grid */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
              {categories.map((cat) => {
                const isSelected = selectedCategoryId === cat._id;

                return (
                  <div
                    key={cat._id}
                    onClick={() => setSelectedCategoryId(cat._id)}
                    className={`relative flex rounded-3xl bg-white border-2 cursor-pointer transition-all duration-300 shadow-sm hover:shadow-xl transform hover:-translate-y-1 overflow-hidden ${
                      isSelected
                        ? 'border-[#2B4788] ring-4 ring-[#2B4788]/10'
                        : 'border-slate-200/90 hover:border-slate-300'
                    }`}
                  >
                    {/* Left Main Ticket Section */}
                    <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between relative">
                      {/* Destination Header Pill */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2B4788] flex items-center justify-center font-bold text-xs border border-blue-100">
                            🎓
                          </div>
                          <span className="font-mono text-[9px] font-bold text-blue-600 uppercase tracking-wider">
                            DESTINATION • {cat.tierTag || 'EXPEDITION'}
                          </span>
                        </div>

                        <span className="font-mono text-[8px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          PRIORITY PASS
                        </span>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h3 className="font-extrabold text-lg sm:text-xl text-[#1A1A2E] font-['Poppins',sans-serif] leading-tight">
                          {cat.name}
                        </h3>
                        <p className="mt-1.5 text-xs text-slate-500 leading-relaxed font-normal">
                          {cat.description || 'Comprehensive curriculum with practical real-world training.'}
                        </p>
                      </div>

                      {/* Footer tags */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono font-semibold text-slate-500">
                        <span>{cat.trackTag || 'Track: Direct'}</span>
                        <span className="text-[#FF6B35] font-bold">
                          {cat.courseCount ?? 1} {(cat.courseCount ?? 1) === 1 ? 'COURSE' : 'COURSES'}
                        </span>
                      </div>

                      {/* Rubber Ink Stamp: "CHOSEN" (Visible when selected) */}
                      {isSelected && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 rotate-[-12deg] pointer-events-none select-none animate-scale-in">
                          <div className="border-[3px] border-[#2B4788] rounded-xl px-4 py-1.5 bg-blue-50/90 shadow-md">
                            <span className="font-black font-mono text-sm tracking-widest text-[#2B4788]">
                              CHOSEN
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Perforation Cutline with Circles */}
                    <div className="relative w-0 border-r-2 border-dashed border-slate-300 flex flex-col justify-between py-2">
                      <div className="w-4 h-4 rounded-full bg-[#F8F9FC] absolute -top-2 -left-2 border border-slate-200" />
                      <div className="w-4 h-4 rounded-full bg-[#F8F9FC] absolute -bottom-2 -left-2 border border-slate-200" />
                    </div>

                    {/* Right Tear-off Stub */}
                    <div className="w-24 sm:w-28 p-3 sm:p-4 bg-slate-50/60 flex flex-col items-center justify-between text-center select-none">
                      <div className="font-mono text-[9px] text-slate-400 font-bold uppercase">
                        ROUTE
                      </div>
                      
                      <div className="my-auto">
                        <span className="font-black text-xl sm:text-2xl font-mono text-[#2B4788] tracking-wider block">
                          {cat.routeCode || 'ROUTE'}
                        </span>
                        <span className="font-mono text-[9px] text-slate-500 font-semibold block mt-0.5">
                          {cat.gateCode || 'Gate 01'}
                        </span>
                      </div>

                      {/* Barcode Graphic */}
                      <div className="w-full flex items-center justify-center gap-[2px] opacity-60">
                        <span className="w-[1.5px] h-6 bg-slate-800" />
                        <span className="w-[3px] h-6 bg-slate-800" />
                        <span className="w-[1px] h-6 bg-slate-800" />
                        <span className="w-[2px] h-6 bg-slate-800" />
                        <span className="w-[1px] h-6 bg-slate-800" />
                        <span className="w-[3.5px] h-6 bg-slate-800" />
                        <span className="w-[1px] h-6 bg-slate-800" />
                        <span className="w-[2px] h-6 bg-slate-800" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions Bar */}
            <div className="mt-8 w-full flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setPhase('auth')}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:text-slate-900 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>← Back</span>
              </button>

              <button
                type="button"
                onClick={handleCategoryContinue}
                disabled={loading}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#FF7D47] to-[#FF6B35] hover:from-[#ff8c5a] hover:to-[#ff7642] text-white font-bold text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 cursor-pointer"
              >
                {loading ? 'Calibrating...' : 'Continue'}
                <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            PHASE 3A: MULTI-COURSE SELECTION GRID (Matching Image 3)
           ════════════════════════════════════════════════════════════════ */}
        {phase === 'course_selection' && (
          <div className="w-full max-w-5xl mx-auto flex flex-col items-center animate-fade-in">
            {/* Header info */}
            <div className="text-center mb-7">
              <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-[#2B4788] font-mono text-[10px] font-bold uppercase tracking-wider mb-2 border border-blue-100">
                CURRICULUM RADAR • CALIBRATION COMPLETE
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1A1A2E] tracking-tight font-['Poppins',sans-serif]">
                Choose your learning trajectory
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Select your launch course module to begin practical mastery and career certification.
              </p>
            </div>

            {/* 3D Isometric Course Grid (Matching Image 3) */}
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Featured / Hero Course Card (Spans 2 columns on desktop) */}
              {courses.length > 0 && (
                <div className="md:col-span-2 rounded-3xl bg-white border border-slate-200/90 shadow-lg p-5 sm:p-7 flex flex-col justify-between relative overflow-hidden group hover:border-[#2B4788] transition-all">
                  <div className="flex flex-col sm:flex-row gap-5 items-start">
                    {/* Isometric 3D Cube Canvas Thumbnail */}
                    <div 
                      className="w-full sm:w-48 h-40 rounded-2xl flex items-center justify-center p-4 relative shadow-inner shrink-0"
                      style={{
                        background: 'radial-gradient(circle at 30% 30%, #1e3a8a 0%, #12215c 60%, #0a1133 100%)'
                      }}
                    >
                      {/* Isometric Cube Graphic */}
                      <div className="relative w-20 h-20 flex items-center justify-center">
                        <div className="w-14 h-14 border-2 border-emerald-400/80 rounded-lg transform rotate-45 flex items-center justify-center shadow-lg">
                          <span className="font-mono text-[10px] font-bold text-white uppercase">NODE</span>
                        </div>
                      </div>

                      <span className="absolute bottom-2 left-3 px-2 py-0.5 rounded bg-white/20 backdrop-blur text-white font-mono text-[8px] font-bold uppercase">
                        Scout Active
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 font-mono text-[9px] font-bold text-blue-600">
                        <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-100 uppercase">
                          VOCATIONAL LEVEL 4 // FISCAL GOVERNANCE
                        </span>
                        <span className="text-slate-400">★ 4.9 (1.4k Enrolled)</span>
                      </div>

                      <h3 className="font-extrabold text-lg sm:text-xl text-[#1A1A2E] leading-snug">
                        {courses[0].title}
                      </h3>
                      <p className="mt-1.5 text-xs text-slate-500 leading-relaxed font-normal">
                        {courses[0].description}
                      </p>

                      <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-700">
                        <div className="w-6 h-6 rounded-full bg-[#1E3494] text-white flex items-center justify-center text-[10px] font-bold">
                          AM
                        </div>
                        <span>Tutor: {courses[0].tutor || 'Executive Faculty'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress & Action Bar */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="w-full sm:w-1/2">
                      <div className="flex items-center justify-between text-[11px] font-mono font-semibold text-slate-600 mb-1">
                        <span>Territory Claimed: {courses[0].progress || 73}%</span>
                        <span>22/30 Levels Verified</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#FF7D47] to-[#FF6B35] rounded-full transition-all duration-500"
                          style={{ width: `${courses[0].progress || 73}%` }}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCourse(courses[0]);
                        setPhase('course_single');
                      }}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF7D47] to-[#FF6B35] hover:from-[#ff8c5a] text-white font-bold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer whitespace-nowrap"
                    >
                      Continue Expedition →
                    </button>
                  </div>
                </div>
              )}

              {/* Side Course 1 (Matching Image 3) */}
              {courses.length > 1 && (
                <div className="rounded-3xl bg-white border border-slate-200/90 shadow p-5 flex flex-col justify-between hover:border-[#2B4788] transition-all">
                  <div 
                    className="w-full h-28 rounded-2xl flex items-center justify-center p-3 relative shadow-inner mb-4"
                    style={{
                      background: 'radial-gradient(circle at 30% 30%, #1e3a8a 0%, #12215c 80%, #0a1133 100%)'
                    }}
                  >
                    <div className="w-10 h-10 border-2 border-orange-400 rounded-lg transform rotate-12 flex items-center justify-center shadow">
                      <span className="font-mono text-[9px] font-bold text-white">45%</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-sm text-[#1A1A2E]">
                      {courses[1].title}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-normal block mt-0.5">
                      Tutor: {courses[1].tutor || 'Faculty'}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-600">Progress: 45%</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCourse(courses[1]);
                        setPhase('course_single');
                      }}
                      className="px-4 py-1.5 rounded-lg bg-[#1E3494] hover:bg-[#2B4788] text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      Continue →
                    </button>
                  </div>
                </div>
              )}

              {/* Side Course 2 (Certificate Claimed - Green Box) */}
              {courses.length > 2 && (
                <div className="rounded-3xl bg-white border border-slate-200/90 shadow p-5 flex flex-col justify-between hover:border-emerald-600 transition-all">
                  <div 
                    className="w-full h-28 rounded-2xl flex items-center justify-center p-3 relative shadow-inner mb-4"
                    style={{
                      background: 'radial-gradient(circle at 30% 30%, #065f46 0%, #047857 60%, #064e3b 100%)'
                    }}
                  >
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/30 text-white font-mono text-[9px] font-bold uppercase">
                      100% CLAIMED
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-sm text-[#1A1A2E]">
                      {courses[2].title}
                    </h4>
                    <span className="text-[11px] text-emerald-600 font-bold block mt-0.5">
                      ✓ Claimed & Mastered
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400">ID: #GST-004</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCourse(courses[2]);
                        setPhase('course_single');
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
                    >
                      View Certificate
                    </button>
                  </div>
                </div>
              )}

              {/* Side Course 3 */}
              {courses.length > 3 && (
                <div className="md:col-span-2 rounded-3xl bg-white border border-slate-200/90 shadow p-5 flex flex-col sm:flex-row items-center justify-between gap-4 hover:border-[#2B4788] transition-all">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-16 h-16 rounded-xl flex items-center justify-center p-2 shrink-0"
                      style={{
                        background: 'radial-gradient(circle at 30% 30%, #1e3a8a 0%, #12215c 80%, #0a1133 100%)'
                      }}
                    >
                      <span className="text-cyan-300 font-mono text-xs font-bold">12%</span>
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-[#1A1A2E]">
                        {courses[3].title}
                      </h4>
                      <p className="text-xs text-slate-500 font-normal">
                        Tutor: {courses[3].tutor} • 100 Mins • 4.8 ★
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCourse(courses[3]);
                      setPhase('course_single');
                    }}
                    className="px-5 py-2 rounded-xl bg-[#1A1A2E] hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    Continue →
                  </button>
                </div>
              )}
            </div>

            {/* Back action */}
            <div className="mt-7 w-full flex items-center justify-start">
              <button
                type="button"
                onClick={() => setPhase('category')}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:text-slate-900 font-semibold text-xs transition-colors cursor-pointer"
              >
                ← Back to Categories
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            PHASE 3B: SINGLE COURSE PREVIEW & PAYMENT CHECKOUT
           ════════════════════════════════════════════════════════════════ */}
        {phase === 'course_single' && selectedCourse && (
          <div className="w-full max-w-3xl mx-auto flex flex-col items-center animate-fade-in">
            <div className="w-full rounded-3xl bg-white border border-slate-200 shadow-xl p-6 sm:p-10 relative overflow-hidden">
              {/* Header badge */}
              <div className="flex items-center justify-between gap-3 mb-4">
                <span className="px-3 py-1 rounded-full bg-blue-50 text-[#2B4788] font-mono text-xs font-bold uppercase tracking-wider">
                  DIRECT ENROLLMENT CLEARANCE
                </span>
                <span className="font-mono text-xs font-bold text-emerald-600">
                  INSTANT ADMISSION
                </span>
              </div>

              {/* Course Title & Overview */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A2E] leading-tight font-['Poppins',sans-serif]">
                {selectedCourse.title}
              </h1>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                {selectedCourse.description || 'Comprehensive curriculum with hands-on real-world financial systems training and executive mentorship.'}
              </p>

              {/* Course Highlights Grid */}
              <div className="my-6 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs text-slate-600">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="block text-slate-400 text-[10px]">TUTOR</span>
                  <span className="font-bold text-slate-800">{selectedCourse.tutor || 'Senior Faculty'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="block text-slate-400 text-[10px]">DURATION</span>
                  <span className="font-bold text-slate-800">{selectedCourse.duration || '120 Mins'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="block text-slate-400 text-[10px]">RATING</span>
                  <span className="font-bold text-slate-800">★ {selectedCourse.rating || 4.9} / 5.0</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="block text-slate-400 text-[10px]">STATUS</span>
                  <span className="font-bold text-emerald-600">OPEN REGISTRATION</span>
                </div>
              </div>

              {/* Pricing & Checkout Initiation */}
              <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-400 block font-mono">ADMISSION INVESTMENT</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-[#1A1A2E] font-['Poppins',sans-serif]">
                      ₹{(selectedCourse.price || 3499).toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400 line-through">₹5,999</span>
                    <span className="text-xs font-bold text-emerald-600">42% OFF</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      if (courses.length > 1) {
                        setPhase('course_selection');
                      } else {
                        setPhase('category');
                      }
                    }}
                    className="px-5 py-3 rounded-xl border border-slate-300 text-slate-600 hover:text-slate-900 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    ← Back
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      alert('Order gateway initialized! Securing admission slot...');
                      router.push('/');
                    }}
                    className="flex-1 sm:flex-none px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#FF7D47] to-[#FF6B35] hover:from-[#ff8c5a] text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                  >
                    PROCEED TO PAYMENT →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-slate-400 font-mono">
        © 2026 AFTER COMMERCE • SECURE ONBOARDING PIPELINE
      </footer>
    </div>
  );
}

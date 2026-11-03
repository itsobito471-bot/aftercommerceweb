'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import logoIcon from '@/assets/images/logo-icon.svg';
import mascotLogin from '@/assets/images/mascot/login.png';
import mascotRegister from '@/assets/images/mascot/register.png';

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
  iconType?: 'grad' | 'strategy' | 'book' | 'briefcase';
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
  tutorRole?: string;
  nodesCount?: number;
  progress?: number;
  claimed?: boolean;
  sectorTag?: string;
  levelsVerified?: string;
  subregions?: string;
  enrolledCount?: string;
}

// ── Fallback High-Fidelity Categories Matching Image 2 ──
const FALLBACK_CATEGORIES: CategoryItem[] = [
  {
    _id: 'cat_ca',
    name: 'Chartered Accountancy',
    description: 'Foundations & strategic audit with real industry reporting practice.',
    routeCode: 'CA',
    gateCode: 'Gate A-12',
    trackTag: '▲ Track: Direct',
    tierTag: 'TIER 1 EXPEDITION',
    courseCount: 3,
    iconType: 'grad'
  },
  {
    _id: 'cat_cma',
    name: 'Cost & Management',
    description: 'Costing architectures, executive strategy, and financial modeling.',
    routeCode: 'CMA',
    gateCode: 'Gate B-04',
    trackTag: 'Track: Corporate',
    tierTag: 'CMA CERTIFIED',
    courseCount: 2,
    iconType: 'strategy'
  },
  {
    _id: 'cat_bcom',
    name: 'Bachelor of Commerce',
    description: 'Fortify degree foundations with applied commercial accounting skills.',
    routeCode: 'BCOM',
    gateCode: 'Gate C-08',
    trackTag: 'Track: Foundation',
    tierTag: 'UNDERGRAD PRO',
    courseCount: 1,
    iconType: 'book'
  },
  {
    _id: 'cat_job',
    name: 'Get Job-Ready',
    description: 'Master advanced Excel, GST filing, compliance, and corporate ledgers.',
    routeCode: 'JOB',
    gateCode: 'Gate D-16',
    trackTag: 'Track: Accelerated',
    tierTag: 'CAREER SPRINT',
    courseCount: 4,
    iconType: 'briefcase'
  }
];

// ── Fallback High-Fidelity Courses Matching Image 3 ──
const FALLBACK_COURSES: CourseItem[] = [
  {
    _id: 'c1',
    title: 'Basics of Taxation: Corporate GST & Deductions',
    description: 'Master corporate GST mechanisms, input tax credit reconciliation, cross-border filing defenses, and TDS claim pipelines.',
    tutor: 'Ahmed Muneer, CPA',
    tutorRole: 'lead fiscal architect • ernst & young alum',
    duration: '140 Mins',
    subregions: '5 Sub-regions',
    rating: 4.9,
    enrolledCount: '1.4k Enrolled',
    nodesCount: 30,
    progress: 73,
    levelsVerified: '22/30 Levels Verified',
    sectorTag: 'VOCATIONAL LEVEL 4 // FISCAL GOVERNANCE',
    price: 3499
  },
  {
    _id: 'c2',
    title: 'Advanced Accounting',
    description: 'Consolidated statements, holding companies, and GAAP accounting structures.',
    tutor: 'Ahmed Muneer, CPA',
    duration: '120 mins',
    subregions: '4 regions',
    rating: 4.8,
    nodesCount: 30,
    progress: 45,
    levelsVerified: '14 of 30 levels',
    sectorTag: 'SECTOR 02 // ACC',
    price: 2999
  },
  {
    _id: 'c3',
    title: 'GST Essentials & Systemic Audit',
    description: 'Audit trails, automated scrutiny checks, and input tax compliance verification.',
    tutor: 'Sneha Kapoor, CA',
    duration: '90 mins',
    subregions: '3 regions',
    rating: 4.9,
    nodesCount: 24,
    progress: 100,
    claimed: true,
    levelsVerified: 'Claimed & Mastered',
    sectorTag: 'SECTOR 01 // CONQUERED',
    price: 2499
  },
  {
    _id: 'c4',
    title: 'Financial Statement Analysis',
    description: 'Ratio engines, forensic balance sheet auditing, and cash flow decomposition.',
    tutor: 'Rohan Verma, FCA',
    duration: '180 mins',
    subregions: '4 regions',
    rating: 4.8,
    nodesCount: 26,
    progress: 12,
    levelsVerified: '4 of 26 levels',
    sectorTag: 'SECTOR 03 // FIN',
    price: 2799
  }
];

// ── SVG Isometric 3D Cube Component (Pixel-perfect vector geometry for Image 3) ──
function IsometricCube({
  topColor = '#10B981',
  leftColor = '#1E3A8A',
  rightColor = '#FF6B35',
  hasFlag = false,
  size = 110,
  glow = false
}: {
  topColor?: string;
  leftColor?: string;
  rightColor?: string;
  hasFlag?: boolean;
  size?: number;
  glow?: boolean;
}) {
  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: size, height: size }}>
      {glow && (
        <div 
          className="absolute inset-0 rounded-full blur-xl pointer-events-none opacity-40"
          style={{ background: `radial-gradient(circle, ${topColor} 0%, transparent 70%)` }}
        />
      )}
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full drop-shadow-md overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Isometric Cube Faces:
            Center V0=(100, 100)
            Top V1=(100, 52)
            Top-Right V2=(142, 76)
            Bottom-Right V3=(142, 124)
            Bottom V4=(100, 148)
            Bottom-Left V5=(58, 124)
            Top-Left V6=(58, 76)
        */}

        {/* Top Face */}
        <path
          d="M 100,52 L 142,76 L 100,100 L 58,76 Z"
          fill={topColor}
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Left Face */}
        <path
          d="M 58,76 L 100,100 L 100,148 L 58,124 Z"
          fill={leftColor}
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Right Face */}
        <path
          d="M 100,100 L 142,76 L 142,124 L 100,148 Z"
          fill={rightColor}
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Vertex Circular Nodes */}
        <circle cx="100" cy="52" r="4.5" fill="#FFFFFF" stroke={topColor} strokeWidth="1.5" />
        <circle cx="142" cy="76" r="4.5" fill="#FFFFFF" stroke={topColor} strokeWidth="1.5" />
        <circle cx="142" cy="124" r="4.5" fill="#FFFFFF" stroke={rightColor} strokeWidth="1.5" />
        <circle cx="100" cy="148" r="4.5" fill="#FFFFFF" stroke={leftColor} strokeWidth="1.5" />
        <circle cx="58" cy="124" r="4.5" fill="#FFFFFF" stroke={leftColor} strokeWidth="1.5" />
        <circle cx="58" cy="76" r="4.5" fill="#FFFFFF" stroke={leftColor} strokeWidth="1.5" />
        <circle cx="100" cy="100" r="4.5" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.5" />

        {/* Optional Expedition Flag on Top Vertex (Card 3) */}
        {hasFlag && (
          <g>
            <line x1="100" y1="52" x2="100" y2="24" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 100,24 L 124,32 L 100,40 Z" fill="#FBBF24" />
            <circle cx="100" cy="24" r="2.5" fill="#FFFFFF" />
          </g>
        )}
      </svg>
    </div>
  );
}

// ── SVG Isometric Faceted Polyhedron for Card 4 (Financial Statement Analysis) ──
function IsometricPolyhedron({ size = 110 }: { size?: number }) {
  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full drop-shadow-md overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Base polygon wireframe */}
        <polygon
          points="100,162 144,142 152,108 100,126 48,108 56,142"
          fill="#0F1C4D"
          stroke="#38BDF8"
          strokeWidth="1.5"
          strokeDasharray="3 3"
          opacity="0.6"
        />

        {/* Facet faces */}
        <polygon points="100,126 144,142 128,94 100,84" fill="#1E3275" stroke="#FFFFFF" strokeWidth="1.8" />
        <polygon points="100,126 56,142 72,94 100,84" fill="#172554" stroke="#FFFFFF" strokeWidth="1.8" />
        
        {/* Top Hexagonal / Rhomboid Cap (Orange) */}
        <polygon points="100,60 128,72 128,94 100,84 72,94 72,72" fill="#FF6B35" stroke="#FFFFFF" strokeWidth="2" />

        {/* Vertices */}
        <circle cx="100" cy="60" r="3.5" fill="#FFFFFF" />
        <circle cx="128" cy="72" r="3.5" fill="#FFFFFF" />
        <circle cx="128" cy="94" r="3.5" fill="#FFFFFF" />
        <circle cx="100" cy="84" r="3.5" fill="#FFFFFF" />
        <circle cx="72" cy="94" r="3.5" fill="#FFFFFF" />
        <circle cx="72" cy="72" r="3.5" fill="#FFFFFF" />
        <circle cx="100" cy="126" r="3.5" fill="#FFFFFF" />
      </svg>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();

  // Phase tracker
  const [phase, setPhase] = useState<OnboardingPhase>('auth');
  const [authMode, setAuthMode] = useState<AuthMode>('register');

  // Form Fields
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

  // Fetch categories from backend on mount (falls back cleanly if server is offline)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/public/categories-with-courses`);
        if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          const enriched = res.data.data.map((cat: CategoryItem, idx: number) => ({
            ...cat,
            routeCode: cat.routeCode || cat.slug?.toUpperCase() || cat.name.split(' ').map((w: string) => w[0]).join('').slice(0, 4).toUpperCase() || `R0${idx + 1}`,
            gateCode: cat.gateCode || `Gate ${String.fromCharCode(65 + idx)}-0${idx + 4}`,
            trackTag: cat.trackTag || (idx % 2 === 0 ? '▲ Track: Direct' : 'Track: Corporate'),
            tierTag: cat.tierTag || (idx === 0 ? 'TIER 1 EXPEDITION' : 'ACCREDITED')
          }));
          setCategories(enriched);
          setSelectedCategoryId(enriched[0]._id);
        }
      } catch {
        // Keep fallback categories
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

          setSuccessMsg('Signed in! Proceeding to your courses...');
          setTimeout(() => {
            handlePostAuthTransition();
          }, 600);
        } else {
          setErrorMsg(res.data?.message || 'Registration failed.');
        }
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        // Demo simulation if backend is unavailable
        if (!error.response) {
          setSuccessMsg('Signed in! Proceeding to your courses...');
          setTimeout(() => {
            handlePostAuthTransition();
          }, 600);
        } else {
          setErrorMsg(error.response?.data?.message || 'Failed to connect. Please try again.');
        }
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
        if (!error.response) {
          setSuccessMsg('Signed in! Proceeding to your courses...');
          setTimeout(() => {
            handlePostAuthTransition();
          }, 600);
        } else {
          setErrorMsg(error.response?.data?.message || 'Invalid email or password.');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  // Check category count rule
  const handlePostAuthTransition = () => {
    if (categories.length === 1) {
      const singleCat = categories[0];
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
      let fetchedCourses: CourseItem[] = [];
      if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        fetchedCourses = res.data.data;
      } else {
        fetchedCourses = FALLBACK_COURSES;
      }
      setCourses(fetchedCourses);

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

  const activeCategory = categories.find((c) => c._id === selectedCategoryId) || categories[0];

  return (
    <div className="relative min-h-screen bg-[#F8F9FC] text-[#1A1A2E] font-['Poppins',sans-serif] flex flex-col justify-between selection:bg-[#2B4788] selection:text-white">
      {/* Background radial dot grid texture matching design */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(30, 41, 59, 0.16) 1.2px, transparent 1.2px)',
          backgroundSize: '28px 28px',
          backgroundColor: '#F8F9FC'
        }}
      />

      {/* Ambient background glows */}
      <div className="fixed top-0 right-1/4 w-96 h-96 bg-[#2B4788]/8 rounded-full filter blur-3xl pointer-events-none" />
      <div className="fixed bottom-10 left-1/4 w-80 h-80 bg-[#FF6B35]/8 rounded-full filter blur-3xl pointer-events-none" />

      {/* ── STATIC NON-MOVABLE TOP HEADER (Fixed at viewport top) ── */}
      <header className="sticky top-0 z-50 w-full bg-[#F8F9FC]/95 backdrop-blur-md border-b border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 h-16 sm:h-20 flex items-center justify-between">
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

          {/* Phase step indicator & Navigation controls */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-white/95 border border-slate-200 shadow-sm text-xs font-mono font-semibold text-slate-700">
              <span>
                {phase === 'auth' && 'Step 1 of 3 • Account'}
                {phase === 'category' && 'Step 2 of 3 • Destination'}
                {(phase === 'course_selection' || phase === 'course_single') && 'Step 3 of 3 • Curriculum'}
              </span>
              <div className="flex items-center gap-1.5 ml-1">
                <span className={`w-2 h-2 rounded-full ${phase === 'auth' ? 'bg-[#FF6B35]' : 'bg-[#2B4788]'}`} />
                <span className={`w-2 h-2 rounded-full ${phase === 'category' ? 'bg-[#FF6B35]' : (phase.startsWith('course') ? 'bg-[#2B4788]' : 'bg-slate-300')}`} />
                <span className={`w-2 h-2 rounded-full ${phase.startsWith('course') ? 'bg-[#FF6B35]' : 'bg-slate-300'}`} />
              </div>
            </div>

            {/* Skip for now link */}
            <Link
              href="/"
              className="text-xs font-semibold text-slate-500 hover:text-[#2B4788] transition-colors hidden sm:inline-block"
            >
              Skip for now
            </Link>

            {/* Stamps count badge (Matching Image 2) */}
            {phase !== 'auth' && (
              <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1E3494] text-white text-xs font-mono font-bold shadow-sm">
                <span>📖</span>
                <span>{phase === 'category' ? '0/3 STAMPS' : '1/3 STAMPS'}</span>
              </div>
            )}

            {/* Profile Avatar Icon */}
            <div className="w-9 h-9 rounded-xl bg-[#1E3494] text-white flex items-center justify-center text-xs shadow-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-6 sm:py-10">

        {/* ════════════════════════════════════════════════════════════════
            PHASE 1: AUTHENTICATION + ATLAS MASCOT COMPANION
           ════════════════════════════════════════════════════════════════ */}
        {phase === 'auth' && (
          <div className="w-full max-w-4xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-10 animate-fade-in py-2">
            
            {/* Left/Companion Column: Mascot Showcase Pedestal */}
            <div className="hidden lg:flex flex-col items-center text-center max-w-[250px] shrink-0">
              <div className="relative group cursor-pointer mb-4 w-full">
                {/* Mascot Glass Pedestal Showcase Card */}
                <div 
                  className="w-full h-[390px] rounded-3xl p-3 border border-white/95 shadow-[0_20px_45px_rgba(27,43,85,0.10),0_1px_2px_rgba(255,255,255,0.95)_inset] flex flex-col items-center justify-end group-hover:scale-[1.02] transition-all duration-300 relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.92) 0%, rgba(248, 250, 252, 0.78) 100%)',
                    backdropFilter: 'blur(20px) saturate(190%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(190%)',
                  }}
                >
                  <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#2B4788]/10 rounded-full filter blur-2xl pointer-events-none" />
                  <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-[#FF6B35]/10 rounded-full filter blur-2xl pointer-events-none" />
                  
                  {/* Floor Shadow Ellipse */}
                  <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-40 h-3.5 bg-slate-900/10 rounded-full blur-sm pointer-events-none" />

                  {/* Mascot Character Showcase with Fluid Cross-Fade & Float Transition */}
                  <div className="relative w-full h-full flex items-end justify-center select-none z-10 overflow-hidden">
                    {/* Register Mascot Image */}
                    <img 
                      src={mascotRegister.src} 
                      alt="Registration Mascot Companion" 
                      className={`absolute bottom-0 max-h-full max-w-full object-contain object-bottom select-none pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                        authMode === 'register' 
                          ? 'opacity-100 scale-100 translate-y-0 rotate-0 filter blur-0' 
                          : 'opacity-0 scale-95 translate-y-3 -rotate-1 filter blur-[0.5px]'
                      }`}
                    />

                    {/* Login Mascot Image */}
                    <img 
                      src={mascotLogin.src} 
                      alt="Sign In Mascot Companion" 
                      className={`absolute bottom-0 max-h-full max-w-full object-contain object-bottom select-none pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                        authMode === 'login' 
                          ? 'opacity-100 scale-100 translate-y-0 rotate-0 filter blur-0' 
                          : 'opacity-0 scale-95 translate-y-3 rotate-1 filter blur-[0.5px]'
                      }`}
                    />
                  </div>
                </div>

                {/* Floating Role Pill */}
                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full bg-gradient-to-r from-[#1E3494] via-[#2B4788] to-[#1838AB] text-white font-mono text-[9px] font-bold uppercase tracking-widest shadow-md whitespace-nowrap z-20 transition-all duration-300">
                  <span className="transition-all duration-300">
                    {authMode === 'register' ? 'ADMISSION COMPANION' : 'EXPEDITION GUIDE'}
                  </span>
                </div>
              </div>

              {/* Guidance Speech Card */}
              <div 
                className="rounded-2xl p-3.5 shadow-sm text-left relative border border-white/90 w-full"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.94) 0%, rgba(248, 250, 252, 0.85) 100%)',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-[9px] font-bold text-[#1E3494] tracking-wider uppercase transition-all duration-300">
                    {authMode === 'register' ? 'EXPEDITION ONBOARDING' : 'STUDENT VERIFIED'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed font-['Poppins',sans-serif] min-h-[36px] transition-opacity duration-300">
                  {authMode === 'register' 
                    ? '"Hey candidate! Fill your details on the right to claim priority entry passes and calibrate your route."'
                    : '"Welcome back! Great to see you again. Sign in to jump straight into your active course modules."'}
                </p>
              </div>
            </div>

            {/* Right Column: Liquid Glass Auth Card */}
            <div className="w-full max-w-[450px]">
              <div 
                className="relative rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(27,43,85,0.11),0_1px_2px_rgba(255,255,255,0.95)_inset] border border-white/90 transition-all duration-300 overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.96) 0%, rgba(248, 250, 252, 0.92) 100%)',
                  backdropFilter: 'blur(28px) saturate(200%)',
                  WebkitBackdropFilter: 'blur(28px) saturate(200%)',
                }}
              >
                {/* Corner ambient glows */}
                <div className="absolute top-0 right-0 w-36 h-36 bg-[#2B4788]/10 rounded-full filter blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#FF6B35]/10 rounded-full filter blur-3xl pointer-events-none" />

                {/* Mobile Mascot Avatar Thumbnail with smooth cross-fade */}
                <div className="lg:hidden flex justify-center mb-3 relative z-10">
                  <div className="w-14 h-14 rounded-2xl p-1 bg-white/95 border border-slate-200/80 shadow-md overflow-hidden flex items-center justify-center relative">
                    <img 
                      src={mascotRegister.src} 
                      alt="Mascot Register Avatar" 
                      className={`absolute inset-1 w-[calc(100%-8px)] h-[calc(100%-8px)] object-contain object-top transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                        authMode === 'register' ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
                      }`}
                    />
                    <img 
                      src={mascotLogin.src} 
                      alt="Mascot Login Avatar" 
                      className={`absolute inset-1 w-[calc(100%-8px)] h-[calc(100%-8px)] object-contain object-top transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                        authMode === 'login' ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
                      }`}
                    />
                  </div>
                </div>

                {/* Dual-Segment Switcher Tab (Matching Image 7) */}
                <div className="relative z-10 p-1 rounded-full bg-slate-100/95 border border-slate-200/80 mb-5 shadow-inner grid grid-cols-2">
                  {/* Sliding Background Pill */}
                  <div 
                    className={`absolute top-1 bottom-1 rounded-full bg-white shadow-[0_2px_8px_rgba(30,52,148,0.12),0_1px_2px_rgba(0,0,0,0.06)] border border-slate-200/70 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none ${
                      authMode === 'register' 
                        ? 'left-1 w-[calc(50%-2px)]' 
                        : 'left-[calc(50%+1px)] w-[calc(50%-2px)]'
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('register');
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                    className={`relative z-10 py-2 px-3 rounded-full text-xs sm:text-[13px] font-bold transition-colors duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
                      authMode === 'register'
                        ? 'text-[#1E3494]'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {authMode === 'register' && <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B35]" />}
                    <span>Create Account</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                    className={`relative z-10 py-2 px-3 rounded-full text-xs sm:text-[13px] font-bold transition-colors duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
                      authMode === 'login'
                        ? 'text-[#1E3494]'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {authMode === 'login' && <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B35]" />}
                    <span>Sign In</span>
                  </button>
                </div>

                {/* Header Title with Brand Accent (Matching Image 1 & 6) */}
                <div className="relative z-10 text-center mb-5">
                  <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-blue-50/80 text-[#2B4788] font-mono text-[9px] font-bold uppercase tracking-wider mb-2 border border-blue-200/60">
                    <span>{authMode === 'register' ? 'STUDENT ONBOARDING' : 'STUDENT PORTAL'}</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A2E] tracking-tight font-['Poppins',sans-serif] leading-tight">
                    {authMode === 'register' ? 'Create your account' : 'Welcome back'}
                  </h1>
                  <p className="mt-1 text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                    {authMode === 'register' 
                      ? 'Start your journey into high-performance commerce' 
                      : 'Enter your credentials to continue learning'}
                  </p>
                </div>

                {/* Error Alert */}
                {errorMsg && (
                  <div className="relative z-10 mb-4 p-3 rounded-xl bg-rose-50/95 border border-rose-200/90 text-rose-700 text-xs font-medium flex items-center gap-2.5 shadow-sm animate-fade-in">
                    <div className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[9px] shrink-0 font-bold">
                      !
                    </div>
                    <span className="leading-snug">{errorMsg}</span>
                  </div>
                )}

                {/* Success Banner (Matching Image 6) */}
                {successMsg && (
                  <div className="relative z-10 mb-4 p-3 rounded-xl bg-emerald-50/95 border border-emerald-300 text-emerald-800 text-xs font-medium flex items-center gap-2 shadow-sm animate-fade-in">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="leading-snug font-medium">{successMsg}</span>
                  </div>
                )}

                {/* Form (Clean inputs without left icons matching Image 1 & 6) */}
                <form onSubmit={handleAuthSubmit} className="relative z-10 space-y-3.5">
                  {authMode === 'register' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1 font-['Poppins',sans-serif]">
                        Full Name <span className="text-[#FF6B35] font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Sarah Jenkins"
                        className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-white border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-[#1E3494]/12 focus:border-[#1E3494] transition-all shadow-sm"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 font-['Poppins',sans-serif]">
                      Email Address <span className="text-[#FF6B35] font-bold">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-white border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-[#1E3494]/12 focus:border-[#1E3494] transition-all shadow-sm"
                    />
                  </div>

                  {authMode === 'register' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1 font-['Poppins',sans-serif]">
                        Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-white border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-[#1E3494]/12 focus:border-[#1E3494] transition-all shadow-sm"
                      />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700 font-['Poppins',sans-serif]">
                        Password <span className="text-[#FF6B35] font-bold">*</span>
                      </label>
                      {authMode === 'login' && (
                        <a
                          href="#forgot-password"
                          onClick={(e) => {
                            e.preventDefault();
                            alert('Password reset link has been dispatched to your email address.');
                          }}
                          className="text-[11px] font-semibold text-[#1E3494] hover:text-[#2B57F0] hover:underline"
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
                        className="w-full pl-4 pr-16 py-2.5 sm:py-3 rounded-xl bg-white border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-[#1E3494]/12 focus:border-[#1E3494] transition-all shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>

                  {authMode === 'register' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1 font-['Poppins',sans-serif]">
                        Confirm Password <span className="text-[#FF6B35] font-bold">*</span>
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-white border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-[#1E3494]/12 focus:border-[#1E3494] transition-all shadow-sm"
                      />
                    </div>
                  )}

                  {/* Submit Button (Matching Image 1 & 6: Navy #1A1A2E background with right arrow) */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 px-5 rounded-xl bg-[#1A1A2E] hover:bg-[#121222] text-white font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 shadow-[0_10px_24px_rgba(26,26,46,0.20)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {loading && (
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      )}
                      <span>{authMode === 'register' ? 'COMPLETE ONBOARDING' : 'SIGN IN'}</span>
                      <span className="text-sm">→</span>
                    </button>
                  </div>
                </form>

                {/* Bottom Switcher Link (Matching Image 1 & 6) */}
                <div className="relative z-10 mt-5 pt-4 text-center">
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
                        className="font-bold text-[#1E3494] hover:underline cursor-pointer"
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
                        className="font-bold text-[#FF6B35] hover:underline cursor-pointer"
                      >
                        Register now
                      </button>
                    </p>
                  )}

                  <div className="mt-4">
                    <Link
                      href="/admin-login"
                      className="font-mono text-[9px] font-semibold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
                    >
                      ENTERPRISE ADMIN GATEWAY ↗
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            PHASE 2: "WHERE ARE YOU HEADED?" CATEGORY BOARDING PASS TICKETS
            (Exact Visual Match to Image 2)
           ════════════════════════════════════════════════════════════════ */}
        {phase === 'category' && (
          <div className="w-full max-w-4xl mx-auto flex flex-col items-center animate-fade-in relative py-4">
            
            {/* Giant Watermark "01" behind tickets (Matching Image 2) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[260px] font-black text-slate-900/[0.04] select-none pointer-events-none font-mono z-0">
              01
            </div>

            {/* Dotted Trajectory Flight Path Line & Compass Rose (Matching Image 2) */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-40" 
              viewBox="0 0 900 600" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M -50 420 Q 300 480 500 450 T 950 380" 
                stroke="#64748B" 
                strokeWidth="1.5" 
                strokeDasharray="6 6" 
              />
              {/* Compass rose on right */}
              <circle cx="820" cy="240" r="45" stroke="#94A3B8" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="820" y1="185" x2="820" y2="295" stroke="#94A3B8" strokeWidth="1" />
              <line x1="765" y1="240" x2="875" y2="240" stroke="#94A3B8" strokeWidth="1" />
            </svg>

            {/* Header Manifest Pill (Matching Image 2) */}
            <div className="relative z-10 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50/90 border border-blue-200/70 text-[#2B4788] font-mono text-[10px] font-bold uppercase tracking-wider mb-2 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2B4788]" />
              EXPEDITION MANIFEST • 2025
            </div>

            {/* Headline with Wavy Blue Accent (Matching Image 2) */}
            <h1 className="relative z-10 text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1A1A2E] text-center tracking-tight font-['Poppins',sans-serif]">
              Where are you{' '}
              <span className="text-[#2B4788] relative inline-block">
                headed?
                <svg
                  className="absolute -bottom-2 left-0 w-full text-cyan-400"
                  height="8"
                  viewBox="0 0 120 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M 0 4 Q 10 0 20 4 T 40 4 T 60 4 T 80 4 T 100 4 T 120 4"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>
            <p className="relative z-10 mt-3 text-sm text-slate-500 text-center max-w-md">
              Pick your destination. We&apos;ll calibrate the chart and plan the route.
            </p>

            {/* 2x2 Boarding Pass Tickets Grid (Matching Image 2) */}
            <div className="relative z-10 mt-8 grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
              {categories.map((cat, idx) => {
                const isSelected = selectedCategoryId === cat._id;
                const routeNumber = `Route 0${idx + 1}`;

                return (
                  <div
                    key={cat._id}
                    onClick={() => setSelectedCategoryId(cat._id)}
                    className={`relative flex rounded-3xl bg-white border-2 cursor-pointer transition-all duration-300 shadow-sm hover:shadow-xl transform hover:-translate-y-1 overflow-hidden select-none ${
                      isSelected
                        ? 'border-slate-800 shadow-xl ring-4 ring-[#2B4788]/10'
                        : 'border-slate-300/80 hover:border-slate-400'
                    }`}
                  >
                    {/* Left Main Ticket Section */}
                    <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between relative">
                      {/* Top Row: Icon + Destination Tag */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-[#2B4788] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                            {cat.iconType === 'strategy' ? (
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <rect width="7" height="9" x="3" y="3" rx="1" />
                                <rect width="7" height="5" x="14" y="3" rx="1" />
                                <rect width="7" height="9" x="14" y="12" rx="1" />
                                <rect width="7" height="5" x="3" y="16" rx="1" />
                              </svg>
                            ) : cat.iconType === 'book' ? (
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                                <path d="M6 6h10" />
                                <path d="M6 10h10" />
                              </svg>
                            ) : cat.iconType === 'briefcase' ? (
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <rect width="20" height="14" x="2" y="7" rx="2" />
                                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                              </svg>
                            ) : (
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                                <path d="M6 12v5c3 3 9 3 12 0v-5" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <span className="font-mono text-[9px] font-bold text-blue-700 uppercase tracking-wider block">
                              DESTINATION • {idx === 0 ? 'PRIORITY PASS' : idx === 1 ? 'STRATEGIC' : idx === 2 ? 'ACADEMIC' : 'VOCATIONAL'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h3 className="font-extrabold text-lg sm:text-xl text-[#1A1A2E] font-['Poppins',sans-serif] leading-tight">
                          {cat.name}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500 leading-relaxed font-normal">
                          {cat.description}
                        </p>
                      </div>

                      {/* Footer tags */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono font-semibold text-slate-500">
                        <span className="text-slate-600">{cat.trackTag || '▲ Track: Direct'}</span>
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold uppercase text-[9px] border border-blue-100">
                          {cat.tierTag || 'TIER 1 EXPEDITION'}
                        </span>
                      </div>

                      {/* CHOSEN Rubber Ink Stamp (Matching Image 2) */}
                      {isSelected && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 rotate-[-12deg] pointer-events-none select-none animate-scale-in z-20">
                          <div className="border-[3px] border-[#1E3494] rounded-xl px-4 py-1.5 bg-white/90 shadow-md">
                            <span className="font-black font-mono text-sm tracking-widest text-[#1E3494]">
                              CHOSEN
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Perforation Cutline with Semicircular Punch Notches (Matching Image 2) */}
                    <div className="relative w-0 border-r-2 border-dashed border-slate-300 flex flex-col justify-between py-2">
                      <div className="w-5 h-5 rounded-full bg-[#F8F9FC] border border-slate-300 absolute -top-2.5 -left-2.5" />
                      <div className="w-5 h-5 rounded-full bg-[#F8F9FC] border border-slate-300 absolute -bottom-2.5 -left-2.5" />
                    </div>

                    {/* Right Tear-off Stub */}
                    <div className="w-24 sm:w-28 p-3 sm:p-4 bg-slate-50/70 flex flex-col items-center justify-between text-center select-none">
                      <div className="font-mono text-[9px] text-slate-400 font-bold uppercase">
                        ROUTE
                        <span className="block text-[8px] text-slate-600 font-semibold">{routeNumber}</span>
                      </div>
                      
                      <div className="my-auto">
                        <span className="font-black text-2xl sm:text-3xl font-mono text-[#2B4788] tracking-wider block">
                          {cat.routeCode || 'CA'}
                        </span>
                        <span className="font-mono text-[9px] text-slate-500 font-semibold block mt-0.5">
                          {cat.gateCode || 'Gate A-12'}
                        </span>
                      </div>

                      {/* Realistic Barcode */}
                      <div className="w-full flex items-center justify-center gap-[2px] opacity-70">
                        <span className="w-[2px] h-6 bg-slate-800" />
                        <span className="w-[3px] h-6 bg-slate-800" />
                        <span className="w-[1px] h-6 bg-slate-800" />
                        <span className="w-[2px] h-6 bg-slate-800" />
                        <span className="w-[1.5px] h-6 bg-slate-800" />
                        <span className="w-[4px] h-6 bg-slate-800" />
                        <span className="w-[1px] h-6 bg-slate-800" />
                        <span className="w-[2.5px] h-6 bg-slate-800" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Atlas Guidance Speech Bubble (Matching Image 2) */}
            <div className="relative z-10 mt-6 w-full flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white border border-slate-200 shadow-sm p-0.5 shrink-0 overflow-hidden">
                <img 
                  src={mascotLogin.src} 
                  alt="Atlas Guide" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-300 shadow-sm text-xs font-mono text-slate-700">
                <span className="w-2 h-2 rounded-full bg-[#FF6B35]" />
                <span className="font-bold text-[#1E3494]">{activeCategory.routeCode || 'CA'} logged!</span>
              </div>
              <span className="font-mono text-[9px] text-slate-400 font-bold uppercase tracking-wider hidden sm:inline">
                ATLAS GUIDANCE
              </span>
            </div>

            {/* Bottom Actions Bar (Matching Image 2: Left Back, Right Orange Continue) */}
            <div className="relative z-10 mt-8 w-full flex items-center justify-between pt-4 border-t border-slate-200">
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
                className="px-8 py-3 rounded-2xl bg-[#FF6B35] hover:bg-[#ff7d47] text-white font-bold text-xs sm:text-sm shadow-[0_8px_20px_rgba(255,107,53,0.30)] hover:shadow-[0_12px_26px_rgba(255,107,53,0.40)] transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>{loading ? 'Calibrating...' : 'Continue'}</span>
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                  →
                </span>
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            PHASE 3A: MULTI-COURSE EXPEDITION GRID
            (Exact Visual Match to Image 3)
           ════════════════════════════════════════════════════════════════ */}
        {phase === 'course_selection' && (
          courses.length === 0 ? (
            <div className="w-full max-w-xl mx-auto flex flex-col items-center text-center p-8 sm:p-12 rounded-3xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl animate-fade-in">
              <div className="w-20 h-20 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-3xl mb-5 shadow-inner">
                🧭
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 text-slate-600 font-mono text-[10px] font-bold uppercase tracking-wider mb-3">
                CURRICULUM RADAR • CALIBRATION NOTE
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A2E] tracking-tight font-['Poppins',sans-serif]">
                Sorry, there are no courses for you
              </h2>
              <p className="mt-3 text-sm text-slate-500 leading-relaxed max-w-md">
                There are currently no active or launched courses available under this category. Our curriculum architects are crafting new cohorts soon.
              </p>
              
              <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setPhase('category')}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#2B4788] hover:bg-[#1E3494] text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>←</span>
                  <span>Choose another category</span>
                </button>

                <Link
                  href="/"
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 hover:border-slate-400 text-slate-600 font-semibold text-xs transition-colors flex items-center justify-center"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-5xl mx-auto flex flex-col animate-fade-in">
              
              {/* Header title */}
              <div className="text-center mb-6">
                <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-[#2B4788] font-mono text-[10px] font-bold uppercase tracking-wider mb-2 border border-blue-100">
                  CURRICULUM RADAR • ACTIVE EXPEDITIONS
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A2E] tracking-tight font-['Poppins',sans-serif]">
                  Choose your learning trajectory
                </h1>
              </div>

              {/* 4 Cards Layout Matching Image 3: 
                  - Top Left: Wide Hero Card (Basics of Taxation)
                  - Top Right: Advanced Accounting
                  - Bottom Left: GST Essentials & Systemic Audit (Green)
                  - Bottom Right: Financial Statement Analysis
              */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
                
                {/* ── CARD 1: Hero Card (Spans 2 columns, Matching Image 3 Top-Left) ── */}
                <div className="md:col-span-2 rounded-3xl bg-white border border-slate-200/90 shadow-md p-5 sm:p-6 flex flex-col justify-between hover:border-[#2B4788] transition-all">
                  <div className="flex flex-col sm:flex-row gap-5 items-start">
                    
                    {/* Isometric Cube Canvas Box */}
                    <div 
                      className="w-full sm:w-56 h-48 rounded-2xl flex flex-col justify-between p-3.5 relative shadow-inner shrink-0"
                      style={{
                        background: 'radial-gradient(circle at 40% 30%, #152458 0%, #0d173d 60%, #070d24 100%)'
                      }}
                    >
                      {/* Top coordinates & bookmark */}
                      <div className="flex items-center justify-between text-[9px] font-mono text-slate-300">
                        <span>COORD: 10°N 72°E • SECTOR 4</span>
                        <span>🔖</span>
                      </div>

                      {/* 3D Isometric Cube Vector SVG */}
                      <div className="flex items-center justify-center my-auto">
                        <IsometricCube
                          topColor="#10B981"
                          leftColor="#1A2D6E"
                          rightColor="#FF6B35"
                          size={110}
                          glow={true}
                        />
                      </div>

                      {/* Bottom button & node counter */}
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-white text-slate-800 font-mono text-[8px] font-bold uppercase shadow-sm flex items-center gap-1">
                          <span>✏</span>
                          <span>Scout Active</span>
                        </span>
                        <span className="font-mono text-[8px] font-bold text-orange-400">
                          22/30 NODES
                        </span>
                      </div>
                    </div>

                    {/* Card Content Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2 font-mono text-[9px] font-bold text-blue-600">
                          <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-100 uppercase">
                            VOCATIONAL LEVEL 4 // FISCAL GOVERNANCE
                          </span>
                          <span className="text-slate-400">★ 4.9 (1.4k Enrolled)</span>
                        </div>

                        <h3 className="font-extrabold text-lg sm:text-xl text-[#1A1A2E] leading-snug">
                          {courses[0]?.title || 'Basics of Taxation: Corporate GST & Deductions'}
                        </h3>
                        <p className="mt-1.5 text-xs text-slate-500 leading-relaxed font-normal">
                          {courses[0]?.description || 'Master corporate GST mechanisms, input tax credit reconciliation, cross-border filing defenses, and TDS claim pipelines.'}
                        </p>

                        <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-700">
                          <div className="w-6 h-6 rounded-full bg-[#1E3494] text-white flex items-center justify-center text-[9px] font-bold">
                            AM
                          </div>
                          <div>
                            <span className="block font-bold text-slate-800">
                              Tutor: {courses[0]?.tutor || 'Ahmed Muneer, CPA'} <span className="text-blue-600">✓</span>
                            </span>
                            <span className="block text-[10px] text-slate-400 font-normal">
                              lead fiscal architect • ernst & young alum
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress & Bottom Button Bar */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="w-full sm:w-1/2">
                      <div className="flex items-center justify-between text-[11px] font-mono font-semibold text-slate-600 mb-1">
                        <span>Territory Claimed: {courses[0]?.progress || 73}%</span>
                        <span>{courses[0]?.levelsVerified || '22/30 Levels Verified'}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#FF7D47] to-[#FF6B35] rounded-full transition-all duration-500"
                          style={{ width: `${courses[0]?.progress || 73}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      <span className="text-xs font-mono text-slate-500 hidden sm:inline">
                        ⏱ 140 Mins • 5 Sub-regions
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCourse(courses[0]);
                          setPhase('course_single');
                        }}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF7D47] to-[#FF6B35] hover:from-[#ff8c5a] text-white font-bold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer whitespace-nowrap"
                      >
                        Continue Expedition →
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── CARD 2: Advanced Accounting (Matching Image 3 Top-Right) ── */}
                <div className="rounded-3xl bg-white border border-slate-200/90 shadow-md p-5 flex flex-col justify-between hover:border-[#2B4788] transition-all">
                  <div 
                    className="w-full h-32 rounded-2xl flex flex-col justify-between p-3 relative shadow-inner mb-3"
                    style={{
                      background: 'radial-gradient(circle at 40% 30%, #152458 0%, #0d173d 60%, #070d24 100%)'
                    }}
                  >
                    <div className="flex items-center justify-between text-[9px] font-mono text-slate-300">
                      <span className="px-1.5 py-0.5 rounded bg-white/10 uppercase">SECTOR 02 // ACC</span>
                      <span className="text-orange-400 font-bold">45%</span>
                    </div>

                    <div className="flex items-center justify-center my-auto">
                      <IsometricCube
                        topColor="#1E3A8A"
                        leftColor="#FF6B35"
                        rightColor="#172554"
                        size={85}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                      <span>14 of 30 levels</span>
                      <span>★ 4.8</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-sm text-[#1A1A2E]">
                      {courses[1]?.title || 'Advanced Accounting'}
                    </h4>
                    <span className="text-[11px] text-slate-500 font-normal block mt-0.5">
                      Tutor: {courses[1]?.tutor || 'Ahmed Muneer, CPA'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      120 mins • 4 regions • ★ 4.8
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 mb-1">
                      <span>Progress</span>
                      <span>45%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden mb-3">
                      <div className="h-full bg-[#FF6B35] rounded-full" style={{ width: '45%' }} />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400">14 of 30 levels</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCourse(courses[1]);
                          setPhase('course_single');
                        }}
                        className="px-4 py-1.5 rounded-xl bg-[#1E3494] hover:bg-[#2B4788] text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        Continue →
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── CARD 3: GST Essentials & Systemic Audit (Green, Matching Image 3 Bottom-Left) ── */}
                <div className="rounded-3xl bg-white border border-slate-200/90 shadow-md p-5 flex flex-col justify-between hover:border-emerald-600 transition-all">
                  <div 
                    className="w-full h-32 rounded-2xl flex flex-col justify-between p-3 relative shadow-inner mb-3"
                    style={{
                      background: 'radial-gradient(circle at 40% 30%, #065f46 0%, #047857 60%, #064e3b 100%)'
                    }}
                  >
                    <div className="flex items-center justify-between text-[9px] font-mono text-white/90">
                      <span className="px-1.5 py-0.5 rounded bg-white/20 uppercase font-bold">SECTOR 01 // CONQUERED</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-400/40 font-bold text-white">100% CLAIMED</span>
                    </div>

                    {/* Isometric Cube with Flag planted on top */}
                    <div className="flex items-center justify-center my-auto">
                      <IsometricCube
                        topColor="#10B981"
                        leftColor="#047857"
                        rightColor="#065F46"
                        hasFlag={true}
                        size={85}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[9px] font-mono text-emerald-100">
                      <span>90 mins • 3 regions</span>
                      <span>★ 4.9</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-sm text-[#1A1A2E] flex items-center gap-1.5">
                      <span>{courses[2]?.title || 'GST Essentials & Systemic Audit'}</span>
                      <span className="text-emerald-500 font-bold">✓</span>
                    </h4>
                    <span className="text-[11px] text-slate-500 font-normal block mt-0.5">
                      Tutor: {courses[2]?.tutor || 'Sneha Kapoor, CA'}
                    </span>
                    <span className="mt-1 inline-block px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold font-mono">
                      Claimed & Mastered
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400">ID: #GST-004</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCourse(courses[2]);
                        setPhase('course_single');
                      }}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>📜</span>
                      <span>View Certificate</span>
                    </button>
                  </div>
                </div>

                {/* ── CARD 4: Financial Statement Analysis (Faceted Prism, Matching Image 3 Bottom-Right) ── */}
                <div className="md:col-span-2 rounded-3xl bg-white border border-slate-200/90 shadow-md p-5 flex flex-col justify-between hover:border-[#2B4788] transition-all">
                  <div className="flex flex-col sm:flex-row gap-5 items-start">
                    <div 
                      className="w-full sm:w-48 h-32 rounded-2xl flex flex-col justify-between p-3 relative shadow-inner shrink-0"
                      style={{
                        background: 'radial-gradient(circle at 40% 30%, #152458 0%, #0d173d 60%, #070d24 100%)'
                      }}
                    >
                      <div className="flex items-center justify-between text-[9px] font-mono text-slate-300">
                        <span className="px-1.5 py-0.5 rounded bg-white/10 uppercase">SECTOR 03 // FIN</span>
                        <span className="text-orange-400 font-bold">12%</span>
                      </div>

                      {/* Isometric Polyhedron */}
                      <div className="flex items-center justify-center my-auto">
                        <IsometricPolyhedron size={80} />
                      </div>

                      <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                        <span>100 mins • 4 regions</span>
                        <span>★ 4.8</span>
                      </div>
                    </div>

                    <div className="flex-1">
                      <h4 className="font-extrabold text-base text-[#1A1A2E]">
                        {courses[3]?.title || 'Financial Statement Analysis'}
                      </h4>
                      <p className="mt-1 text-xs text-slate-500 leading-relaxed font-normal">
                        Tutor: {courses[3]?.tutor || 'Rohan Verma, FCA'} • 180 mins • 4 regions • ★ 4.8
                      </p>

                      <div className="mt-3">
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 mb-1">
                          <span>Progress</span>
                          <span>12%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden mb-2">
                          <div className="h-full bg-[#FF6B35] rounded-full" style={{ width: '12%' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400">4 of 26 levels</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCourse(courses[3]);
                        setPhase('course_single');
                      }}
                      className="px-5 py-2 rounded-xl bg-[#1E3494] hover:bg-[#2B4788] text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      Continue →
                    </button>
                  </div>
                </div>

              </div>

              {/* Bottom Back Action */}
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
          )
        )}

        {/* ════════════════════════════════════════════════════════════════
            PHASE 3B: SINGLE COURSE PREVIEW & PAYMENT CHECKOUT
           ════════════════════════════════════════════════════════════════ */}
        {phase === 'course_single' && selectedCourse && (
          <div className="w-full max-w-3xl mx-auto flex flex-col items-center animate-fade-in">
            <div className="w-full rounded-3xl bg-white border border-slate-200 shadow-xl p-6 sm:p-10 relative overflow-hidden">
              <div className="flex items-center justify-between gap-3 mb-4">
                <span className="px-3 py-1 rounded-full bg-blue-50 text-[#2B4788] font-mono text-xs font-bold uppercase tracking-wider">
                  DIRECT ENROLLMENT CLEARANCE
                </span>
                <span className="font-mono text-xs font-bold text-emerald-600">
                  INSTANT ADMISSION
                </span>
              </div>

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

              {/* Pricing & Checkout */}
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

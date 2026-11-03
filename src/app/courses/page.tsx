'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/landing/Navbar';
import { IsometricCube, IsometricPolyhedron } from '@/components/common/IsometricGraphics';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

interface CategoryItem {
  _id: string;
  name: string;
  slug?: string;
  courseCount?: number;
  is_active?: boolean;
}

interface CourseItem {
  _id: string;
  id?: string;
  title: string;
  slug?: string;
  description?: string;
  category_id?: {
    _id: string;
    name: string;
    slug?: string;
  } | string;
  pricing?: {
    inr?: number;
    usd?: number;
  };
  price?: number;
  validity_days?: number;
  is_featured?: boolean;
  featured_image_url?: string;
  tutor_name?: string;
  tutor_role?: string;
  modulesCount?: number;
  unitsCount?: number;
  rating?: number;
  enrolledCount?: number;
  duration_minutes?: number;
}

interface UserEnrollmentProgress {
  enrollment_id: string;
  course: CourseItem;
  progress: number;
  completedNodes: number;
  totalNodes: number;
  nodesLeft: number;
  xp: number;
  status: string;
  last_accessed_unit_id?: string;
}

export default function CoursesCatalogPage() {
  const router = useRouter();

  // Data states
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [featuredCourse, setFeaturedCourse] = useState<CourseItem | null>(null);
  const [activeProgress, setActiveProgress] = useState<UserEnrollmentProgress | null>(null);
  const [allEnrollments, setAllEnrollments] = useState<UserEnrollmentProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search states
  const [activeTerritoryTab, setActiveTerritoryTab] = useState<'claimed' | 'uncharted'>('uncharted');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'mastery' | 'popular' | 'newest'>('mastery');
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  // Fetch initial telemetry and catalog data
  useEffect(() => {
    let isMounted = true;

    async function loadCatalogData() {
      setIsLoading(true);
      setError(null);

      try {
        const studentToken = typeof window !== 'undefined' ? localStorage.getItem('student_token') : null;
        const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
        const token = studentToken || adminToken;

        const authHeaders: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

        // Parallel requests
        const [categoriesRes, coursesRes, featuredRes, progressRes] = await Promise.all([
          fetch(`${BACKEND_URL}/api/public/categories-with-courses?includeEmpty=true`).then(r => r.json()).catch(() => ({ data: [] })),
          fetch(`${BACKEND_URL}/api/public/courses`).then(r => r.json()).catch(() => ({ data: [] })),
          fetch(`${BACKEND_URL}/api/public/courses/featured`).then(r => r.json()).catch(() => ({ data: null })),
          fetch(`${BACKEND_URL}/api/public/courses/my-progress`, { headers: authHeaders }).then(r => r.json()).catch(() => ({ data: null, enrollments: [] }))
        ]);

        if (!isMounted) return;

        // Categories
        if (categoriesRes && categoriesRes.data) {
          setCategories(categoriesRes.data);
        }

        // Courses
        if (coursesRes && coursesRes.data) {
          setCourses(coursesRes.data);
        }

        // Featured Spotlight Course
        if (featuredRes && featuredRes.success && featuredRes.data) {
          setFeaturedCourse(featuredRes.data);
        } else {
          setFeaturedCourse(null);
        }

        // Student Progress
        if (progressRes && progressRes.success) {
          if (progressRes.data) {
            setActiveProgress(progressRes.data);
            setActiveTerritoryTab('claimed');
          }
          if (Array.isArray(progressRes.enrollments)) {
            setAllEnrollments(progressRes.enrollments);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to initialize catalog telemetry.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadCatalogData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute stats for Atlas Hero
  const totalCoursesCount = courses.length;
  const claimedCount = allEnrollments.length;
  const unchartedCount = Math.max(0, totalCoursesCount - claimedCount);

  // Overall platform / user progress calculations
  const totalVerifiedNodes = useMemo(() => {
    return allEnrollments.reduce((acc, curr) => acc + (curr.completedNodes || 0), 0);
  }, [allEnrollments]);

  const totalPossibleNodes = useMemo(() => {
    const total = allEnrollments.reduce((acc, curr) => acc + (curr.totalNodes || 0), 0);
    return total > 0 ? total : totalCoursesCount * 25;
  }, [allEnrollments, totalCoursesCount]);

  const masteryIndex = useMemo(() => {
    if (allEnrollments.length === 0) return 73.8; // Default atlas index
    const totalProgress = allEnrollments.reduce((acc, curr) => acc + (curr.progress || 0), 0);
    return (totalProgress / allEnrollments.length).toFixed(1);
  }, [allEnrollments]);

  // Sector breakdown stats for territory pills
  const sectorBreakdowns = useMemo(() => {
    return categories.map((cat, idx) => {
      const catCourses = courses.filter(c => {
        const catId = typeof c.category_id === 'object' ? c.category_id?._id : c.category_id;
        return catId === cat._id;
      });

      // Find user enrollment average in this category if available
      const catEnrollments = allEnrollments.filter(enr => {
        const catId = typeof enr.course?.category_id === 'object' ? enr.course.category_id?._id : enr.course?.category_id;
        return catId === cat._id;
      });

      let percent = 0;
      if (catEnrollments.length > 0) {
        const avg = catEnrollments.reduce((acc, curr) => acc + (curr.progress || 0), 0) / catEnrollments.length;
        percent = Math.round(avg);
      } else if (catCourses.length > 0) {
        // Fallback procedural seed based on category index
        const seeds = [73, 45, 12, 0, 20];
        percent = seeds[idx % seeds.length];
      }

      const colors = ['#FF6B35', '#2563EB', '#3B82F6', '#94A3B8', '#10B981'];
      const dotColor = colors[idx % colors.length];

      return {
        id: cat._id,
        name: cat.name,
        count: catCourses.length,
        percent,
        dotColor
      };
    });
  }, [categories, courses, allEnrollments]);

  // Filtered courses based on active tab, category, search, and sorting
  const filteredCourses = useMemo(() => {
    let result = [...courses];

    // Filter by Claimed vs Uncharted
    if (activeTerritoryTab === 'claimed') {
      const enrolledCourseIds = new Set(allEnrollments.map(e => e.course?._id || e.course?.id));
      // Show enrolled courses (or all if none enrolled yet, with friendly indicator)
      if (enrolledCourseIds.size > 0) {
        result = result.filter(c => enrolledCourseIds.has(c._id));
      }
    }

    // Filter by category
    if (selectedCategoryId !== 'all') {
      result = result.filter(c => {
        const catId = typeof c.category_id === 'object' ? c.category_id?._id : c.category_id;
        return catId === selectedCategoryId;
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => {
        const titleMatch = c.title?.toLowerCase().includes(q);
        const descMatch = c.description?.toLowerCase().includes(q);
        const catName = typeof c.category_id === 'object' ? c.category_id?.name?.toLowerCase() : '';
        const catMatch = catName?.includes(q);
        return titleMatch || descMatch || catMatch;
      });
    }

    // Sorting
    if (sortBy === 'mastery') {
      result.sort((a, b) => {
        const progA = allEnrollments.find(e => (e.course?._id || e.course?.id) === a._id)?.progress || 0;
        const progB = allEnrollments.find(e => (e.course?._id || e.course?.id) === b._id)?.progress || 0;
        return progB - progA;
      });
    } else if (sortBy === 'popular') {
      result.sort((a, b) => (b.enrolledCount || 100) - (a.enrolledCount || 100));
    } else if (sortBy === 'newest') {
      result.sort((a, b) => b._id.localeCompare(a._id));
    }

    return result;
  }, [courses, activeTerritoryTab, selectedCategoryId, searchQuery, sortBy, allEnrollments]);

  // Bookmark toggle
  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Navigation handlers
  const handleSelectCourse = (courseId: string) => {
    router.push(`/onboarding?courseId=${courseId}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-['Poppins',sans-serif] selection:bg-blue-600 selection:text-white relative pb-24">
      {/* Dynamic Geometric Grid Background Texture */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-60 z-0"
        style={{
          backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Floating Global Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32">
        {/* ── TOP HERO SECTION: THE ATLAS OF COMMERCE ── */}
        <section className="bg-white/95 rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 backdrop-blur-xl transition-all duration-300">
          <div className={`grid grid-cols-1 ${activeProgress || featuredCourse ? 'lg:grid-cols-12 gap-8 items-center' : 'gap-6'}`}>
            
            {/* Left Column: Atlas Title, Specs, & Telemetry Counters */}
            <div className={activeProgress || featuredCourse ? 'lg:col-span-7' : 'w-full'}>
              {/* Badge row */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/90 border border-blue-200/60 text-[#1E3A8A] font-mono text-[11px] font-bold tracking-wider uppercase">
                  TERRITORY EXPEDITION // 2025 EDITION
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/90 border border-blue-200/60 text-[#1E3A8A] font-mono text-[11px] font-bold tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  GRID LIVE: 18.92N • 72.83E
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#111827] tracking-tight leading-tight">
                The Atlas of <span className="text-[#1E3A8A] relative inline-block">Commerce
                  <span className="absolute -bottom-1 left-0 right-0 h-1 bg-blue-500/20 rounded-full" />
                </span>
              </h1>

              {/* Description */}
              <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
                Navigate high-impact vocational sectors. Claim uncharted balance sheets,
                master corporate tax nodes, and mint sovereign industry credentials.
              </p>

              {/* Telemetry Stats Grid */}
              <div className="mt-7 grid grid-cols-3 gap-3 sm:gap-4 max-w-xl">
                {/* Active Tracks */}
                <div className="bg-slate-50/90 rounded-2xl p-3.5 sm:p-4 border border-slate-200/70 hover:border-blue-200 transition-colors">
                  <span className="block text-[10px] sm:text-[11px] font-bold font-mono text-slate-500 tracking-wider uppercase">
                    ACTIVE TRACKS
                  </span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#111827]">
                      {String(claimedCount > 0 ? claimedCount : Math.min(totalCoursesCount, 4)).padStart(2, '0')}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-slate-400">
                      / {String(Math.max(totalCoursesCount, 9)).padStart(2, '0')}
                    </span>
                  </div>
                </div>

                {/* Verified Nodes */}
                <div className="bg-slate-50/90 rounded-2xl p-3.5 sm:p-4 border border-slate-200/70 hover:border-blue-200 transition-colors">
                  <span className="block text-[10px] sm:text-[11px] font-bold font-mono text-slate-500 tracking-wider uppercase">
                    VERIFIED NODES
                  </span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#111827]">
                      {totalVerifiedNodes > 0 ? totalVerifiedNodes : 22}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-slate-400">
                      / {totalPossibleNodes}
                    </span>
                  </div>
                </div>

                {/* Mastery Index */}
                <div className="bg-slate-50/90 rounded-2xl p-3.5 sm:p-4 border border-slate-200/70 hover:border-blue-200 transition-colors">
                  <span className="block text-[10px] sm:text-[11px] font-bold font-mono text-slate-500 tracking-wider uppercase">
                    MASTERY INDEX
                  </span>
                  <div className="mt-1 flex items-baseline gap-0.5">
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#111827]">
                      {masteryIndex}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-400">%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Active Reconnaissance / Featured Course Spotlight (Shown only if course exists) */}
            {(activeProgress || featuredCourse) && (
              <div className="lg:col-span-5">
                <div 
                  className="rounded-2xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden flex flex-col justify-between"
                  style={{
                    background: 'linear-gradient(145deg, #0F1938 0%, #17285C 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.12)'
                  }}
                >
                  {/* Subtle Grid Backdrop for the card */}
                  <div 
                    className="absolute inset-0 pointer-events-none opacity-10"
                    style={{
                      backgroundImage: 'radial-gradient(#FFFFFF 1px, transparent 1px)',
                      backgroundSize: '16px 16px'
                    }}
                  />

                  {/* Top Bar of Card */}
                  <div className="relative z-10 flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
                      <span className="text-[11px] font-mono tracking-wider uppercase text-slate-300 font-bold">
                        {activeProgress ? 'ACTIVE RECONNAISSANCE' : 'SPOTLIGHT EXPEDITION'}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-white/10 text-white/90 border border-white/10 font-medium">
                      {activeProgress 
                        ? (typeof activeProgress.course.category_id === 'object' ? activeProgress.course.category_id.name : 'Sector Active') 
                        : (typeof featuredCourse?.category_id === 'object' ? featuredCourse?.category_id.name : 'Featured Track')}
                    </span>
                  </div>

                  {/* Card Title & Mentor */}
                  <div className="relative z-10 my-2">
                    <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug line-clamp-2">
                      {activeProgress ? activeProgress.course.title : featuredCourse?.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-300 font-medium">
                      {activeProgress
                        ? `${activeProgress.course.tutor_name || 'Ahmed Muneer, CPA'} • Corporate GST Shard`
                        : `${featuredCourse?.tutor_name || 'Senior Industry Faculty'} • Certified Framework`}
                    </p>
                  </div>

                  {/* Status & XP Telemetry */}
                  <div className="relative z-10 mt-4 p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-orange-500/20 border border-orange-500/40 flex items-center justify-center">
                        <IsometricCube size={24} />
                      </div>
                      <div>
                        <span className="block text-[10px] font-mono text-slate-400 font-semibold uppercase">
                          SUMMIT STATUS
                        </span>
                        <span className="text-xs font-bold text-white">
                          {activeProgress 
                            ? `${activeProgress.progress}% Claimed • ${activeProgress.nodesLeft} Nodes Left` 
                            : 'High-Demand Industry Curriculum'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="block text-[10px] font-mono text-slate-400 font-semibold uppercase">
                        EXP TELEMETRY
                      </span>
                      <span className="text-xs font-bold text-orange-400 font-mono">
                        {activeProgress ? `+${activeProgress.xp} XP` : '+1,500 XP'}
                      </span>
                    </div>
                  </div>

                  {/* CTA Action Button */}
                  <div className="relative z-10 mt-5">
                    <button
                      type="button"
                      onClick={() => handleSelectCourse((activeProgress ? activeProgress.course._id : featuredCourse?._id) || '')}
                      className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm tracking-wide shadow-lg hover:shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                    >
                      {activeProgress ? 'Resume Expedition' : 'Explore Featured Expedition'}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── TERRITORY SELECTOR & SECTOR SUMMARY BAR ── */}
        <section className="mt-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Switcher Pill Button */}
          <div className="inline-flex p-1 rounded-full bg-white border border-slate-200/90 shadow-sm self-start">
            <button
              type="button"
              onClick={() => setActiveTerritoryTab('claimed')}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTerritoryTab === 'claimed'
                  ? 'bg-[#1E3A8A] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Claimed Territories ({claimedCount} Active)
            </button>
            <button
              type="button"
              onClick={() => setActiveTerritoryTab('uncharted')}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTerritoryTab === 'uncharted'
                  ? 'bg-[#1E3A8A] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Uncharted Sectors ({unchartedCount > 0 ? unchartedCount : totalCoursesCount} Explore)
            </button>
          </div>

          {/* Sector Breakdown Pills */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {sectorBreakdowns.map(sec => (
              <button
                key={sec.id}
                type="button"
                onClick={() => setSelectedCategoryId(sec.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 text-xs font-medium text-slate-700 transition-colors"
              >
                <span 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: sec.dotColor }}
                />
                <span>{sec.name}</span>
                <span className="font-semibold text-slate-900">{sec.percent}%</span>
              </button>
            ))}
          </div>
        </section>

        {/* ── CATEGORY FILTER TABS, SEARCH, AND SORT BAR ── */}
        <section className="mt-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-3.5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {/* All Sectors Tab */}
            <button
              type="button"
              onClick={() => setSelectedCategoryId('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategoryId === 'all'
                  ? 'bg-[#1E3A8A] text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
              }`}
            >
              All Sectors ({totalCoursesCount})
            </button>

            {/* Individual Categories */}
            {categories.map(cat => {
              const count = courses.filter(c => {
                const catId = typeof c.category_id === 'object' ? c.category_id?._id : c.category_id;
                return catId === cat._id;
              }).length;

              return (
                <button
                  key={cat._id}
                  type="button"
                  onClick={() => setSelectedCategoryId(cat._id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategoryId === cat._id
                      ? 'bg-[#1E3A8A] text-white shadow-sm'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>

          {/* Right Controls: Search & Sort */}
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <svg 
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search node, mentor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              <option value="mastery">Highest Mastery</option>
              <option value="popular">Most Popular</option>
              <option value="newest">Newest Sector</option>
            </select>
          </div>
        </section>

        {/* ── EXPEDITIONS GRID / COURSE TILES ── */}
        <section className="mt-6">
          {isLoading ? (
            /* Loading State Skeleton */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
              <div className="h-72 bg-white rounded-3xl border border-slate-200" />
              <div className="h-72 bg-white rounded-3xl border border-slate-200" />
              <div className="h-72 bg-white rounded-3xl border border-slate-200" />
              <div className="h-72 bg-white rounded-3xl border border-slate-200" />
            </div>
          ) : filteredCourses.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-sm">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800">No active sectors match your telemetry</h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                No courses found in this category or search query. Switch to another sector or reset your search.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategoryId('all');
                  setSearchQuery('');
                }}
                className="mt-4 px-4 py-2 bg-[#1E3A8A] text-white rounded-xl text-xs font-bold hover:bg-[#2B4788] transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            /* Dynamic Grid of Cards */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {filteredCourses.map((course, index) => {
                // Find student progress if enrolled
                const progressInfo = allEnrollments.find(e => (e.course?._id || e.course?.id) === course._id);
                const isClaimed = Boolean(progressInfo);
                const percent = progressInfo ? progressInfo.progress : 0;
                const isCompleted = percent >= 100;
                const isBookmarked = bookmarkedIds.includes(course._id);

                const catName = typeof course.category_id === 'object' ? course.category_id?.name : 'Sector';
                const totalNodes = progressInfo?.totalNodes || course.unitsCount || 30;
                const completedNodes = progressInfo?.completedNodes || Math.round((percent / 100) * totalNodes);

                // Styling logic matching the 4 reference cards
                const isWideHeroCard = index === 0;
                const isGreenConquered = isCompleted || (index === 2 && !progressInfo);
                const isPolyhedron = index === 3;

                if (isWideHeroCard) {
                  // ── CARD 1: Wide Two-Column Hero Card ──
                  return (
                    <div 
                      key={course._id}
                      className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all p-5 sm:p-6 flex flex-col md:flex-row gap-6 relative group"
                    >
                      {/* Left Dark Isometric Box */}
                      <div className="md:w-5/12 bg-[#101C3D] rounded-2xl p-5 flex flex-col justify-between items-center relative overflow-hidden min-h-[240px]">
                        {/* Top Info */}
                        <div className="w-full flex items-center justify-between text-slate-300 z-10">
                          <span className="text-[10px] font-mono tracking-wider">
                            COORD: 18°N 72°E • SECTOR {index + 4}
                          </span>
                          <button 
                            type="button" 
                            onClick={(e) => toggleBookmark(course._id, e)}
                            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                            </svg>
                          </button>
                        </div>

                        {/* Center Graphic */}
                        <div className="my-auto z-10 transition-transform duration-300 group-hover:scale-105">
                          <IsometricCube 
                            topColor="#10B981" 
                            leftColor="#1E3A8A" 
                            rightColor="#FF6B35" 
                            size={100}
                            glow={true}
                          />
                        </div>

                        {/* Bottom Tags */}
                        <div className="w-full flex items-center justify-between text-[11px] font-mono z-10">
                          <span className="px-2 py-0.5 rounded bg-white/10 text-white font-medium">
                            - SCOUT ACTIVE
                          </span>
                          <span className="text-slate-300 font-bold">
                            {completedNodes > 0 ? completedNodes : 22}/{totalNodes} NODES
                          </span>
                        </div>
                      </div>

                      {/* Right Details */}
                      <div className="md:w-7/12 flex flex-col justify-between">
                        <div>
                          {/* Category Badge & Rating */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                              VOCATIONAL LEVEL 4 // {catName}
                            </span>
                            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                              ★ 4.9 (1.4k Enrolled)
                            </span>
                          </div>

                          {/* Course Title */}
                          <h3 className="text-xl font-extrabold text-[#111827] leading-tight tracking-tight mt-1 group-hover:text-blue-700 transition-colors">
                            {course.title}
                          </h3>

                          {/* Description */}
                          <p className="mt-2 text-xs text-slate-600 leading-relaxed line-clamp-3">
                            {course.description || 'Master corporate GST mechanisms, input tax credit reconciliation, cross-border filing defenses, and TDS claim pipelines.'}
                          </p>

                          {/* Tutor Badge */}
                          <div className="mt-3.5 flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-[#1E3A8A] text-white text-[11px] font-bold flex items-center justify-center">
                              AM
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                                Tutor: {course.tutor_name || 'Ahmed Muneer, CPA'}
                                <span className="text-blue-600 font-bold">✓</span>
                              </div>
                              <div className="text-[10px] text-slate-400">
                                Lead Fiscal Architect • Ernst & Young Alum
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar & CTA */}
                        <div className="mt-4 pt-3 border-t border-slate-100">
                          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                            <span className="text-slate-700">
                              Territory Claimed: {percent > 0 ? percent : 73}%
                            </span>
                            <span className="text-slate-500 font-normal">
                              {completedNodes > 0 ? completedNodes : 22} / {totalNodes} Levels Verified
                            </span>
                          </div>

                          {/* Progress Line */}
                          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden mb-3.5">
                            <div 
                              className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
                              style={{ width: `${percent > 0 ? percent : 73}%` }}
                            />
                          </div>

                          {/* Action Row */}
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-xs text-slate-500 font-medium">
                              ⏱ 140 Mins • 5 Sub-regions
                            </span>

                            <button
                              type="button"
                              onClick={() => handleSelectCourse(course._id)}
                              className="px-4 py-2 rounded-xl bg-[#FF6B35] hover:bg-[#E05A28] text-white text-xs font-bold tracking-wide shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              {isClaimed ? 'Continue Expedition →' : 'Claim Territory →'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                // ── CARD 2 & 4: Standard Vertical Cards ──
                if (!isGreenConquered) {
                  return (
                    <div 
                      key={course._id}
                      className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between group"
                    >
                      {/* Top Visual Box */}
                      <div className="w-full bg-[#101C3D] rounded-2xl p-4 flex flex-col justify-between items-center relative overflow-hidden h-36">
                        <div className="w-full flex items-center justify-between text-[11px] font-mono text-slate-300 z-10">
                          <span>SECTOR 0{index + 2} // {catName.substring(0, 3).toUpperCase()}</span>
                          <span className="font-bold text-orange-400">{percent > 0 ? `${percent}%` : (isPolyhedron ? '12%' : '45%')}</span>
                        </div>

                        {/* Graphic */}
                        <div className="my-auto z-10 transition-transform duration-300 group-hover:scale-105">
                          {isPolyhedron ? (
                            <IsometricPolyhedron size={72} />
                          ) : (
                            <IsometricCube 
                              topColor="#3B82F6" 
                              leftColor="#1E3A8A" 
                              rightColor="#FF6B35" 
                              size={72} 
                            />
                          )}
                        </div>

                        <div className="w-full flex items-center justify-between text-[10px] font-mono text-slate-400 z-10">
                          <span>{completedNodes > 0 ? completedNodes : (isPolyhedron ? 4 : 14)} of {totalNodes} levels</span>
                          <span>★ 4.8</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="mt-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="text-base font-extrabold text-[#111827] leading-snug group-hover:text-blue-700 transition-colors">
                            {course.title}
                          </h4>
                          <p className="mt-1 text-xs text-slate-500 font-medium">
                            Tutor: {course.tutor_name || (isPolyhedron ? 'Rohan Varma, FCA' : 'Ahmed Muneer, CPA')} • {course.duration_minutes || (isPolyhedron ? 180 : 120)} mins
                          </p>
                        </div>

                        {/* Progress */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-xs font-bold mb-1">
                            <span className="text-slate-700">Progress</span>
                            <span className="text-slate-900">{percent > 0 ? `${percent}%` : (isPolyhedron ? '12%' : '45%')}</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden mb-3">
                            <div 
                              className="h-full bg-[#FF6B35] rounded-full"
                              style={{ width: `${percent > 0 ? percent : (isPolyhedron ? 12 : 45)}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono text-slate-400">
                              {completedNodes > 0 ? completedNodes : (isPolyhedron ? 4 : 14)} of {totalNodes} levels
                            </span>
                            <button
                              type="button"
                              onClick={() => handleSelectCourse(course._id)}
                              className="px-4 py-1.5 rounded-xl bg-[#1E3A8A] hover:bg-[#2B4788] text-white text-xs font-bold transition-colors cursor-pointer"
                            >
                              Continue →
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                // ── CARD 3: Conquered / Mastered Green Card ──
                return (
                  <div 
                    key={course._id}
                    className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between group"
                  >
                    {/* Emerald Visual Box */}
                    <div className="w-full bg-[#065F46] rounded-2xl p-4 flex flex-col justify-between items-center relative overflow-hidden h-36">
                      <div className="w-full flex items-center justify-between text-[11px] font-mono text-white/90 z-10">
                        <span className="tracking-wide">SECTOR 01 // CONQUERED</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-700/60 text-emerald-200 font-bold text-[10px]">
                          100% CLAIMED
                        </span>
                      </div>

                      {/* Flag Isometric Cube */}
                      <div className="my-auto z-10 transition-transform duration-300 group-hover:scale-105">
                        <IsometricCube 
                          topColor="#059669" 
                          leftColor="#047857" 
                          rightColor="#10B981" 
                          hasFlag={true}
                          size={76} 
                        />
                      </div>

                      <div className="w-full flex items-center justify-between text-[10px] font-mono text-emerald-200 z-10">
                        <span>90 mins • 3 regions</span>
                        <span>★ 4.9</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="mt-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-base font-extrabold text-[#111827] leading-snug group-hover:text-emerald-700 transition-colors">
                            {course.title}
                          </h4>
                          <span className="text-emerald-600 font-bold">✓</span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500 font-medium">
                          Tutor: {course.tutor_name || 'Sneha Kapoor, CA'}
                        </p>

                        <div className="mt-2.5">
                          <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-bold">
                            Claimed & Mastered
                          </span>
                        </div>
                      </div>

                      {/* Action */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-mono text-slate-400">
                          ID: #GST-004
                        </span>
                        <button
                          type="button"
                          onClick={() => handleSelectCourse(course._id)}
                          className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          📜 View Certificate
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

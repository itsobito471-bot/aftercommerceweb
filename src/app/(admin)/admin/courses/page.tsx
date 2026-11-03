"use client";

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CourseFilters } from '@/components/courses/CourseFilters';
import { CourseDataTable } from '@/components/courses/CourseDataTable';
import { getCourses, toggleFeaturedCourse, getFeaturedLogs } from '@/services/adminApi';
import { Course } from '@/types/course';
import { FeaturedCourseLog } from '@/types/admin-lms';
import { Modal } from '@/components/common/Modal';

/**
 * Universal Base64 Decode
 */
const decodeFilter = (base64Str: string): Record<string, any> => {
  try {
    const jsonStr = decodeURIComponent(atob(base64Str).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonStr);
  } catch (e) {
    return {};
  }
};

/**
 * Universal Base64 Encode
 */
const encodeFilter = (obj: Record<string, any>): string => {
  const jsonStr = JSON.stringify(obj);
  return btoa(encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (_, p1) => {
    return String.fromCharCode(parseInt(p1, 16));
  }));
};

function CourseCatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const filterParam = searchParams.get('filter');
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const [courses, setCourses] = useState<Course[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Featured Course state
  const [featureModalCourse, setFeatureModalCourse] = useState<Course | null>(null);
  const [featureNotes, setFeatureNotes] = useState('');
  const [isFeatureSubmitting, setIsFeatureSubmitting] = useState(false);

  // Featured Audit Logs state
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [featuredLogs, setFeaturedLogs] = useState<FeaturedCourseLog[]>([]);
  const [isLogsLoading, setIsLogsLoading] = useState(false);

  const handleOpenFeatureModal = (course: Course) => {
    setFeatureModalCourse(course);
    setFeatureNotes('');
  };

  const handleConfirmToggleFeature = async () => {
    if (!featureModalCourse) return;
    const courseId = featureModalCourse.id || (featureModalCourse as any)._id;
    const targetStatus = !featureModalCourse.is_featured;

    setIsFeatureSubmitting(true);
    try {
      await toggleFeaturedCourse(courseId, targetStatus, featureNotes);
      loadCourses(pageParam, activeFilters);
      setFeatureModalCourse(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update featured course.');
    } finally {
      setIsFeatureSubmitting(false);
    }
  };

  const handleOpenLogsModal = async () => {
    setIsLogsModalOpen(true);
    setIsLogsLoading(true);
    try {
      const res = await getFeaturedLogs();
      setFeaturedLogs(res.data || []);
    } catch (err) {
      console.error('Failed to load featured audit logs:', err);
      setFeaturedLogs([]);
    } finally {
      setIsLogsLoading(false);
    }
  };

  // Derive initial active filters directly from URL on mount
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>(() => {
    return filterParam ? decodeFilter(filterParam) : {};
  });

  const loadCourses = async (page: number, filters: Record<string, any>) => {
    setIsLoading(true);
    try {
      // Execute the API request via our service layer
      const res = await getCourses(page, 10, filters);
      setCourses((res.data as any) || []);
      setTotalPages((res as any).pagination?.totalPages || (res as any).totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Re-run whenever URL parameters change
  useEffect(() => {
    const currentFilters = filterParam ? decodeFilter(filterParam) : {};
    setActiveFilters(currentFilters);
    loadCourses(pageParam, currentFilters);
  }, [filterParam, pageParam]);

  const handleApplyFilters = (newFilters: Record<string, any>) => {
    // Strip empty values to maintain a clean URL payload
    const cleanedFilters = Object.fromEntries(
      Object.entries(newFilters).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
    );
    
    // Remap custom 'status' filter logic for backend compatibility if necessary
    if (cleanedFilters.status === 'true') cleanedFilters.is_published = true;
    if (cleanedFilters.status === 'false') cleanedFilters.is_published = false;
    delete cleanedFilters.status; // Cleanup pseudo-filter

    if (Object.keys(cleanedFilters).length === 0) {
      router.push('/admin/courses?page=1');
    } else {
      const encoded = encodeFilter(cleanedFilters);
      router.push(`/admin/courses?page=1&filter=${encoded}`);
    }
  };

  const handleClearFilters = () => {
    router.push('/admin/courses?page=1');
  };

  const handlePageChange = (newPage: number) => {
    if (filterParam) {
      router.push(`/admin/courses?page=${newPage}&filter=${filterParam}`);
    } else {
      router.push(`/admin/courses?page=${newPage}`);
    }
  };

  return (
    <div className="db-root flex flex-col p-8 min-h-screen" style={{ backgroundColor: 'var(--color-bg-base)' }}>
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Course Catalog</h1>
          <p className="text-sm opacity-60 mt-1" style={{ color: 'var(--color-text-primary)' }}>Manage your ecosystem of courses, learning units, and featured spotlight.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleOpenLogsModal}
            className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 text-sm font-semibold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>⭐</span>
            <span>Featured Logs</span>
          </button>
          <Link 
            href="/admin/courses/create"
            className="btn-primary px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md active:scale-95 transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Course
          </Link>
        </div>
      </div>

      <CourseFilters 
        initialFilters={activeFilters}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />

      <CourseDataTable 
        courses={courses}
        isLoading={isLoading}
        page={pageParam}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onToggleFeatured={handleOpenFeatureModal}
      />

      {/* ── 1. Featured Spotlight Confirmation Modal ── */}
      {featureModalCourse && (
        <Modal
          isOpen={Boolean(featureModalCourse)}
          onClose={() => setFeatureModalCourse(null)}
          title={featureModalCourse.is_featured ? "Remove Featured Spotlight" : "Set as Featured Spotlight"}
          description={
            featureModalCourse.is_featured
              ? `Remove "${featureModalCourse.title}" from the featured hero spotlight on the public courses catalog.`
              : `Make "${featureModalCourse.title}" the top featured hero course spotlight. Any previously featured course will be automatically replaced.`
          }
          type={featureModalCourse.is_featured ? "warning" : "success"}
          icon={<span>⭐</span>}
          primaryAction={{
            label: isFeatureSubmitting 
              ? "Saving..." 
              : featureModalCourse.is_featured 
              ? "Remove Spotlight" 
              : "Confirm Spotlight",
            onClick: handleConfirmToggleFeature,
            isLoading: isFeatureSubmitting,
            variant: featureModalCourse.is_featured ? "danger" : "primary"
          }}
          secondaryAction={{
            label: "Cancel",
            onClick: () => setFeatureModalCourse(null),
            variant: "ghost"
          }}
        >
          <div className="space-y-4 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-slate-300">
              <span className="font-bold block text-slate-800 dark:text-slate-100 mb-1">{featureModalCourse.title}</span>
              <span>Status: <strong className="uppercase text-emerald-600">{featureModalCourse.status || 'Published'}</strong></span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider font-mono">
                Audit Log Reason / Notes (Optional)
              </label>
              <textarea
                value={featureNotes}
                onChange={(e) => setFeatureNotes(e.target.value)}
                placeholder="e.g. Q1 flagship course promotion or updated curriculum syllabus..."
                rows={2}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-black/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-200 resize-none"
              />
            </div>
          </div>
        </Modal>
      )}

      {/* ── 2. Featured Course Audit Logs History Modal ── */}
      {isLogsModalOpen && (
        <Modal
          isOpen={isLogsModalOpen}
          onClose={() => setIsLogsModalOpen(false)}
          title="Featured Course Audit History"
          description="Chronological log of all featured course spotlight activations, replacements, and updates."
          type="info"
          icon={<span>📋</span>}
          maxWidth="lg"
          primaryAction={{
            label: "Close",
            onClick: () => setIsLogsModalOpen(false),
            variant: "primary"
          }}
        >
          <div className="mt-2 max-h-96 overflow-y-auto space-y-3">
            {isLogsLoading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2" />
                <span className="text-xs font-mono">Loading audit logs...</span>
              </div>
            ) : featuredLogs.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-mono">
                No featured course changes have been logged yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {featuredLogs.map((log) => {
                  const actionColor = 
                    log.action === 'SET_FEATURED' 
                      ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200' 
                      : log.action === 'REPLACED_FEATURED'
                      ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200'
                      : 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200';

                  const dateFormatted = new Date(log.createdAt).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <div key={log._id} className="py-3 flex flex-col gap-1.5 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold border uppercase ${actionColor}`}>
                          {log.action.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {dateFormatted}
                        </span>
                      </div>

                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-slate-800 dark:text-slate-100">
                          {log.course_id?.title || 'Unknown Course'}
                        </span>
                        {log.previous_course_id && (
                          <span className="text-[11px] text-slate-400">
                            (Replaced: {log.previous_course_id.title})
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Updated by: <strong className="text-slate-700 dark:text-slate-300">{log.changed_by?.name || log.changed_by?.email || 'Admin'}</strong></span>
                        {log.notes && <span className="italic text-slate-400">&ldquo;{log.notes}&rdquo;</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

// Wrap in Suspense boundary as required by Next.js App Router for useSearchParams usage
export default function CourseCatalogPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading catalog...</div>}>
      <CourseCatalogContent />
    </Suspense>
  );
}

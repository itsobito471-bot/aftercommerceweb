"use client";

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CourseFilters } from '@/components/courses/CourseFilters';
import { CourseDataTable } from '@/components/courses/CourseDataTable';
import { getCourses } from '@/services/adminApi';
import { Course } from '@/types/course';

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
      setTotalPages(res.totalPages || 1);
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Course Catalog</h1>
          <p className="text-sm opacity-60 mt-1" style={{ color: 'var(--color-text-primary)' }}>Manage your ecosystem of courses and learning units.</p>
        </div>
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
      />
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

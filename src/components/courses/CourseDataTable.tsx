"use client";

import React from 'react';
import Link from 'next/link';
import { Course } from '@/types/course';

interface CourseDataTableProps {
  courses: Course[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const CourseDataTable: React.FC<CourseDataTableProps> = ({ courses, isLoading, page, totalPages, onPageChange }) => {
  if (isLoading) {
    return (
      <div className="w-full h-80 flex items-center justify-center rounded-xl border" style={{ borderColor: 'var(--glass-border)', backgroundColor: 'var(--color-bg-surface)' }}>
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="db-empty w-full p-16 flex flex-col items-center justify-center rounded-xl border" style={{ borderColor: 'var(--glass-border)', backgroundColor: 'var(--color-bg-surface)' }}>
        <svg className="w-20 h-20 opacity-20 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <h3 className="text-xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>No courses found</h3>
        <p className="text-sm opacity-60 mt-2" style={{ color: 'var(--color-text-primary)' }}>Try adjusting your filters or create your first course.</p>
        <Link 
          href="/admin/courses/create"
          className="mt-6 px-6 py-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border transition-all font-semibold text-sm"
          style={{ borderColor: 'var(--glass-border)', color: 'var(--color-text-primary)' }}
        >
          Create New Course
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl shadow-sm overflow-hidden flex flex-col border" style={{ backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--glass-border)' }}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b bg-black/5 dark:bg-white/5" style={{ borderColor: 'var(--glass-border)' }}>
              <th className="p-4 text-xs font-bold uppercase tracking-wider opacity-60" style={{ color: 'var(--color-text-primary)' }}>Title</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider opacity-60" style={{ color: 'var(--color-text-primary)' }}>Category</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider opacity-60" style={{ color: 'var(--color-text-primary)' }}>Price</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider opacity-60" style={{ color: 'var(--color-text-primary)' }}>Status</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider opacity-60" style={{ color: 'var(--color-text-primary)' }}>Validity</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider opacity-60 text-right" style={{ color: 'var(--color-text-primary)' }}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--glass-border)' }}>
            {courses.map(course => {
              const courseId = course.id || (course as any)._id; // Safe fallback for Mongoose
              return (
                <tr key={courseId} className="transition-colors hover:bg-black/5 dark:hover:bg-white/5 group">
                  <td className="p-4 font-semibold" style={{ color: 'var(--color-text-primary)' }}>{course.title}</td>
                  <td className="p-4 text-sm opacity-80" style={{ color: 'var(--color-text-primary)' }}>{course.category || 'Uncategorized'}</td>
                  <td className="p-4 text-sm font-mono" style={{ color: 'var(--color-text-primary)' }}>${Number(course.price || 0).toFixed(2)}</td>
                  <td className="p-4">
                    {course.is_published ? (
                      <span className="db-badge-green px-3 py-1.5 text-xs font-bold uppercase tracking-wide rounded-md bg-green-500/10 text-green-500 border border-green-500/20 shadow-sm">
                        Live
                      </span>
                    ) : (
                      <span className="db-badge-amber px-3 py-1.5 text-xs font-bold uppercase tracking-wide rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-sm">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-sm opacity-80" style={{ color: 'var(--color-text-primary)' }}>{course.validity_days || 0} days</td>
                  <td className="p-4 text-right">
                    <Link 
                      href={`/admin/courses/create?id=${courseId}`}
                      className="inline-flex items-center justify-center p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors opacity-40 group-hover:opacity-100"
                      title="Edit Course"
                    >
                      <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-4 flex items-center justify-between border-t bg-black/5 dark:bg-white/5" style={{ borderColor: 'var(--glass-border)' }}>
          <span className="text-sm font-semibold opacity-70" style={{ color: 'var(--color-text-primary)' }}>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button 
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="px-4 py-2 text-sm font-semibold rounded-lg border disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              style={{ borderColor: 'var(--glass-border)', color: 'var(--color-text-primary)' }}
            >
              Previous
            </button>
            <button 
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="px-4 py-2 text-sm font-semibold rounded-lg border disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              style={{ borderColor: 'var(--glass-border)', color: 'var(--color-text-primary)' }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

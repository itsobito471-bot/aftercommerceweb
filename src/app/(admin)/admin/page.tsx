'use client';

import React, { useEffect, useState } from 'react';
import { getCourses, getAdminProfile } from '../../../services/adminApi';
import { Course, User } from '../../../types/admin-lms';
import { useCharacterStore } from '../../../store/characterStore';

/**
 * LMS Admin Dashboard Home View
 * Renders high-fidelity card telemetry statistics and administrative shortcuts
 */
export default function AdminDashboardPage() {
  const [coursesCount, setCoursesCount] = useState<number | null>(null);
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { setEmotion, speak } = useCharacterStore();

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        // Load administrator profile data
        const profile = await getAdminProfile();
        setAdminUser(profile);

        // Fetch courses list to get total count
        const courseData = await getCourses(1, 1);
        setCoursesCount(courseData.pagination.totalDocs);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const triggerCelebration = () => {
    setEmotion('celebrating');
    speak("Awesome! Let's celebrate our achievements today! Everything is running smoothly.", 4000);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Dashboard Overview</h2>
          <p className="text-sm text-slate-400">Welcome back, {adminUser?.name || 'Administrator'}. Monitor system activities and metrics.</p>
        </div>
        <div>
          <button
            onClick={triggerCelebration}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-700 hover:scale-102 active:scale-98 transition-all"
          >
            <span>🎉</span> Celebrate Progress
          </button>
        </div>
      </div>

      {/* Analytics Telemetry Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        
        {/* Metric 1: Course Catalog Count */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-400">Course Catalog</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-white">{coursesCount !== null ? coursesCount : 0}</h3>
            <p className="mt-1 text-xs text-slate-500">Active and draft courses shells inside system.</p>
          </div>
        </div>

        {/* Metric 2: Wallet Balances */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-400">Total Wallet Balance</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-white">${adminUser?.wallet_balance?.toFixed(2) || '0.00'}</h3>
            <p className="mt-1 text-xs text-slate-500">Commission rate: {adminUser?.commission_percentage || 0}%</p>
          </div>
        </div>

        {/* Metric 3: Pending KYC validations */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-400">Pending Wallet Telemetry</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-white">${adminUser?.pending_balance?.toFixed(2) || '0.00'}</h3>
            <p className="mt-1 text-xs text-slate-500">Pending payout requests requiring approval.</p>
          </div>
        </div>

      </div>

      {/* Administrative Info Card */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-md">
        <h3 className="text-lg font-semibold text-white">System Profile Telemetry</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <span className="text-xs text-slate-500">Staff Name:</span>
            <p className="text-sm font-medium text-slate-200">{adminUser?.name}</p>
          </div>
          <div>
            <span className="text-xs text-slate-500">Email Address:</span>
            <p className="text-sm font-medium text-slate-200">{adminUser?.email}</p>
          </div>
          <div>
            <span className="text-xs text-slate-500">Assigned Role:</span>
            <p className="text-sm font-medium text-slate-200 capitalize">{adminUser?.role?.replace('_', ' ')}</p>
          </div>
          <div>
            <span className="text-xs text-slate-500">Permissions count:</span>
            <p className="text-sm font-medium text-slate-200">{adminUser?.permissions?.length || 0} active</p>
          </div>
        </div>
      </div>

    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStaffList, deleteStaff, encodeQuery } from '@/services/adminApi';
import { User } from '@/types/admin-lms';
import { useCharacterStore } from '@/store/characterStore';

/**
 * Staff Directory page
 * Renders list of administrative staff, team metrics, search filters, and management actions
 */
export default function StaffListPage() {
  const router = useRouter();
  const [staffList, setStaffList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom dialog state for staff removal confirmation
  const [pendingDeleteStaff, setPendingDeleteStaff] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Mascot Zustand Store hooks
  const { setEmotion, speak } = useCharacterStore();

  // Metrics tracking
  const [metrics, setMetrics] = useState({
    total: 0,
    active: 0,
    admins: 0,
  });

  const calculateMetrics = (list: User[]) => {
    const total = list.length;
    const active = list.filter((s) => !s.is_blocked).length;
    const admins = list.filter((s) => s.role === 'admin' || s.role === 'super_admin').length;
    setMetrics({ total, active, admins });
  };

  // Fetch staff records dynamically using Base64 encoded payload filters
  const fetchStaff = async (searchVal = '') => {
    try {
      setIsLoading(true);
      
      const filterParams: Record<string, unknown> = {
        page: 1,
        limit: 100,
        role: ['staff', 'admin'],
      };

      if (searchVal) {
        filterParams.search = searchVal;
      }

      const encodedString = encodeQuery(filterParams);
      const response = await getStaffList(`?q=${encodedString}`);
      
      if (response.success && response.data) {
        // Filter out normal students to only show team members
        const filteredList = response.data.filter(
          (u) => u.role === 'admin' || u.role === 'staff' || u.role === 'super_admin'
        );
        setStaffList(filteredList);
        calculateMetrics(filteredList);
      }
    } catch (err) {
      console.error('Failed to load staff list', err);
      speak('Error! Failed to retrieve administrative staff records from the server.', 4000);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      fetchStaff(searchQuery);
    }
  };

  const executeDelete = async () => {
    if (!pendingDeleteStaff) return;
    try {
      setIsDeleting(true);
      setEmotion('thinking');
      const response = await deleteStaff(pendingDeleteStaff._id);
      
      if (response.success) {
        setEmotion('celebrating');
        speak(`Success! Removed ${pendingDeleteStaff.name} from the administrative team.`, 4000);
        setPendingDeleteStaff(null);
        fetchStaff();
      }
    } catch (err: any) {
      console.error('Failed to delete staff member', err);
      const msg = err.response?.data?.message || 'Failed to remove team member.';
      speak(`Error! ${msg}`, 4000);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl">
      
      {/* Page Header */}
      <div className="page-header animate-header">
        <div className="header-content">
          <div className="page-label-wrap select-none">
            <span className="page-label-root">Team</span>
            <span className="page-label-sep">›</span>
            <span className="page-label-current">Staff Directory</span>
          </div>
          <h1 className="page-title">Team Management</h1>
          <p className="page-subtitle">Manage administrative staff, access privileges, and instructors.</p>
        </div>

        <button 
          onClick={() => router.push('/admin/staff/staff-form')}
          className="btn-primary"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Analytics Metrics Cards Grid */}
      <div className="metrics-grid">
        
        {/* Metric 1: Total Team */}
        <div className="metric-card glass-card">
          <div className="metric-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'rgb(129, 140, 248)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div>
            <div className="metric-value">{metrics.total}</div>
            <div className="metric-label">Total Members</div>
          </div>
        </div>

        {/* Metric 2: Active Accounts */}
        <div className="metric-card glass-card">
          <div className="metric-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'rgb(52, 211, 153)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div>
            <div className="metric-value">{metrics.active}</div>
            <div className="metric-label">Active Staff</div>
          </div>
        </div>

        {/* Metric 3: Super Administrators */}
        <div className="metric-card glass-card">
          <div className="metric-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'rgb(251, 191, 36)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div>
            <div className="metric-value">{metrics.admins}</div>
            <div className="metric-label">Administrators</div>
          </div>
        </div>

      </div>

      {/* Main Glass Data Table */}
      <div className="glass-card animate-card-enter">
        {/* Search bar toolbar */}
        <div className="table-toolbar">
          <div className="search-box">
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyPress}
              className="glass-input search-input" 
              placeholder="Search team members by name..." 
            />
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
            </div>
          ) : staffList.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              No staff members found matching parameters.
            </div>
          ) : (
            <table className="glass-table">
              <thead>
                <tr className="select-none">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email Address</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--glass-border-light)] text-sm">
                {staffList.map((staff) => (
                  <tr key={staff._id} className="transition-colors">
                    {/* Name cell with Avatar */}
                    <td className="px-6 py-4">
                      <div className="user-cell">
                        <div className="avatar select-none">
                          {staff.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-[var(--color-text-primary)]">{staff.name}</span>
                      </div>
                    </td>

                    {/* Email cell */}
                    <td className="px-6 py-4 text-[var(--color-text-muted)]">
                      {staff.email}
                    </td>

                    {/* Role badge cell */}
                    <td className="px-6 py-4 text-[var(--color-text-muted)] capitalize">
                      {staff.role.replace('_', ' ')}
                    </td>

                    {/* Status Badge cell */}
                    <td className="px-6 py-4">
                      <span className={`glass-badge ${
                        staff.is_blocked ? 'glass-badge--inactive' : 'glass-badge--active'
                      }`}>
                        {staff.is_blocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>

                    {/* Actions cell */}
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => router.push(`/admin/staff/staff-form/${staff._id}`)}
                        className="action-btn action-edit"
                        title="Edit staff details"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => setPendingDeleteStaff(staff)}
                        className="action-btn action-delete"
                        title="Remove staff member"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* REMOVE STAFF CONFIRMATION MODAL */}
      {pendingDeleteStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div 
            onClick={() => setPendingDeleteStaff(null)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          ></div>
          
          <div className="relative w-full max-w-sm rounded-2xl border border-[var(--glass-border)] bg-[var(--color-bg-surface)] p-6 shadow-2xl backdrop-blur-xl animate-card-enter">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              
              <h3 className="mt-4 text-lg font-bold text-[var(--color-text-primary)]">Confirm Removal</h3>
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                Are you sure you want to remove <strong className="text-[var(--color-text-primary)]">{pendingDeleteStaff.name}</strong> from the administrative team? This action is destructive.
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setPendingDeleteStaff(null)}
                disabled={isDeleting}
                className="flex-1 rounded-lg border border-[var(--glass-border)] bg-transparent py-2.5 text-sm font-semibold text-[var(--color-text-muted)] hover:bg-[var(--glass-bg-hover)] transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                disabled={isDeleting}
                className="flex-1 rounded-lg bg-[#ef4444] py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-600/15 hover:bg-[#dc2626] active:scale-98 transition-all disabled:opacity-50"
              >
                {isDeleting ? 'Removing...' : 'Yes, remove them'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

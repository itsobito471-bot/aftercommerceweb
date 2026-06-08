'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAssessmentTemplates, deleteAssessmentTemplate, encodeQuery } from '@/services/adminApi';
import { useCharacterStore } from '@/store/characterStore';

export default function AssessmentTemplateListPage() {
  const router = useRouter();

  // Component State
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination State
  const [total, setTotal] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Deletion confirmation dialog state
  const [pendingDeleteTemplate, setPendingDeleteTemplate] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Mascot Guide
  const { setEmotion, speak } = useCharacterStore();

  // Page metrics tracking
  const [metrics, setMetrics] = useState({
    totalCount: 0,
    quizCount: 0,
    timedCount: 0,
  });

  const calculateMetrics = (list: any[], totalRecs: number) => {
    const totalCount = totalRecs;
    const quizCount = list.filter((t) => t.type === 'QUIZ' || t.type === 'quiz').length;
    const timedCount = list.filter((t) => t.duration_minutes > 0).length;
    setMetrics({ totalCount, quizCount, timedCount });
  };

  const fetchTemplates = async (searchVal = searchQuery, page = pageIndex, size = pageSize) => {
    try {
      setIsLoading(true);

      const filterPayload = {
        page,
        limit: size,
        search: searchVal
      };

      const encodedQuery = encodeQuery(filterPayload);
      const params = `?q=${encodedQuery}`;
      const res = await getAssessmentTemplates(params);

      if (res && res.success) {
        setTemplates(res.data || []);
        
        // Retrieve total items from meta or default to data length
        const totalCount = (res as any).meta?.total || (res as any).pagination?.totalRecords || res.data?.length || 0;
        setTotal(totalCount);
        calculateMetrics(res.data || [], totalCount);
      }
    } catch (err) {
      console.error('Failed to load assessment templates', err);
      speak('Error! Failed to retrieve assessment templates from the server.', 4000);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates(searchQuery, pageIndex, pageSize);
  }, [pageIndex, pageSize]);

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setPageIndex(1);
      fetchTemplates(searchQuery, 1, pageSize);
    }
  };

  const handleSearchBtnClick = () => {
    setPageIndex(1);
    fetchTemplates(searchQuery, 1, pageSize);
  };

  const executeDelete = async () => {
    if (!pendingDeleteTemplate) return;
    try {
      setIsDeleting(true);
      setEmotion('thinking');
      const response = await deleteAssessmentTemplate(pendingDeleteTemplate._id);
      
      if (response.success) {
        setEmotion('celebrating');
        speak(`Success! Template "${pendingDeleteTemplate.title}" was deleted.`, 4000);
        setPendingDeleteTemplate(null);
        
        // Adjust page index if last element of the page is deleted
        let newPage = pageIndex;
        if (templates.length === 1 && pageIndex > 1) {
          newPage = pageIndex - 1;
          setPageIndex(newPage);
        }
        fetchTemplates(searchQuery, newPage, pageSize);
      }
    } catch (err: any) {
      console.error('Failed to delete template', err);
      const msg = err.response?.data?.message || 'Failed to remove assessment template.';
      speak(`Error! ${msg}`, 4000);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePageChange = (newPageIndex: number) => {
    if (newPageIndex < 1 || newPageIndex > Math.ceil(total / pageSize)) return;
    setPageIndex(newPageIndex);
  };

  const totalPages = Math.ceil(total / pageSize) || 1;

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl">
      
      {/* Page Header */}
      <div className="page-header animate-header">
        <div className="header-content">
          <div className="page-label-wrap select-none">
            <span className="page-label-root">Templates</span>
            <span className="page-label-sep">›</span>
            <span className="page-label-current">Assessment Templates</span>
          </div>
          <h1 className="page-title">Assessment Templates</h1>
          <p className="page-subtitle">Manage reusable quizzes and surveys for your curriculum.</p>
        </div>

        <button 
          onClick={() => router.push('/admin/assessment-templates/template-form')}
          className="btn-primary"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Create Template</span>
        </button>
      </div>

      {/* Metrics Cards Grid */}
      <div className="metrics-grid">
        
        {/* Metric 1: Total Templates */}
        <div className="metric-card glass-card">
          <div className="metric-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'rgb(129, 140, 248)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <div>
            <div className="metric-value">{metrics.totalCount}</div>
            <div className="metric-label">Total Templates</div>
          </div>
        </div>

        {/* Metric 2: Quiz Count */}
        <div className="metric-card glass-card">
          <div className="metric-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'rgb(52, 211, 153)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div>
            <div className="metric-value">{metrics.quizCount}</div>
            <div className="metric-label">Active Quizzes</div>
          </div>
        </div>

        {/* Metric 3: Timed Assessments */}
        <div className="metric-card glass-card">
          <div className="metric-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'rgb(251, 191, 36)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <div className="metric-value">{metrics.timedCount}</div>
            <div className="metric-label">Timed Assessments</div>
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
              placeholder="Search templates by title..." 
            />
            <button 
              onClick={handleSearchBtnClick}
              className="px-4 py-1.5 ml-2 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-750 transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
            </div>
          ) : templates.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              No assessment templates found matching parameters.
            </div>
          ) : (
            <table className="glass-table">
              <thead>
                <tr className="select-none">
                  <th className="px-6 py-4" style={{ width: '40%' }}>Template Title</th>
                  <th className="px-6 py-4" style={{ width: '15%' }}>Type</th>
                  <th className="px-6 py-4" style={{ width: '15%' }}>Duration</th>
                  <th className="px-6 py-4" style={{ width: '15%' }}>Passing Score</th>
                  <th className="px-6 py-4 text-right" style={{ width: '15%' }}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-sm">
                {templates.map((data) => (
                  <tr key={data._id} className="transition-colors">
                    {/* Title */}
                    <td className="px-6 py-4">
                      <span className="font-semibold text-[var(--color-text-primary)]">{data.title}</span>
                    </td>

                    {/* Type badge */}
                    <td className="px-6 py-4">
                      <span className={`glass-badge ${
                        data.type === 'QUIZ' || data.type === 'quiz' ? 'glass-badge--active' : 'glass-badge--inactive'
                      }`}>
                        {data.type || 'QUIZ'}
                      </span>
                    </td>

                    {/* Duration */}
                    <td className="px-6 py-4 text-[var(--color-text-muted)]">
                      {data.duration_minutes > 0 ? (
                        <span className="flex items-center gap-1.5">
                          <svg className="shrink-0" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          {data.duration_minutes} mins
                        </span>
                      ) : (
                        <span>Unlimited</span>
                      )}
                    </td>

                    {/* Passing Score */}
                    <td className="px-6 py-4 text-[var(--color-text-muted)]">
                      {data.passing_score ? `${data.passing_score}%` : 'N/A'}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 items-center">
                        
                        {/* Edit Settings (Cogwheel) */}
                        <button 
                          onClick={() => router.push(`/admin/assessment-templates/template-form/${data._id}`)}
                          className="action-btn action-edit"
                          title="Edit template settings"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 008 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                          </svg>
                        </button>
                        
                        {/* Manage Questions (Green Form Icon) */}
                        <button 
                          onClick={() => router.push(`/admin/assessment-templates/${data._id}/builder`)}
                          className="action-btn action-edit"
                          style={{ color: '#0F9D58', background: 'rgba(15, 157, 88, 0.1)', borderColor: 'rgba(15, 157, 88, 0.2)' }}
                          title="Manage assessment questions"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                          </svg>
                        </button>
                        
                        {/* Delete Template (Red Bin Icon) */}
                        <button 
                          onClick={() => setPendingDeleteTemplate(data)}
                          className="action-btn action-delete"
                          title="Delete assessment template"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
                        </button>
                        
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Toolbar */}
        {!isLoading && total > pageSize && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-slate-800/40 text-xs font-semibold text-slate-400 select-none">
            <div>
              Showing {Math.min(total, (pageIndex - 1) * pageSize + 1)} - {Math.min(total, pageIndex * pageSize)} of {total} records
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handlePageChange(pageIndex - 1)}
                disabled={pageIndex === 1}
                className="glass-pagination-btn"
                aria-label="Previous page"
              >
                &lt;
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`glass-pagination-btn ${pageIndex === p ? 'glass-pagination-btn--active' : ''}`}
                >
                  {p}
                </button>
              ))}
              <button 
                onClick={() => handlePageChange(pageIndex + 1)}
                disabled={pageIndex === totalPages}
                className="glass-pagination-btn"
                aria-label="Next page"
              >
                &gt;
              </button>
            </div>
          </div>
        )}
      </div>

      {/* REMOVE TEMPLATE CONFIRMATION MODAL */}
      {pendingDeleteTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div 
            onClick={() => setPendingDeleteTemplate(null)}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
          ></div>
          
          <div className="relative w-full max-w-sm rounded-2xl border border-slate-800/80 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl animate-card-enter">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              
              <h3 className="mt-4 text-lg font-bold text-white">Confirm Deletion</h3>
              <p className="mt-2 text-sm text-slate-400">
                Are you sure you want to delete <strong className="text-white">{pendingDeleteTemplate.title}</strong>? This will remove all associated builder questions and cannot be undone.
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setPendingDeleteTemplate(null)}
                disabled={isDeleting}
                className="flex-1 rounded-lg border border-slate-800 bg-slate-950/30 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800/60 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                disabled={isDeleting}
                className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-600/15 hover:bg-red-700 active:scale-98 transition-all disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Yes, delete it'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

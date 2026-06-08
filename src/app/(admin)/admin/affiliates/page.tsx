'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getInfluencersFilter, updateInfluencer, encodeQuery } from '@/services/adminApi';
import { useCharacterStore } from '@/store/characterStore';

export default function InfluencerListPage() {
  const router = useRouter();
  
  // Component State
  const [influencers, setInfluencers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  
  // Pagination State
  const [total, setTotal] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Status Change Confirmation Modal State
  const [statusConfirmItem, setStatusConfirmItem] = useState<any | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Mascot Guide
  const { setEmotion, speak } = useCharacterStore();

  // Metrics
  const [metrics, setMetrics] = useState({
    totalCount: 0,
    activeCount: 0,
    totalReferrals: 0,
    totalEarnings: 0,
  });

  const loadData = async (searchVal = searchValue, page = pageIndex, size = pageSize) => {
    try {
      setIsLoading(true);
      
      const filterObj = {
        page: page,
        limit: size,
        search: searchVal
      };

      const q = encodeQuery(filterObj);
      const res = await getInfluencersFilter(q);
      
      if (res?.success) {
        setInfluencers(res.data || []);
        
        // Retrieve totals from pagination metadata or fallback to response array length
        const pagination = (res as any).pagination;
        if (pagination) {
          setTotal(pagination.totalRecords || 0);
        } else {
          setTotal(res.data?.length || 0);
        }

        // Calculate basic page metrics
        const list = res.data || [];
        const active = list.filter((i: any) => i.is_active).length;
        
        let referrals = 0;
        let earnings = 0;
        list.forEach((i: any) => {
          const profile = i.influencer_profile;
          if (profile?.metrics) {
            referrals += profile.metrics.total_referrals || 0;
            earnings += profile.metrics.total_earnings || 0;
          }
        });

        setMetrics({
          totalCount: pagination?.totalRecords || list.length,
          activeCount: active,
          totalReferrals: referrals,
          totalEarnings: earnings
        });
      }
    } catch (err) {
      console.error('Failed to load influencers', err);
      speak('Error! Failed to retrieve affiliate influencer records.', 4000);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(searchValue, pageIndex, pageSize);
  }, [pageIndex, pageSize]);

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setPageIndex(1);
      loadData(searchValue, 1, pageSize);
    }
  };

  const handleSearchBtnClick = () => {
    setPageIndex(1);
    loadData(searchValue, 1, pageSize);
  };

  const executeToggleStatus = async () => {
    if (!statusConfirmItem) return;
    try {
      setIsUpdatingStatus(true);
      setEmotion('thinking');
      const newStatus = !statusConfirmItem.is_active;
      const res = await updateInfluencer(statusConfirmItem._id, { is_active: newStatus });
      
      if (res.success) {
        setEmotion('celebrating');
        speak(`Success! Influencer ${statusConfirmItem.name} has been ${newStatus ? 'Activated' : 'Deactivated'}.`, 3500);
        setStatusConfirmItem(null);
        loadData();
      }
    } catch (err) {
      console.error('Failed to update influencer status', err);
      speak('Error! Failed to toggle partner active status.', 4000);
    } finally {
      setIsUpdatingStatus(false);
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
      <div className="page-header animate-header select-none">
        <div className="header-content">
          <div className="page-label-wrap mb-1 flex items-center gap-1.5">
            <span className="text-[#1E3494] dark:text-indigo-400 font-extrabold uppercase tracking-widest text-[10px]">
              PARTNERS
            </span>
            <span className="text-slate-400 text-xs">›</span>
            <span className="text-slate-500 dark:text-slate-400 text-[10px] font-semibold">
              Influencers
            </span>
          </div>
          <h1 className="page-title text-[var(--color-text-primary)] font-bold tracking-tight">
            Influencer Management
          </h1>
          <p className="page-subtitle text-slate-500 dark:text-slate-400 mt-1">
            Organize and track your affiliate partners and their commissions.
          </p>
        </div>

        <button 
          onClick={() => router.push('/admin/affiliates/influencer-form')}
          className="btn-primary flex items-center gap-2 px-6 py-2.5"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Add Influencer</span>
        </button>
      </div>

      {/* Main Data Table Card */}
      <div className="glass-card animate-card-enter">
        
        {/* Search bar (top left of card, no search button) */}
        <div className="relative w-full max-w-[280px] flex items-center mb-6 select-none">
          <svg className="absolute left-3.5 text-[var(--color-text-subtle)] pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              setPageIndex(1);
              loadData(e.target.value, 1, pageSize);
            }}
            className="glass-input pl-10 pr-4 py-2 text-sm font-medium" 
            placeholder="Search influencers..." 
          />
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
            </div>
          ) : influencers.length === 0 ? (
            <div className="py-12 text-center text-slate-500 select-none">
              No influencers found matching parameters.
            </div>
          ) : (
            <table className="glass-table">
              <thead>
                <tr className="select-none">
                  <th className="px-6 py-4">Influencer Name</th>
                  <th className="px-6 py-4">Referral Code</th>
                  <th className="px-6 py-4">Rates (Disc / Comm)</th>
                  <th className="px-6 py-4">Performance</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-sm">
                {influencers.map((data) => (
                  <tr key={data._id} className="transition-colors">
                    
                    {/* Name cell with solid Blue Avatar */}
                    <td className="px-6 py-4">
                      <div className="user-cell flex items-center">
                        <div className="w-10 h-10 rounded-full bg-[#2B4788] text-white flex items-center justify-center font-bold text-sm select-none shrink-0 shadow-sm">
                          {data.name?.charAt(0).toUpperCase() || 'I'}
                        </div>
                        <div className="flex flex-col ml-3">
                          <span className="font-bold text-[var(--color-text-primary)] text-sm">
                            {data.name}
                          </span>
                          <span className="text-[var(--color-text-muted)] text-xs mt-0.5 font-medium">
                            {data.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Referral Code (Solid brand blue badge) */}
                    <td className="px-6 py-4">
                      <span className="inline-block bg-[#2B4788] text-white px-3 py-1.5 rounded-md font-extrabold text-[11px] uppercase tracking-wider select-all shadow-sm">
                        {data.influencer_profile?.referral_code || 'N/A'}
                      </span>
                    </td>

                    {/* Rates */}
                    <td className="px-6 py-4 text-[var(--color-text-primary)] font-bold text-sm">
                      {data.influencer_profile?.discount_percentage}% / {data.influencer_profile?.commission_percentage}%
                    </td>

                    {/* Performance (Two-line layout with currency) */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[var(--color-text-muted)] text-xs font-semibold">
                          {data.influencer_profile?.metrics?.total_referrals || 0} Users
                        </span>
                        <span className="text-[#0F9D58] dark:text-[#34d399] font-extrabold text-sm mt-0.5">
                          ₹{data.influencer_profile?.metrics?.total_earnings || 0}
                        </span>
                      </div>
                    </td>

                    {/* Status Pill Badge */}
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                        data.is_active 
                          ? 'bg-emerald-100/70 text-emerald-700 border-emerald-200/40 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-500/20' 
                          : 'bg-red-100/75 text-red-700 border-red-200/40 dark:bg-red-950/20 dark:text-red-400 dark:border-red-500/20'
                      }`}>
                        {data.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right space-x-1">
                      <button 
                        onClick={() => router.push(`/admin/affiliates/influencer-form/${data._id}`)}
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-1.5 select-none"
                        title="Edit configuration"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => setStatusConfirmItem(data)}
                        className="text-slate-400 hover:text-slate-750 dark:hover:text-slate-200 transition-colors p-1.5 select-none"
                        title={data.is_active ? 'Deactivate' : 'Activate'}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                          <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Toolbar */}
        {!isLoading && total > pageSize && (
          <div className="flex justify-end px-6 py-4 border-t border-slate-100 dark:border-slate-800/60 select-none">
            <div className="flex gap-2">
              <button 
                onClick={() => handlePageChange(pageIndex - 1)}
                disabled={pageIndex === 1}
                className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500 hover:border-indigo-500 hover:text-indigo-650 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-xs font-bold transition-all shadow-sm"
                aria-label="Previous page"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                    pageIndex === p 
                      ? 'border-[#2B4788] bg-[#2B4788]/5 text-[#2B4788] dark:border-indigo-500 dark:bg-indigo-500/10 dark:text-indigo-400' 
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-[#2B4788] hover:text-[#2B4788] dark:hover:border-indigo-500 dark:hover:text-indigo-400'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button 
                onClick={() => handlePageChange(pageIndex + 1)}
                disabled={pageIndex === totalPages}
                className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500 hover:border-indigo-500 hover:text-indigo-650 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-xs font-bold transition-all shadow-sm"
                aria-label="Next page"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* STATUS TOGGLE CONFIRMATION MODAL */}
      {statusConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div 
            onClick={() => setStatusConfirmItem(null)}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
          ></div>
          
          <div className="relative w-full max-w-sm rounded-2xl border border-slate-800/80 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl animate-card-enter">
            <div className="flex flex-col items-center text-center">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${statusConfirmItem.is_active ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              
              <h3 className="mt-4 text-lg font-bold text-white">
                {statusConfirmItem.is_active ? 'Deactivate Affiliate' : 'Activate Affiliate'}
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                Are you sure you want to {statusConfirmItem.is_active ? 'deactivate' : 'activate'} <strong className="text-white">{statusConfirmItem.name}</strong>?
                {statusConfirmItem.is_active ? ' Active referrals and student discounts will stop working immediately.' : ' The referral code and discount terms will take effect immediately.'}
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setStatusConfirmItem(null)}
                disabled={isUpdatingStatus}
                className="flex-1 rounded-lg border border-slate-800 bg-slate-950/30 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800/60 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={executeToggleStatus}
                disabled={isUpdatingStatus}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold text-white shadow-lg transition-all disabled:opacity-50 ${
                  statusConfirmItem.is_active ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/15' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/15'
                }`}
              >
                {isUpdatingStatus ? 'Processing...' : statusConfirmItem.is_active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

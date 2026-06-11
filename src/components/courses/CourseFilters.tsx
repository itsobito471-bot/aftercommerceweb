"use client";

import React, { useState, useEffect } from 'react';

interface CourseFiltersProps {
  initialFilters: { search?: string; status?: string; category?: string };
  onApplyFilters: (filters: Record<string, any>) => void;
  onClearFilters: () => void;
}

export const CourseFilters: React.FC<CourseFiltersProps> = ({ initialFilters, onApplyFilters, onClearFilters }) => {
  const [search, setSearch] = useState(initialFilters.search || '');
  const [status, setStatus] = useState(initialFilters.status || '');
  const [category, setCategory] = useState(initialFilters.category || '');

  // Keep internal state in sync if URL props change externally
  useEffect(() => {
    setSearch(initialFilters.search || '');
    setStatus(initialFilters.status || '');
    setCategory(initialFilters.category || '');
  }, [initialFilters]);

  const handleApply = () => {
    onApplyFilters({ search, status, category });
  };

  const handleClear = () => {
    setSearch('');
    setStatus('');
    setCategory('');
    onClearFilters();
  };

  return (
    <div 
      className="rounded-lg p-5 mb-6 shadow-sm flex flex-wrap gap-5 items-end transition-all"
      style={{ backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--glass-border)', borderWidth: '1px' }}
    >
      <div className="flex-1 min-w-[200px]">
        <label className="block text-xs font-semibold mb-2 opacity-80 uppercase tracking-wide" style={{ color: 'var(--color-text-primary)' }}>Search Title</label>
        <input 
          type="text" 
          placeholder="e.g. Advanced Trading..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          className="w-full px-4 py-2.5 rounded-lg outline-none bg-black/5 dark:bg-white/5 border transition-all focus:ring-2 focus:ring-indigo-500/50"
          style={{ borderColor: 'var(--glass-border)', color: 'var(--color-text-primary)' }}
        />
      </div>
      
      <div className="w-48">
        <label className="block text-xs font-semibold mb-2 opacity-80 uppercase tracking-wide" style={{ color: 'var(--color-text-primary)' }}>Status</label>
        <select 
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg outline-none bg-black/5 dark:bg-white/5 border transition-all focus:ring-2 focus:ring-indigo-500/50 appearance-none"
          style={{ borderColor: 'var(--glass-border)', color: 'var(--color-text-primary)' }}
        >
          <option value="">All</option>
          <option value="true">Live (Published)</option>
          <option value="false">Draft</option>
        </select>
      </div>

      <div className="w-48">
        <label className="block text-xs font-semibold mb-2 opacity-80 uppercase tracking-wide" style={{ color: 'var(--color-text-primary)' }}>Category</label>
        <select 
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg outline-none bg-black/5 dark:bg-white/5 border transition-all focus:ring-2 focus:ring-indigo-500/50 appearance-none"
          style={{ borderColor: 'var(--glass-border)', color: 'var(--color-text-primary)' }}
        >
          <option value="">All Categories</option>
          <option value="Trading">Trading</option>
          <option value="E-Commerce">E-Commerce</option>
          <option value="Marketing">Marketing</option>
          <option value="Development">Development</option>
        </select>
      </div>

      <div className="flex gap-3">
        <button 
          onClick={handleClear}
          className="px-5 py-2.5 text-sm font-bold opacity-60 hover:opacity-100 transition-opacity"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Clear
        </button>
        <button 
          onClick={handleApply}
          className="px-6 py-2.5 text-sm font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md active:scale-95 transition-all"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCategories, updateCategory } from '@/services/adminApi';
import { Category } from '@/types/admin-lms';
import { useCharacterStore } from '@/store/characterStore';

export default function CategoriesPage() {
  const router = useRouter();
  
  // State
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalDocs, setTotalDocs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Mascot Zustand Store hooks
  const { setEmotion, speak } = useCharacterStore();

  const fetchCategoriesList = async (pageNumber = page, query = searchQuery) => {
    try {
      setIsLoading(true);
      
      const filterParams = {
        page: pageNumber,
        limit: pageSize,
        search: query
      };

      const encodedString = btoa(unescape(encodeURIComponent(JSON.stringify(filterParams))));
      const response = await getCategories(`?q=${encodedString}`);
      
      if (response && response.data) {
        setCategories(response.data);
        setTotalDocs(response.pagination?.totalDocs || response.data.length);
        setTotalPages(response.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load categories', err);
      speak('Error! Failed to retrieve category list.', 4000);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesList(page, searchQuery);
  }, [page]);

  const onSearch = () => {
    setPage(1);
    fetchCategoriesList(1, searchQuery);
  };

  const handlePageChange = (index: number) => {
    setPage(index);
  };

  const editCategory = (id: string) => {
    router.push(`/admin/courses/categories-form/${id}`);
  };

  const toggleStatus = async (category: Category) => {
    try {
      const newStatus = !category.is_active;
      const response = await updateCategory(category._id, { is_active: newStatus });
      if (response.success) {
        setCategories(categories.map((c) => c._id === category._id ? { ...c, is_active: newStatus } : c));
        setEmotion('celebrating');
        speak(`Category "${category.name}" is now ${newStatus ? 'activated' : 'deactivated'}.`, 3000);
      }
    } catch (err) {
      console.error('Failed to toggle category status', err);
      speak('Error! Failed to update category status.', 4000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl">
      {/* Page Header */}
      <div className="page-header animate-header select-none">
        <div className="header-content">
          <div className="page-label-wrap">
            <span className="page-label-root">Courses</span>
            <span className="page-label-sep">›</span>
            <span className="page-label-current">Categories</span>
          </div>
          <h1 className="page-title">Category Management</h1>
          <p className="page-subtitle">Organize your courses into searchable groups.</p>
        </div>

        <button 
          onClick={() => router.push('/admin/courses/categories-form')} 
          className="btn-primary"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Create Category</span>
        </button>
      </div>

      {/* Categories List Container */}
      <div className="glass-card animate-card-enter">
        {/* Toolbar */}
        <div className="table-toolbar">
          <div className="search-box">
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              className="glass-input search-input" 
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onSearch();
                }
              }}
            />
          </div>
        </div>

        {/* Table wrapper */}
        <div className="overflow-x-auto">
          {isLoading && categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="spinner"></div>
              <p className="text-sm text-[var(--color-text-muted)] mt-2">Loading categories...</p>
            </div>
          ) : !isLoading && categories.length === 0 ? (
            <div className="text-center py-12 text-[var(--color-text-muted)]">
              No categories found.
            </div>
          ) : (
            <table className="glass-table">
              <thead>
                <tr>
                  <th style={{ width: '25%' }}>Category Name</th>
                  <th style={{ width: '20%' }}>URL Slug</th>
                  <th style={{ width: '30%' }}>Description</th>
                  <th style={{ width: '10%' }}>Status</th>
                  <th style={{ textAlign: 'right', width: '15%' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((data) => (
                  <tr key={data._id}>
                    <td>
                      <div className="user-cell select-none">
                        <div className="avatar">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                          </svg>
                        </div>
                        <span className="fw-600 text-[var(--color-text-primary)]">{data.name}</span>
                      </div>
                    </td>
                    <td>
                      <code className="slug-text select-all">{data.slug}</code>
                    </td>
                    <td>
                      <span className="desc-text text-[var(--color-text-muted)]" title={data.description || ''}>
                        {data.description || '—'}
                      </span>
                    </td>
                    <td>
                      <span className={`glass-badge ${data.is_active ? 'glass-badge--active' : 'glass-badge--inactive'}`}>
                        {data.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="flex justify-end gap-2">
                        <button 
                          className="action-btn action-edit cursor-pointer" 
                          onClick={() => editCategory(data._id)}
                          title="Edit Category"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                        <button 
                          className="action-btn action-delete cursor-pointer" 
                          onClick={() => toggleStatus(data)}
                          title={data.is_active ? 'Deactivate Category' : 'Activate Category'}
                        >
                          {data.is_active ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.5 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                              <line x1="1" y1="1" x2="23" y2="23"></line>
                            </svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                          )}
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
        {!isLoading && totalDocs > pageSize && (
          <div className="flex justify-end px-6 py-4 border-t border-[var(--glass-border)] select-none">
            <div className="flex gap-2">
              <button 
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="glass-pagination-btn"
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
                  className={`glass-pagination-btn ${
                    page === p ? 'glass-pagination-btn--active' : ''
                  }`}
                >
                  {p}
                </button>
              ))}
              <button 
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="glass-pagination-btn"
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
    </div>
  );
}

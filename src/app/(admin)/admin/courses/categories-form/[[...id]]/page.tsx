'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCategory, updateCategory, getCategoryById } from '@/services/adminApi';
import { useCharacterStore } from '@/store/characterStore';

export default function CategoryFormPage({ params }: { params: { id?: string[] } }) {
  const router = useRouter();
  const categoryId = params.id && params.id[0];
  const isEditMode = !!categoryId;

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Mascot Zustand Store hooks
  const { setEmotion, speak } = useCharacterStore();

  useEffect(() => {
    if (!isEditMode || !categoryId) return;

    async function loadCategoryDetails(id: string) {
      try {
        setIsLoading(true);
        const response = await getCategoryById(id);
        if (response.success && response.data) {
          setName(response.data.name);
          setDescription(response.data.description || '');
          setIsActive(response.data.is_active);
        }
      } catch (err) {
        console.error('Failed to load category details', err);
        speak('Error! Could not load category details.', 4000);
        router.push('/admin/courses/categories');
      } finally {
        setIsLoading(false);
      }
    }

    loadCategoryDetails(categoryId);
  }, [isEditMode, categoryId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      speak('Warning! Category Name is required.', 3000);
      return;
    }

    try {
      setIsSaving(true);
      setEmotion('thinking');

      const payload = {
        name: name.trim(),
        description: description.trim(),
        is_active: isActive,
      };

      if (isEditMode && categoryId) {
        const response = await updateCategory(categoryId, payload);
        if (response.success) {
          setEmotion('celebrating');
          speak('Success! Category updated successfully.', 4000);
          router.push('/admin/courses/categories');
        }
      } else {
        const response = await createCategory(payload);
        if (response.success) {
          setEmotion('celebrating');
          speak('Success! New category created successfully.', 4000);
          router.push('/admin/courses/categories');
        }
      }
    } catch (err: any) {
      console.error('Failed to save category', err);
      const msg = err.response?.data?.message || 'Failed to submit category parameters.';
      speak(`Error! ${msg}`, 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const goBack = () => {
    router.back();
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl">
      {/* Page Header */}
      <div className="page-header animate-header select-none flex justify-between items-center">
        <div className="header-content">
          <h1 className="page-title text-[var(--color-text-primary)] font-bold tracking-tight">
            {isEditMode ? 'Edit Category' : 'Create Category'}
          </h1>
          <p className="page-subtitle text-slate-500 dark:text-slate-400 mt-1">
            Define how courses are grouped in the storefront.
          </p>
        </div>

        <button 
          type="button" 
          onClick={goBack}
          className="action-btn back-btn"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Categories
        </button>
      </div>

      {/* Form Card Container */}
      <div className="bg-[var(--color-bg-surface)] border border-[var(--glass-border)] rounded-xl shadow-md p-8 form-container animate-card-enter max-w-3xl relative">
        {/* Processing Spinner Overlay */}
        {(isLoading || isSaving) && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p className="text-sm font-semibold tracking-wide text-indigo-300 animate-pulse">
              {isSaving ? 'Saving Category...' : 'Loading details...'}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Name Input */}
          <div className="glass-form-group">
            <label className="glass-label">Category Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Web Development"
              className="w-full px-4 py-3 bg-[var(--color-bg-surface)] border border-[var(--glass-border)] rounded-lg text-[var(--color-text-primary)] placeholder-slate-450 focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all text-sm font-medium" 
              required
              disabled={isLoading || isSaving}
            />
          </div>

          {/* Description Textarea */}
          <div className="glass-form-group" style={{ marginBottom: 0 }}>
            <label className="glass-label">Description (Optional)</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Briefly describe this category..."
              className="w-full px-4 py-3 bg-[var(--color-bg-surface)] border border-[var(--glass-border)] rounded-lg text-[var(--color-text-primary)] placeholder-slate-450 focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all text-sm font-medium"
              style={{ resize: 'vertical', minHeight: '100px' }}
              disabled={isLoading || isSaving}
            />
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-[var(--glass-border)] my-6"></div>

          {/* Form Actions */}
          <div className="form-actions">
            <button 
              type="submit" 
              disabled={!name.trim() || isLoading || isSaving}
              className="btn-primary submit-btn flex items-center justify-center gap-2 px-6 py-2.5"
            >
              {isSaving ? (
                <svg className="animate-spin animate-pulse" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
              )}
              <span>{isEditMode ? 'Update Category' : 'Create Category'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

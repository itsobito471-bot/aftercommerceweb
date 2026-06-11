"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Course, StructureMode } from '@/types/course';
import { getCategories, createCourseShell, updateCourseShell } from '@/services/adminApi';
import { useCharacterStore } from '@/store/useCharacterStore';

interface CourseShellFormProps {
  initialData?: Partial<Course>;
  onSave?: (data: Partial<Course>) => void;
}

export const CourseShellForm: React.FC<CourseShellFormProps> = ({ initialData, onSave }) => {
  const [formData, setFormData] = useState<Partial<Course>>({
    title: initialData?.title || '',
    category: initialData?.category || '',
    category_id: (initialData as any)?.category_id || '',
    price: initialData?.price || 0,
    validity_days: initialData?.validity_days || 365,
    structure_mode: initialData?.structure_mode || StructureMode.LINEAR,
    is_published: initialData?.is_published || false,
  });

  const [issuesCertificate, setIssuesCertificate] = useState(false);

  // --- Category Infinite Scroll State ---
  const [categories, setCategories] = useState<any[]>([]);
  const [catPage, setCatPage] = useState(1);
  const [catHasMore, setCatHasMore] = useState(true);
  const [isCatLoading, setIsCatLoading] = useState(false);
  const [isCatOpen, setIsCatOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCatOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastCategoryElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isCatLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && catHasMore) {
        setCatPage(prev => prev + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [isCatLoading, catHasMore]);

  useEffect(() => {
    if (!isCatOpen) return;
    const fetchCats = async () => {
      setIsCatLoading(true);
      try {
        const res = await getCategories(`?page=${catPage}&limit=10`);
        const newCats = res.data || [];
        setCategories(prev => {
          const existingIds = new Set(prev.map(c => c.id || c._id));
          const toAdd = newCats.filter(c => !existingIds.has(c.id || c._id));
          return [...prev, ...toAdd];
        });
        if (res.pagination) {
          setCatHasMore(res.pagination.page < res.pagination.totalPages);
        } else {
          setCatHasMore(newCats.length === 10);
        }
      } catch (err) {
        console.error("Failed to fetch categories", err);
      } finally {
        setIsCatLoading(false);
      }
    };
    fetchCats();
  }, [catPage, isCatOpen]);

  // --- Form Handlers ---
  const [isLoading, setIsLoading] = useState(false);
  const triggerCharacter = useCharacterStore(state => state.triggerCharacter);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      if (name === 'issuesCertificate') setIssuesCertificate(checked);
      else setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCategorySelect = (cat: any) => {
    setFormData(prev => ({ 
      ...prev, 
      category_id: cat.id || cat._id,
      category: cat.name || cat.title || 'Selected Category'
    }));
    setIsCatOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let savedCourse;
      // If we already have a real ID from the DB (not our temporary "course-1234" ones)
      if (initialData?.id && !initialData.id.startsWith('course-')) {
        savedCourse = await updateCourseShell(initialData.id, formData);
      } else {
        savedCourse = await createCourseShell(formData);
      }
      
      triggerCharacter('celebrating', 'Course shell successfully saved to the database!');
      
      // Pass the real DB ID back up to the orchestrator so future saves do updates
      if (onSave) {
        onSave({
          ...formData,
          id: savedCourse?.data?._id || savedCourse?.data?.id || initialData?.id
        });
      }
    } catch (error) {
      console.error('Failed to save course shell:', error);
      triggerCharacter('helper', 'Oops, something went wrong saving that. Check your connection or missing fields.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all";
  const labelClass = "block text-sm font-semibold mb-1.5 opacity-90";

  // Derive display name for selected category
  const selectedCatDisplay = categories.find(c => (c.id || c._id) === formData.category_id)?.name 
    || formData.category 
    || "Select a category...";

  return (
    <form onSubmit={handleSubmit} className="space-y-6" style={{ color: 'var(--color-text-primary)' }}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>Course Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={inputClass}
            style={{ backgroundColor: 'var(--color-bg-elevated)', borderColor: 'var(--glass-border)' }}
            placeholder="e.g. Advanced E-Commerce Strategies"
            required
          />
        </div>

        <div className="relative" ref={dropdownRef}>
          <label className={labelClass}>Category</label>
          <div 
            onClick={() => setIsCatOpen(!isCatOpen)}
            className={`${inputClass} cursor-pointer flex justify-between items-center`}
            style={{ backgroundColor: 'var(--color-bg-elevated)', borderColor: 'var(--glass-border)' }}
          >
            <span className={formData.category_id || formData.category ? '' : 'opacity-50'}>
              {selectedCatDisplay}
            </span>
            <svg className={`w-4 h-4 transition-transform ${isCatOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {isCatOpen && (
            <div 
              className="absolute z-50 w-full mt-2 rounded-lg shadow-xl border overflow-y-auto max-h-60"
              style={{ backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--glass-border)' }}
            >
              {categories.map((cat, index) => {
                const isLast = index === categories.length - 1;
                return (
                  <div
                    key={cat.id || cat._id}
                    ref={isLast ? lastCategoryElementRef : null}
                    onClick={() => handleCategorySelect(cat)}
                    className="px-4 py-2.5 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-b last:border-b-0"
                    style={{ borderColor: 'var(--glass-border)' }}
                  >
                    {cat.name || cat.title || 'Unnamed Category'}
                  </div>
                );
              })}
              
              {isCatLoading && (
                <div className="px-4 py-3 text-sm opacity-60 flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500"></div>
                  Loading categories...
                </div>
              )}
              
              {!isCatLoading && categories.length === 0 && (
                <div className="px-4 py-3 text-sm opacity-60 text-center">
                  No categories found.
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <label className={labelClass}>Price ($)</label>
          <input
            type="number"
            name="price"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={handleChange}
            className={inputClass}
            style={{ backgroundColor: 'var(--color-bg-elevated)', borderColor: 'var(--glass-border)' }}
            required
          />
        </div>

        <div>
          <label className={labelClass}>Validity Window (Days)</label>
          <input
            type="number"
            name="validity_days"
            min="0"
            value={formData.validity_days}
            onChange={handleChange}
            className={inputClass}
            style={{ backgroundColor: 'var(--color-bg-elevated)', borderColor: 'var(--glass-border)' }}
            required
          />
        </div>
      </div>

      <div className="pt-4 border-t" style={{ borderColor: 'var(--glass-border)' }}>
        <h3 className="text-lg font-bold mb-4">Configuration Toggles</h3>
        <div className="flex flex-col gap-4">
          
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="structure_mode"
              checked={formData.structure_mode === StructureMode.FREE_FLEXIBLE}
              onChange={(e) => setFormData(prev => ({
                ...prev, 
                structure_mode: e.target.checked ? StructureMode.FREE_FLEXIBLE : StructureMode.LINEAR
              }))}
              className="w-5 h-5 rounded accent-indigo-500 bg-[var(--color-bg-elevated)] border-[var(--glass-border)]"
            />
            <div>
              <span className="font-semibold block">Flexible Structure Mode</span>
              <span className="text-sm opacity-70">If checked, students can jump between modules freely. If unchecked, progression is strictly linear.</span>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="issuesCertificate"
              checked={issuesCertificate}
              onChange={handleChange}
              className="w-5 h-5 rounded accent-indigo-500 bg-[var(--color-bg-elevated)] border-[var(--glass-border)]"
            />
            <div>
              <span className="font-semibold block">Issues Certificate</span>
              <span className="text-sm opacity-70">Reward a completion certificate when all mandatory units are finished.</span>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="is_published"
              checked={formData.is_published}
              onChange={handleChange}
              className="w-5 h-5 rounded accent-indigo-500 bg-[var(--color-bg-elevated)] border-[var(--glass-border)]"
            />
            <div>
              <span className="font-semibold block">Publish Course</span>
              <span className="text-sm opacity-70">Make this course instantly visible and purchasable in the storefront.</span>
            </div>
          </label>

        </div>
      </div>

      <div className="pt-6 flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : null}
          {isLoading ? 'Saving...' : 'Save Course Shell'}
        </button>
      </div>
    </form>
  );
};

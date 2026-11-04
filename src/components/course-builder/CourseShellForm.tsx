"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Course, StructureMode, CourseStatus, Module, LearningUnitType } from '@/types/course';
import { getCategories, getCategoryById, createCourseShell, updateCourseShell, toggleFeaturedCourse } from '@/services/adminApi';
import { useCharacterStore } from '@/store/useCharacterStore';
import { QuillEditor } from '@/components/common/QuillEditor';
import { Modal } from '@/components/common/Modal';

interface CourseShellFormProps {
  initialData?: Partial<Course>;
  onSave?: (data: Partial<Course>) => void;
}

export interface UnitValidationError {
  unitId?: string;
  moduleTitle: string;
  unitTitle: string;
  type: string;
  reason: string;
}

/**
 * Validates that every module and learning unit in the course has uploaded/configured content
 * prior to publication.
 */
export const validateCourseUnitsForPublication = (modules?: Module[]): { valid: boolean; errors: UnitValidationError[] } => {
  if (!modules || modules.length === 0) {
    return {
      valid: false,
      errors: [{
        moduleTitle: 'Curriculum',
        unitTitle: 'Modules',
        type: 'STRUCTURE',
        reason: 'Course must contain at least one module before being published.'
      }]
    };
  }

  const allUnits = modules.flatMap(m => (m.units || []).map(u => ({ ...u, moduleTitle: m.title || 'Untitled Module' })));
  if (allUnits.length === 0) {
    return {
      valid: false,
      errors: [{
        moduleTitle: 'Curriculum',
        unitTitle: 'Learning Units',
        type: 'STRUCTURE',
        reason: 'Course must contain at least one learning unit inside a module before being published.'
      }]
    };
  }

  const errors: UnitValidationError[] = [];

  for (const unit of allUnits) {
    const modTitle = unit.moduleTitle;
    const unitTitle = unit.title || 'Untitled Unit';
    const uType = (unit.type || '').toUpperCase();
    const cData = (unit.content_data as any) || {};

    if (uType === 'VIDEO' || unit.type === LearningUnitType.VIDEO) {
      const hasCipher = Boolean(cData.vdo_cipher_id && String(cData.vdo_cipher_id).trim().length > 0);
      const hasDirect = Boolean((cData.direct_video_url && String(cData.direct_video_url).trim().length > 0) || cData.document_id);
      if (!hasCipher && !hasDirect) {
        errors.push({
          unitId: unit.id,
          moduleTitle: modTitle,
          unitTitle,
          type: 'VIDEO',
          reason: 'Video source is missing. Please upload a Cloud Video File or configure a VdoCipher Video ID.'
        });
      }
    } else if (uType === 'NOTES' || unit.type === LearningUnitType.NOTES) {
      const rawNotes = String(cData.rich_text_content || '').trim();
      const cleanNotes = rawNotes.replace(/<p><br><\/p>|<br>|<[^>]+>/g, '').trim();
      const hasMedia = rawNotes.includes('<img') || rawNotes.includes('<iframe');
      if (!cleanNotes && !hasMedia) {
        errors.push({
          unitId: unit.id,
          moduleTitle: modTitle,
          unitTitle,
          type: 'NOTES',
          reason: 'Lecture notes content is empty. Please provide formatted notes text or media.'
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

const isHex = (str?: string) => Boolean(str && /^[0-9a-fA-F]{24}$/.test(str));

export const CourseShellForm: React.FC<CourseShellFormProps> = ({ initialData, onSave }) => {
  const [formData, setFormData] = useState<Partial<Course>>({
    title: initialData?.title || '',
    category: !isHex(initialData?.category) && initialData?.category ? initialData.category : '',
    category_id: (initialData as any)?.category_id || (isHex(initialData?.category) ? initialData?.category : ''),
    price: initialData?.price || 0,
    validity_days: initialData?.validity_days || 365,
    structure_mode: initialData?.structure_mode || StructureMode.LINEAR,
    status: (initialData as any)?.status || (initialData?.is_published ? CourseStatus.PUBLISHED : CourseStatus.IN_PROGRESS),
    is_published: initialData?.is_published || false,
    description: initialData?.description || '',
  });

  const [isFeatured, setIsFeatured] = useState<boolean>(Boolean(initialData?.is_featured));
  const [isFeatureLoading, setIsFeatureLoading] = useState(false);
  const [issuesCertificate, setIssuesCertificate] = useState(false);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [publishValidationError, setPublishValidationError] = useState<string | null>(null);

  // Admin publication confirmation and content validation modals
  const [showConfirmPublishModal, setShowConfirmPublishModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState<UnitValidationError[]>([]);
  const [errorModalData, setErrorModalData] = useState<{ title: string; description: string } | null>(null);

  // Curriculum verification: course must contain at least 1 module and 1 learning unit before publishing
  const modulesCount = initialData?.modules?.length || 0;
  const totalUnitsCount = (initialData?.modules || []).reduce((acc, m) => acc + (m.units?.length || 0), 0);
  const canPublish = modulesCount > 0 && totalUnitsCount > 0;

  // Synchronize internal form state when initialData changes externally (e.g. backend fetch or parent update)
  useEffect(() => {
    if (initialData) {
      const initialCatId = (initialData as any)?.category_id || (isHex(initialData?.category) ? initialData?.category : '');
      const initialCatName = !isHex(initialData?.category) && initialData?.category ? initialData.category : '';

      setFormData(prev => ({
        ...prev,
        id: initialData.id ?? prev.id,
        title: initialData.title !== undefined ? initialData.title : prev.title,
        category: initialCatName || prev.category,
        category_id: initialCatId || prev.category_id,
        price: initialData.price !== undefined ? initialData.price : prev.price,
        validity_days: initialData.validity_days !== undefined ? initialData.validity_days : prev.validity_days,
        structure_mode: initialData.structure_mode ?? prev.structure_mode,
        status: (initialData as any)?.status ?? (initialData?.is_published ? CourseStatus.PUBLISHED : prev.status ?? CourseStatus.IN_PROGRESS),
        is_published: initialData.is_published !== undefined ? initialData.is_published : prev.is_published,
        description: initialData.description !== undefined ? initialData.description : (prev.description || ''),
      }));
      if ((initialData as any)?.issues_certificate !== undefined) {
        setIssuesCertificate((initialData as any).issues_certificate);
      }
    }
  }, [
    initialData?.id, 
    initialData?.title, 
    initialData?.description, 
    initialData?.category, 
    (initialData as any)?.category_id,
    initialData?.price, 
    initialData?.validity_days, 
    initialData?.structure_mode, 
    (initialData as any)?.status, 
    initialData?.is_published,
    (initialData as any)?.issues_certificate
  ]);

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

  // 1. Preload categories on mount (and on pagination)
  useEffect(() => {
    let isCancelled = false;
    const fetchCats = async () => {
      setIsCatLoading(true);
      try {
        const res = await getCategories(`?page=${catPage}&limit=20`);
        if (isCancelled) return;
        const newCats = res.data || [];
        setCategories(prev => {
          const existingIds = new Set(prev.map(c => c.id || c._id));
          const toAdd = newCats.filter(c => !existingIds.has(c.id || c._id));
          return [...prev, ...toAdd];
        });
        if (res.pagination) {
          setCatHasMore(res.pagination.page < res.pagination.totalPages);
        } else {
          setCatHasMore(newCats.length === 20);
        }
      } catch (err) {
        console.error("Failed to fetch categories", err);
      } finally {
        if (!isCancelled) setIsCatLoading(false);
      }
    };
    fetchCats();
    return () => { isCancelled = true; };
  }, [catPage]);

  // 2. If an active category ID is present but not yet in categories list, fetch it directly
  useEffect(() => {
    const rawCatId = formData.category_id 
      || (initialData as any)?.category_id 
      || (isHex(formData.category) ? formData.category : '') 
      || (isHex(initialData?.category) ? initialData?.category : '');
    
    if (rawCatId && isHex(rawCatId)) {
      const alreadyHas = categories.some(c => (c.id || c._id) === rawCatId);
      if (!alreadyHas) {
        getCategoryById(rawCatId)
          .then(res => {
            if (res?.data) {
              setCategories(prev => {
                if (prev.some(c => (c.id || c._id) === (res.data.id || res.data._id))) return prev;
                return [res.data, ...prev];
              });
              setFormData(prev => ({
                ...prev,
                category_id: res.data.id || res.data._id,
                category: res.data.name || prev.category
              }));
            }
          })
          .catch(err => console.warn("Failed to resolve category by ID:", err));
      }
    }
  }, [formData.category_id, formData.category, initialData, categories]);

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

  /**
   * Admin publication card click handler:
   * 1. Validates that modules exist and that EVERY learning unit has valid uploaded content.
   * 2. If valid, opens a confirmation dialog asking the admin "Are you sure you want to publish?".
   */
  const handlePublishCardClick = () => {
    setPublishValidationError(null);

    // 1. Structural check
    if (!canPublish) {
      const errMsg = `Cannot publish course: A course must contain at least one module and at least one learning unit before being published. Current curriculum has ${modulesCount} modules and ${totalUnitsCount} units.`;
      setPublishValidationError(errMsg);
      setValidationErrors([{
        moduleTitle: 'Course Curriculum',
        unitTitle: 'Curriculum Hierarchy',
        type: 'STRUCTURE',
        reason: 'Please create at least one module and add learning units before attempting to publish this course.'
      }]);
      setErrorModalData({
        title: 'Cannot Publish Course — Incomplete Structure',
        description: errMsg
      });
      triggerCharacter('helper', 'Cannot publish yet! You need at least 1 module and 1 learning unit before publishing this course.');
      return;
    }

    // 2. Comprehensive unit content validation
    const check = validateCourseUnitsForPublication(initialData?.modules);
    if (!check.valid) {
      setValidationErrors(check.errors);
      setErrorModalData({
        title: 'Cannot Publish Course — Missing Unit Content',
        description: 'Before this course can be published live to students, every learning unit must have its required video or notes content uploaded and configured.'
      });
      triggerCharacter('helper', 'Cannot publish yet! Some learning units are missing video or notes content.');
      return;
    }

    // 3. Admin Confirmation Modal: "Are you sure?"
    setShowConfirmPublishModal(true);
  };

  const handleConfirmPublish = () => {
    setShowConfirmPublishModal(false);
    setFormData(prev => ({ ...prev, status: CourseStatus.PUBLISHED, is_published: true }));
    triggerCharacter('celebrating', 'Status set to Published! Click "Save Course Shell" to commit your live course to the storefront.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishValidationError(null);

    // Guard: Validate publish requirements on submit
    if (formData.status === CourseStatus.PUBLISHED) {
      const check = validateCourseUnitsForPublication(initialData?.modules);
      if (!check.valid) {
        setValidationErrors(check.errors);
        setErrorModalData({
          title: 'Cannot Save as Published — Missing Content',
          description: 'Cannot save this course as PUBLISHED. Every learning unit must have uploaded/configured content before going live.'
        });
        triggerCharacter('helper', 'Cannot publish yet: Some learning units are missing content.');
        return;
      }
    }

    setIsLoading(true);

    try {
      const resolvedCategoryId = formData.category_id 
        || (isHex(formData.category) ? formData.category : '') 
        || (initialData as any)?.category_id 
        || (isHex(initialData?.category) ? initialData?.category : '');

      const payload = {
        ...formData,
        category_id: resolvedCategoryId,
        status: formData.status || CourseStatus.IN_PROGRESS,
        is_published: formData.status === CourseStatus.PUBLISHED,
        issues_certificate: issuesCertificate
      };

      let savedCourse;
      // If we already have a real ID from the DB (not our temporary "course-1234" ones)
      const isExisting = Boolean(initialData?.id && !initialData.id.startsWith('course-'));
      if (isExisting) {
        savedCourse = await updateCourseShell(initialData!.id!, payload);
      } else {
        savedCourse = await createCourseShell(payload);
      }

      const returnedCourse = savedCourse?.data as any;
      const savedId = returnedCourse?._id || returnedCourse?.id || initialData?.id || '';
      const savedDescription = returnedCourse?.description !== undefined ? returnedCourse.description : (payload.description || '');
      const savedStatus = returnedCourse?.status || payload.status;
      
      const populatedCat = typeof returnedCourse?.category_id === 'object' && returnedCourse?.category_id !== null ? returnedCourse.category_id : null;
      const savedCatName = populatedCat?.name || selectedCatDisplay;
      const savedCatId = populatedCat?._id || resolvedCategoryId;

      // Immediately patch back into internal formData state so the UI and Quill editor stay perfectly synchronized
      setFormData(prev => ({
        ...prev,
        ...payload,
        id: savedId,
        category: savedCatName,
        category_id: savedCatId,
        description: savedDescription,
        status: savedStatus
      }));

      triggerCharacter('celebrating', 'Course shell successfully saved to the database!');
      setShowSavedModal(true);
      
      // Pass the real DB ID and all persisted fields back up to the orchestrator
      if (onSave) {
        onSave({
          ...payload,
          id: savedId,
          category: savedCatName,
          category_id: savedCatId,
          description: savedDescription,
          status: savedStatus
        });
      }
    } catch (error: any) {
      const errMsg = error?.response?.data?.message || error?.message || 'Failed to save course shell. Check your connection or missing fields.';
      console.error('Failed to save course shell:', error);
      
      const backendDetails = error?.response?.data?.details;
      if (Array.isArray(backendDetails) && backendDetails.length > 0) {
        setValidationErrors(backendDetails.map((d: any) => ({
          moduleTitle: d.module_title || 'Module',
          unitTitle: d.unit_title || 'Unit',
          type: d.type || 'Unit',
          reason: d.reason || 'Content missing'
        })));
        setErrorModalData({
          title: 'Publication Validation Failed',
          description: error?.response?.data?.message || 'Some learning units do not satisfy publish requirements.'
        });
      } else {
        setPublishValidationError(errMsg);
      }
      triggerCharacter('helper', errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all";
  const labelClass = "block text-sm font-semibold mb-1.5 opacity-90";

  // Derive display name for selected category
  const matchedCategory = categories.find(c => {
    const cId = c.id || c._id;
    return cId === formData.category_id || cId === formData.category;
  });

  const selectedCatDisplay = 
    matchedCategory?.name 
    || (!isHex(formData.category) && formData.category ? formData.category : '')
    || (!isHex(initialData?.category) && initialData?.category ? initialData.category : '')
    || (formData.category_id || isHex(formData.category) ? 'Loading category...' : 'Select a category...');

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

      {/* ── COURSE DESCRIPTION WITH QUILL RICH TEXT EDITOR ── */}
      <div className="pt-4 border-t" style={{ borderColor: 'var(--glass-border)' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-base font-bold">Course Description & Syllabus Overview</h3>
              <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 font-bold border border-indigo-500/20 whitespace-nowrap shrink-0">
                Rich HTML Editor
              </span>
            </div>
            <p className="text-xs opacity-70 mt-1 leading-relaxed">
              Format comprehensive syllabus details, outcomes, and requirements with the rich Quill editor. HTML is saved directly to the database.
            </p>
          </div>
        </div>

        <QuillEditor
          value={formData.description || ''}
          onChange={(html) => setFormData(prev => ({ ...prev, description: html }))}
          placeholder="Craft rich curriculum overview, prerequisites, career pathways, and syllabus details..."
          minHeight="220px"
        />
      </div>

      {/* ── COURSE STATUS MANAGEMENT (4-TIER LIFECYCLE SELECTOR) ── */}
      <div className="pt-4 border-t" style={{ borderColor: 'var(--glass-border)' }}>
        <div className="mb-3">
          <h3 className="text-base font-bold">Course Publication & Lifecycle Status</h3>
          <p className="text-xs opacity-70">
            Control the live storefront availability and visibility state for this course.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Published */}
          <div
            onClick={handlePublishCardClick}
            className={`p-4 rounded-xl border-2 transition-all flex items-start gap-3.5 ${
              !canPublish
                ? 'opacity-65 border-[var(--glass-border)] bg-[var(--color-bg-elevated)] cursor-not-allowed'
                : formData.status === CourseStatus.PUBLISHED
                  ? 'border-emerald-500 bg-emerald-500/5 shadow-sm ring-2 ring-emerald-500/20 cursor-pointer'
                  : 'border-[var(--glass-border)] bg-[var(--color-bg-elevated)] hover:border-slate-400 opacity-80 hover:opacity-100 cursor-pointer'
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-lg shrink-0 border border-emerald-500/20">
              🚀
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">Published (Live)</span>
                {!canPublish ? (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                    🔒 Locked (0 units)
                  </span>
                ) : formData.status === CourseStatus.PUBLISHED ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                ) : null}
              </div>
              <p className="text-xs opacity-75 mt-0.5 leading-relaxed">
                {!canPublish 
                  ? `Requires at least 1 module & 1 learning unit (${modulesCount} modules, ${totalUnitsCount} units configured).` 
                  : 'Live & actively available for enrollment in the public storefront.'}
              </p>
            </div>
          </div>

          {/* In Progress */}
          <div
            onClick={() => {
              setPublishValidationError(null);
              setFormData(prev => ({ ...prev, status: CourseStatus.IN_PROGRESS, is_published: false }));
            }}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
              formData.status === CourseStatus.IN_PROGRESS
                ? 'border-amber-500 bg-amber-500/5 shadow-sm ring-2 ring-amber-500/20'
                : 'border-[var(--glass-border)] bg-[var(--color-bg-elevated)] hover:border-slate-400 opacity-80 hover:opacity-100'
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-lg shrink-0 border border-amber-500/20">
              🛠️
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-amber-600 dark:text-amber-400">In Progress (Draft)</span>
                {formData.status === CourseStatus.IN_PROGRESS && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                )}
              </div>
              <p className="text-xs opacity-75 mt-0.5 leading-relaxed">
                Saved internally in development. <strong>Hidden from students</strong> on the public storefront.
              </p>
            </div>
          </div>

          {/* Coming Soon */}
          <div
            onClick={() => {
              setPublishValidationError(null);
              setFormData(prev => ({ ...prev, status: CourseStatus.COMING_SOON, is_published: false }));
            }}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
              formData.status === CourseStatus.COMING_SOON
                ? 'border-blue-500 bg-blue-500/5 shadow-sm ring-2 ring-blue-500/20'
                : 'border-[var(--glass-border)] bg-[var(--color-bg-elevated)] hover:border-slate-400 opacity-80 hover:opacity-100'
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-lg shrink-0 border border-blue-500/20">
              ⏳
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-blue-600 dark:text-blue-400">Coming Soon</span>
                {formData.status === CourseStatus.COMING_SOON && (
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                )}
              </div>
              <p className="text-xs opacity-75 mt-0.5 leading-relaxed">
                Teaser preview for upcoming cohorts with a Coming Soon priority banner.
              </p>
            </div>
          </div>

          {/* Paused */}
          <div
            onClick={() => {
              setPublishValidationError(null);
              setFormData(prev => ({ ...prev, status: CourseStatus.PAUSED, is_published: false }));
            }}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
              formData.status === CourseStatus.PAUSED
                ? 'border-rose-500 bg-rose-500/5 shadow-sm ring-2 ring-rose-500/20'
                : 'border-[var(--glass-border)] bg-[var(--color-bg-elevated)] hover:border-slate-400 opacity-80 hover:opacity-100'
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold text-lg shrink-0 border border-rose-500/20">
              ⏸️
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-rose-600 dark:text-rose-400">Paused</span>
                {formData.status === CourseStatus.PAUSED && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </div>
              <p className="text-xs opacity-75 mt-0.5 leading-relaxed">
                Temporarily suspended. Enrollment disabled & <strong>hidden from learners</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONFIGURATION TOGGLES ── */}
      <div className="pt-4 border-t" style={{ borderColor: 'var(--glass-border)' }}>
        <h3 className="text-base font-bold mb-3">Curriculum Structure & Accreditation</h3>
        <div className="flex flex-col gap-3">
          
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
              <span className="font-semibold block text-sm">Flexible Structure Mode</span>
              <span className="text-xs opacity-70">If checked, students can jump between modules freely. If unchecked, progression is strictly linear.</span>
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
              <span className="font-semibold block text-sm">Issues Certificate</span>
              <span className="text-xs opacity-70">Reward an accredited completion certificate when all mandatory units are finished.</span>
            </div>
          </label>

        </div>
      </div>

      {/* ── PUBLICATION GUARD ALERT BANNER ── */}
      {publishValidationError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
          <span className="text-lg shrink-0">⚠️</span>
          <div className="flex-1">
            <p className="font-bold text-xs uppercase tracking-wider">Publishing Guard</p>
            <p className="text-xs opacity-90 mt-0.5 leading-relaxed">{publishValidationError}</p>
          </div>
          <button 
            type="button" 
            onClick={() => setPublishValidationError(null)}
            className="text-xs font-bold opacity-60 hover:opacity-100 p-1"
            title="Dismiss warning"
          >
            ✕
          </button>
        </div>
      )}

      <div className="pt-6 flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : null}
          {isLoading ? 'Saving...' : 'Save Course Shell'}
        </button>
      </div>

      {/* ── 1. CONFIRM PUBLISH MODAL ("ARE YOU SURE?") ── */}
      <Modal
        isOpen={showConfirmPublishModal}
        onClose={() => setShowConfirmPublishModal(false)}
        title="Publish Course to Live Storefront?"
        type="warning"
        description="Are you sure you want to change the course status to PUBLISHED? Once published, this course and all its verified learning units will immediately be live and available for students to enroll and access."
        primaryAction={{
          label: "Yes, Publish Course 🚀",
          onClick: handleConfirmPublish,
          variant: "primary"
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => setShowConfirmPublishModal(false),
          variant: "secondary"
        }}
      >
        <div 
          className="p-4 rounded-xl border space-y-2 text-xs"
          style={{ backgroundColor: 'var(--color-bg-elevated)', borderColor: 'var(--glass-border)' }}
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold opacity-70">Curriculum Structure:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              ✓ {modulesCount} Module(s), {totalUnitsCount} Unit(s)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold opacity-70">Content Validation:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              ✓ All Units Have Video or Notes Uploaded
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold opacity-70">Storefront Visibility:</span>
            <span className="font-bold text-indigo-500">
              Immediate Public Availability
            </span>
          </div>
        </div>
      </Modal>

      {/* ── 2. VALIDATION ERROR MODAL (SPECIFIC UNITS MISSING CONTENT) ── */}
      <Modal
        isOpen={validationErrors.length > 0}
        onClose={() => {
          setValidationErrors([]);
          setErrorModalData(null);
        }}
        title={errorModalData?.title || "Cannot Publish Course — Incomplete Units"}
        type="error"
        description={errorModalData?.description || "All learning units must have uploaded/configured video or notes content before this course can go live."}
        primaryAction={{
          label: "Understood, I'll Complete the Content ➔",
          onClick: () => {
            setValidationErrors([]);
            setErrorModalData(null);
          },
          variant: "primary"
        }}
        maxWidth="lg"
      >
        <div className="space-y-3 mt-2">
          <div className="flex items-center justify-between text-xs font-semibold px-1">
            <span className="text-rose-600 dark:text-rose-400 font-bold">
              {validationErrors.length} Unit(s) Requiring Attention:
            </span>
            <span className="text-[11px] opacity-60">
              Use curriculum tree to edit units
            </span>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
            {validationErrors.map((err, idx) => (
              <div 
                key={idx}
                className="p-3 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/70 dark:bg-rose-950/20 text-xs flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold flex items-center justify-center shrink-0 border border-rose-500/20 text-xs">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {err.unitTitle}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 font-semibold text-slate-700 dark:text-slate-200">
                      {err.moduleTitle}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold border border-rose-500/20">
                      {err.type}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {err.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* ── 3. REUSABLE MODAL NOTIFICATION AFTER SAVING ── */}
      <Modal
        isOpen={showSavedModal}
        onClose={() => setShowSavedModal(false)}
        title="Course Saved Successfully!"
        type="success"
        description="Your course shell, pricing, lifecycle publication state, and rich syllabus description have been saved to the database."
        primaryAction={{
          label: "Continue Editing ➔",
          onClick: () => setShowSavedModal(false),
          variant: "primary"
        }}
        secondaryAction={{
          label: "View All Courses",
          href: "/admin/courses",
          variant: "secondary"
        }}
      >
        <div 
          className="p-4 rounded-2xl border space-y-2.5 text-xs shadow-inner"
          style={{ 
            backgroundColor: 'var(--color-bg-elevated)', 
            borderColor: 'var(--glass-border)' 
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="opacity-60 font-semibold">Course Title:</span>
            <span className="font-bold text-sm truncate max-w-[220px]" style={{ color: 'var(--color-text-primary)' }}>
              {formData.title || 'Untitled Course'}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="opacity-60 font-semibold">Lifecycle Status:</span>
            <div>
              {formData.status === CourseStatus.PUBLISHED && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20 inline-flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Published (Live)</span>
                </span>
              )}
              {formData.status === CourseStatus.IN_PROGRESS && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20 inline-flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>In Progress (Draft)</span>
                </span>
              )}
              {formData.status === CourseStatus.COMING_SOON && (
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/20 inline-flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>Coming Soon</span>
                </span>
              )}
              {formData.status === CourseStatus.PAUSED && (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold border border-rose-500/20 inline-flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>Paused</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="opacity-60 font-semibold">Category:</span>
            <span className="font-semibold opacity-90 truncate max-w-[200px]">
              {selectedCatDisplay}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="opacity-60 font-semibold">Price:</span>
            <span className="font-mono font-bold text-sm text-indigo-500">
              ${Number(formData.price || 0).toFixed(2)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="opacity-60 font-semibold">Validity Window:</span>
            <span className="font-mono font-semibold opacity-80">
              {formData.validity_days || 365} Days
            </span>
          </div>
        </div>
      </Modal>
    </form>
  );
};

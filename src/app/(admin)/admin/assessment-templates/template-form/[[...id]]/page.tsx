'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAssessmentTemplateById, createAssessmentTemplate, updateAssessmentTemplate } from '@/services/adminApi';
import { useCharacterStore } from '@/store/characterStore';

export default function AssessmentTemplateFormPage({ params }: { params: { id?: string[] } }) {
  const router = useRouter();

  // Extract optional id from catch-all dynamic path array
  const templateId = params.id && params.id[0];
  const isEditMode = !!templateId;

  // Form State
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'QUIZ' | 'SURVEY'>('QUIZ');
  const [durationMinutes, setDurationMinutes] = useState<number>(0);
  const [passingScore, setPassingScore] = useState<number | ''>('');

  // UI State
  const [isFetching, setIsFetching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Validation Touch Trackers
  const [touched, setTouched] = useState({
    title: false,
    passingScore: false,
  });

  // Mascot Guide
  const { setEmotion, speak } = useCharacterStore();

  // Handle type changes to disable/reset passing score for surveys
  useEffect(() => {
    if (type === 'SURVEY') {
      setPassingScore('');
    }
  }, [type]);

  // Fetch assessment template details if editing
  useEffect(() => {
    if (!isEditMode || !templateId) return;

    async function loadTemplateDetails(id: string) {
      try {
        setIsFetching(true);
        const response = await getAssessmentTemplateById(id);
        if (response.success && response.data) {
          const template = response.data;
          setTitle(template.title || '');
          setType(template.type || 'QUIZ');
          setDurationMinutes(template.duration_minutes || 0);
          setPassingScore(template.passing_score !== undefined && template.passing_score !== null ? template.passing_score : '');
        }
      } catch (err) {
        console.error('Failed to load assessment template details', err);
        speak('Error! Failed to retrieve template details.', 4000);
        router.push('/admin/assessment-templates');
      } finally {
        setIsFetching(false);
      }
    }

    loadTemplateDetails(templateId);
  }, [isEditMode, templateId, router]);

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({ title: true, passingScore: true });

    if (!title) return;
    if (type === 'QUIZ' && passingScore !== '' && (passingScore < 0 || passingScore > 100)) return;

    try {
      setIsLoading(true);
      setEmotion('thinking');

      const payload = {
        title,
        type,
        duration_minutes: Number(durationMinutes),
        passing_score: type === 'SURVEY' || passingScore === '' ? null : Number(passingScore),
      };

      if (isEditMode && templateId) {
        const response = await updateAssessmentTemplate(templateId, payload);
        if (response.success) {
          setEmotion('celebrating');
          speak('Success! Assessment template details updated.', 3000);
          router.push(`/admin/assessment-templates/${templateId}/builder`);
        }
      } else {
        const response = await createAssessmentTemplate(payload);
        if (response.success && response.data) {
          setEmotion('celebrating');
          speak('Success! Template created. Now, let\'s add assessment questions.', 4000);
          router.push(`/admin/assessment-templates/${response.data._id}/builder`);
        }
      }
    } catch (err: any) {
      console.error('Failed to save assessment template', err);
      const msg = err.response?.data?.message || 'Failed to save assessment template.';
      speak(`Error! ${msg}`, 4000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlur = (field: 'title' | 'passingScore') => {
    setTouched({ ...touched, [field]: true });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl">
      
      {/* Page Header */}
      <div className="page-header select-none">
        <div className="header-content">
          <div className="page-label-wrap">
            <span className="page-label-root">Templates</span>
            <span className="page-label-sep">›</span>
            <span 
              className="page-label-root cursor-pointer hover:underline" 
              onClick={() => router.push('/admin/assessment-templates')}
            >
              Assessment Templates
            </span>
            <span className="page-label-sep">›</span>
            <span className="page-label-current">{isEditMode ? 'Edit' : 'Create'}</span>
          </div>
          <h1 className="page-title">{isEditMode ? 'Edit Template Settings' : 'Create New Template'}</h1>
          <p className="page-subtitle text-slate-400">
            Set up the basic rules and configuration for your assessment.
          </p>
        </div>
        
        <button 
          type="button" 
          onClick={() => router.push('/admin/assessment-templates')}
          className="action-btn back-btn"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to List
        </button>
      </div>

      {/* Form Card Container */}
      <div className="glass-card form-container">
        
        {/* Processing Spinner Overlay */}
        {(isFetching || isLoading) && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p className="text-sm font-semibold tracking-wide text-indigo-300">
              {isFetching ? 'Loading details...' : 'Processing configurations...'}
            </p>
          </div>
        )}

        {!isFetching && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-grid">
              
              {/* Input 1: Title */}
              <div className="glass-form-group col-span-2 md:col-span-1">
                <label className="glass-label">Template Title <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => handleBlur('title')}
                  placeholder="e.g., Module 1 Basics Quiz"
                  className="glass-input" 
                  autoComplete="off"
                  spellCheck="false"
                />
                {touched.title && !title && (
                  <span className="error-text">Title is required.</span>
                )}
              </div>

              {/* Input 2: Type */}
              <div className="glass-form-group">
                <label className="glass-label">Assessment Type <span className="text-red-500">*</span></label>
                <select 
                  value={type}
                  onChange={(e) => setType(e.target.value as 'QUIZ' | 'SURVEY')}
                  className="glass-select"
                >
                  <option value="QUIZ">Quiz (Graded)</option>
                  <option value="SURVEY">Survey (Ungraded)</option>
                </select>
              </div>

            </div>

            <div className="form-grid pt-2">
              
              {/* Input 3: Duration */}
              <div className="glass-form-group">
                <label className="glass-label">Duration (Minutes)</label>
                <input 
                  type="number" 
                  min={0}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Math.max(0, Number(e.target.value)))}
                  className="glass-input" 
                />
                <span className="helper-text select-none">
                  Leave as 0 for unlimited time.
                </span>
              </div>

              {/* Input 4: Passing Score */}
              <div className="glass-form-group">
                <label className="glass-label">Passing Score (%)</label>
                <input 
                  type="number" 
                  min={0}
                  max={100}
                  value={passingScore}
                  onChange={(e) => setPassingScore(e.target.value === '' ? '' : Math.max(0, Math.min(100, Number(e.target.value))))}
                  onBlur={() => handleBlur('passingScore')}
                  disabled={type === 'SURVEY'}
                  className="glass-input disabled:opacity-50 disabled:cursor-not-allowed" 
                  placeholder={type === 'SURVEY' ? 'N/A' : 'e.g. 70'}
                />
                {touched.passingScore && type === 'QUIZ' && passingScore !== '' && (passingScore < 0 || passingScore > 100) && (
                  <span className="error-text">Score must be between 0 and 100.</span>
                )}
                {type === 'SURVEY' && (
                  <span className="helper-text select-none text-slate-400">
                    Surveys do not have a passing score.
                  </span>
                )}
              </div>

            </div>

            <hr className="form-divider border-slate-800/40 my-6" />

            {/* Form Actions */}
            <div className="form-actions select-none">
              <button 
                type="submit" 
                disabled={isLoading}
                className="btn-primary submit-btn"
              >
                <span>Save & Continue to Questions</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </div>

          </form>
        )}
      </div>

    </div>
  );
}

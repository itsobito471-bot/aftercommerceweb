'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createKycField, updateKycField, getKycFieldById } from '@/services/adminApi';
import { useCharacterStore } from '@/store/characterStore';

/**
 * KYC Field Form page
 * Creates or updates a custom student onboarding questionnaire field configuration
 */
export default function KycFieldFormPage({ params }: { params: { id?: string[] } }) {
  const router = useRouter();
  const fieldId = params.id && params.id[0];
  const isEditMode = !!fieldId;

  // Form states
  const [label, setLabel] = useState('');
  const [inputType, setInputType] = useState('TEXT');
  const [orderIndex, setOrderIndex] = useState(1);
  const [isRequired, setIsRequired] = useState(true);
  const [optionsText, setOptionsText] = useState('');
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);

  // Mascot Zustand Store hooks
  const { setEmotion, speak } = useCharacterStore();

  useEffect(() => {
    if (!isEditMode || !fieldId) return;

    async function loadFieldDetails(id: string) {
      try {
        setIsLoading(true);
        const response = await getKycFieldById(id);
        if (response.success && response.data) {
          const field = response.data;
          setLabel(field.label);
          setInputType(field.input_type);
          setOrderIndex(field.order_index);
          setIsRequired(field.is_required);
          setOptionsText(field.options ? field.options.join(', ') : '');
        }
      } catch (err) {
        console.error('Failed to load field details', err);
        speak('Error! Failed to retrieve field details.', 4000);
        router.push('/admin/kyc');
      } finally {
        setIsLoading(false);
      }
    }

    loadFieldDetails(fieldId);
  }, [isEditMode, fieldId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label) {
      speak('Warning! Question Label is required.', 3000);
      return;
    }

    try {
      setIsLoading(true);
      setEmotion('thinking');

      let optionsArray: string[] = [];
      if (inputType === 'DROPDOWN' && optionsText) {
        optionsArray = optionsText
          .split(',')
          .map((opt) => opt.trim())
          .filter((opt) => opt.length > 0);
      }

      const payload = {
        label,
        input_type: inputType,
        order_index: orderIndex,
        is_required: isRequired,
        options: optionsArray,
      };

      if (isEditMode && fieldId) {
        const response = await updateKycField(fieldId, payload);
        if (response.success) {
          setEmotion('celebrating');
          speak('Success! Onboarding field updated successfully.', 4000);
          router.push('/admin/kyc');
        }
      } else {
        const response = await createKycField(payload);
        if (response.success) {
          setEmotion('celebrating');
          speak('Success! Custom onboarding field created successfully.', 4000);
          router.push('/admin/kyc');
        }
      }
    } catch (err: any) {
      console.error('Failed to save KYC field', err);
      const msg = err.response?.data?.message || 'Failed to submit onboarding field parameters.';
      speak(`Error! ${msg}`, 4000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl">
      
      {/* Page Header */}
      <div className="page-header select-none flex justify-between items-center">
        <div className="header-content">
          <h1 className="page-title text-[var(--color-text-primary)] font-bold tracking-tight">
            {isEditMode ? 'Edit Custom Field' : 'Create Custom Field'}
          </h1>
          <p className="page-subtitle text-slate-500 dark:text-slate-400 mt-1">
            Configure the specific inputs for your student onboarding.
          </p>
        </div>
        
        <button 
          type="button" 
          onClick={() => router.push('/admin/kyc')}
          className="flex items-center gap-2 border border-[var(--glass-border)] bg-[var(--color-bg-surface)] px-4 py-2 text-xs font-bold text-[var(--color-text-primary)] rounded-lg shadow-sm hover:bg-[var(--glass-bg-hover)] transition-all select-none active:scale-98"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Preview
        </button>
      </div>

      {/* Form Card Container */}
      <div className="bg-[var(--color-bg-surface)] border border-[var(--glass-border)] rounded-xl shadow-lg p-8 form-container animate-card-enter max-w-2xl relative">
        
        {/* Processing Spinner Overlay */}
        {isLoading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p className="text-sm font-semibold tracking-wide text-indigo-300 animate-pulse">Saving details...</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Label Input */}
          <div className="glass-form-group">
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              QUESTION / LABEL
            </label>
            <input 
              type="text" 
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., Upload Government ID"
              className="w-full px-4 py-3 bg-[var(--color-bg-surface)] border border-[var(--glass-border)] rounded-lg text-[var(--color-text-primary)] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all text-sm font-medium" 
              required
            />
          </div>

          <div className="form-grid">
            
            {/* Input Type Selector */}
            <div className="glass-form-group">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                INPUT TYPE
              </label>
              <div className="relative">
                <select 
                  value={inputType}
                  onChange={(e) => setInputType(e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--color-bg-surface)] border border-[var(--glass-border)] rounded-lg text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all text-sm font-medium appearance-none cursor-pointer"
                >
                  <option value="TEXT">Short Text</option>
                  <option value="TEXTAREA">Long Paragraph</option>
                  <option value="NUMBER">Number / Phone</option>
                  <option value="DATE">Date Picker</option>
                  <option value="FILE">Document Upload (PDF/Image)</option>
                  <option value="DROPDOWN">Dropdown Menu</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Display Order Index */}
            <div className="glass-form-group">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                DISPLAY ORDER
              </label>
              <input 
                type="number" 
                value={orderIndex}
                onChange={(e) => setOrderIndex(parseInt(e.target.value) || 1)}
                placeholder="1"
                min={1}
                className="w-full px-4 py-3 bg-[var(--color-bg-surface)] border border-[var(--glass-border)] rounded-lg text-[var(--color-text-primary)] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all text-sm font-medium" 
                required
              />
            </div>

          </div>

          {/* Options Textarea (visible only if input_type === 'DROPDOWN') */}
          {inputType === 'DROPDOWN' && (
            <div className="glass-form-group animate-fade-in">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Dropdown Options (Comma separated)
              </label>
              <textarea 
                value={optionsText}
                onChange={(e) => setOptionsText(e.target.value)}
                rows={3}
                placeholder="e.g. Undergrad, Postgrad, Working Professional"
                className="w-full px-4 py-3 bg-[var(--color-bg-surface)] border border-[var(--glass-border)] rounded-lg text-[var(--color-text-primary)] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all text-sm font-medium"
              />
              <small className="helper-text select-none">Separate each option with a comma.</small>
            </div>
          )}

          {/* Mandatory Checkbox */}
          <div className="flex items-center gap-3 pt-2 select-none">
            <input 
              type="checkbox" 
              checked={isRequired}
              onChange={(e) => setIsRequired(e.target.checked)}
              id="isRequiredCheck" 
              className="h-5 w-5 cursor-pointer rounded border-slate-300 dark:border-slate-700 text-[#1E3494] focus:ring-[#1E3494] transition-colors"
            />
            <label htmlFor="isRequiredCheck" className="text-sm font-bold text-[var(--color-text-primary)] cursor-pointer">
              Mandatory Field (Students cannot skip this)
            </label>
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-slate-200 dark:border-slate-700/60 my-6"></div>

          {/* Submit Button */}
          <div className="flex justify-end select-none">
            <button 
              type="submit" 
              disabled={isLoading}
              className="btn-primary flex items-center justify-center gap-2 px-6 py-2.5"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              <span>Save Field</span>
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}

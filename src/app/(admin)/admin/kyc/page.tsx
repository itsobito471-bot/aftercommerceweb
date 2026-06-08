'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getKycFields, updateKycField } from '@/services/adminApi';
import { useCharacterStore } from '@/store/characterStore';

interface KycField {
  _id: string;
  label: string;
  input_type: string;
  options: string[];
  is_required: boolean;
  order_index: number;
  is_active: boolean;
}

export default function KycPreviewPage() {
  const router = useRouter();
  const [fields, setFields] = useState<KycField[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [pendingOrderFields, setPendingOrderFields] = useState<KycField[] | null>(null);

  // Mascot Zustand Store hooks
  const { setEmotion, speak } = useCharacterStore();

  const fetchFields = async () => {
    try {
      setIsLoading(true);
      const response = await getKycFields();
      if (response.success && response.data) {
        // Ensure sorted by order_index initially
        const sorted = response.data.sort((a: any, b: any) => a.order_index - b.order_index);
        setFields(sorted);
      }
    } catch (err) {
      console.error('Failed to load KYC fields', err);
      speak('Error! Failed to retrieve onboarding fields.', 4000);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFields();
  }, []);

  const toggleStatus = async (field: KycField) => {
    try {
      const newStatus = !field.is_active;
      const response = await updateKycField(field._id, { is_active: newStatus });
      if (response.success) {
        setFields(fields.map((f) => f._id === field._id ? { ...f, is_active: newStatus } : f));
        setEmotion('celebrating');
        speak(`Field "${field.label}" is now ${newStatus ? 'visible' : 'hidden'} to students.`, 4000);
      }
    } catch (err) {
      console.error('Failed to toggle field status', err);
      speak('Error! Failed to update field status.', 4000);
    }
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === fields.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const reordered = [...fields];
    
    // Swap items
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;
    
    setFields(reordered);
    setPendingOrderFields(reordered);
  };

  const saveNewOrder = async () => {
    if (!pendingOrderFields) return;
    try {
      setIsSavingOrder(true);
      setEmotion('thinking');

      // Recalculate order indices (1-indexed)
      const updatedFields = pendingOrderFields.map((f, i) => ({
        ...f,
        order_index: i + 1
      }));

      // Fire parallel updates
      await Promise.all(
        updatedFields.map((field) => 
          updateKycField(field._id, { order_index: field.order_index })
        )
      );

      setFields(updatedFields);
      setPendingOrderFields(null);
      setEmotion('celebrating');
      speak('Success! Onboarding layout reordered successfully.', 4000);
    } catch (err) {
      console.error('Failed to save display order', err);
      speak('Error! Failed to save field order positions.', 4000);
      fetchFields(); // Revert visual state
    } finally {
      setIsSavingOrder(false);
    }
  };

  const cancelReorder = () => {
    setPendingOrderFields(null);
    fetchFields();
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl">
      
      {/* Page Header */}
      <div className="page-header animate-header select-none">
        <div className="header-content">
          <h1 className="page-title">Onboarding Form Preview</h1>
          <p className="page-subtitle text-slate-400">Drag and drop questions to reorder your student onboarding flow.</p>
        </div>

        <button 
          onClick={() => router.push('/admin/kyc/kyc-form')}
          className="btn-primary"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Add New Field</span>
        </button>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Floating Reorder Actions Bar */}
        {pendingOrderFields && (
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-4 flex items-center justify-between animate-fade-in select-none">
            <div className="text-sm text-indigo-300">
              <strong>Unsaved Changes!</strong> You adjusted the display order of the questions.
            </div>
            <div className="flex gap-3">
              <button 
                onClick={cancelReorder}
                disabled={isSavingOrder}
                className="rounded-lg border border-slate-800 bg-slate-950/40 px-4 py-2 text-xs font-semibold hover:bg-slate-800/60 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={saveNewOrder}
                disabled={isSavingOrder}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-emerald-600/25 hover:bg-emerald-700 active:scale-98 transition-all disabled:opacity-50"
              >
                {isSavingOrder ? 'Saving...' : 'Save Layout Order'}
              </button>
            </div>
          </div>
        )}

        {/* Loading Spinner overlay */}
        {(isLoading || isSavingOrder) && (
          <div className="flex flex-col items-center justify-center py-20 glass-card">
            <div className="spinner mb-4"></div>
            <p className="text-sm font-semibold tracking-wide text-indigo-300 animate-pulse">
              {isSavingOrder ? 'Saving layout order...' : 'Loading onboarding details...'}
            </p>
          </div>
        )}

        {!isLoading && !isSavingOrder && (
          <div className="space-y-6">
            
            {/* Card 1: Student KYC Setup Card (with 6px top blue border) */}
            <div className="glass-card !p-6 border-t-[6px] border-[#1E3494] rounded-xl shadow-lg animate-card-enter select-none">
              <h3 className="text-lg font-bold text-[var(--color-text-primary)]">Student KYC Setup</h3>
              <p className="text-xs text-[var(--color-text-muted)] mt-1.5">
                Please complete your profile to access the course catalog.
              </p>
            </div>

            {fields.length === 0 ? (
              <div className="py-16 text-center text-slate-500 select-none glass-card">
                No onboarding questions created yet. Click Add New Field to start.
              </div>
            ) : (
              <div className="space-y-5">
                {fields.map((field, index) => {
                  const isFirst = index === 0;
                  return (
                    <div 
                      key={field._id}
                      className={`glass-card !p-6 border-l-[6px] rounded-xl shadow-md transition-all relative flex flex-col ${
                        !field.is_active 
                          ? 'border-l-slate-600 opacity-60' 
                          : isFirst 
                          ? 'border-l-[#1E3494]' 
                          : 'border-l-slate-400'
                      }`}
                    >
                      
                      {/* Header Row: Label & Actions */}
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-[var(--color-text-primary)] select-none">
                          {field.label}
                          {field.is_required && <span className="text-red-500 ml-1 font-bold">*</span>}
                          {!field.is_active && <span className="text-xs text-slate-500 font-semibold ml-2 select-none">(Hidden)</span>}
                        </label>

                        {/* Header Actions */}
                        <div className="flex items-center gap-4 text-xs font-bold text-[var(--color-text-muted)] select-none">
                          <span>#{index + 1}</span>
                          
                          {/* Edit pencil icon */}
                          <button 
                            onClick={() => router.push(`/admin/kyc/kyc-form/${field._id}`)}
                            className="text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors p-1"
                            title="Edit Field"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                            </svg>
                          </button>

                          {/* Toggle show/hide eye icon */}
                          <button 
                            onClick={() => toggleStatus(field)}
                            className="text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors p-1"
                            title={field.is_active ? 'Hide Field' : 'Show Field'}
                          >
                            {field.is_active ? (
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                              </svg>
                            ) : (
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                <line x1="1" y1="1" x2="23" y2="23"></line>
                              </svg>
                            )}
                          </button>

                          {/* Up / Down Reorder buttons */}
                          <div className="flex items-center gap-1 border-l border-slate-700/20 pl-3">
                            <button 
                              type="button"
                              onClick={() => moveField(index, 'up')}
                              disabled={index === 0}
                              className="p-1 text-slate-400 hover:text-[var(--color-accent)] disabled:opacity-30 disabled:hover:text-slate-400"
                              title="Move Up"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="18 15 12 9 6 15"></polyline>
                              </svg>
                            </button>
                            <button 
                              type="button"
                              onClick={() => moveField(index, 'down')}
                              disabled={index === fields.length - 1}
                              className="p-1 text-slate-400 hover:text-[var(--color-accent)] disabled:opacity-30 disabled:hover:text-slate-400"
                              title="Move Down"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="6 9 12 15 18 9"></polyline>
                              </svg>
                            </button>
                          </div>

                        </div>
                      </div>

                      {/* Bottom Row: Indented input with optional drag handle */}
                      <div className="flex items-center gap-3 mt-4">
                        {!isFirst && (
                          <div className="flex flex-col gap-1 text-slate-400/80 mr-2 shrink-0 select-none">
                            <div className="flex gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400/60"></span>
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400/60"></span>
                            </div>
                            <div className="flex gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400/60"></span>
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400/60"></span>
                            </div>
                            <div className="flex gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400/60"></span>
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400/60"></span>
                            </div>
                          </div>
                        )}
                        
                        {/* Input elements based on field types */}
                        <div className="flex-1 opacity-45 pointer-events-none select-none">
                          {(field.input_type === 'TEXT' || field.input_type === 'NUMBER') && (
                            <input type="text" disabled className="glass-input text-xs" placeholder="Short answer text..." />
                          )}
                          {field.input_type === 'TEXTAREA' && (
                            <textarea disabled rows={2} className="glass-input text-xs" placeholder="Long answer paragraph..." />
                          )}
                          {field.input_type === 'DROPDOWN' && (
                            <select disabled className="glass-select text-xs">
                              <option>Select an option...</option>
                              {field.options && field.options.map((opt) => (
                                <option key={opt}>{opt}</option>
                              ))}
                            </select>
                          )}
                          {field.input_type === 'DATE' && (
                            <div className="glass-input text-xs flex justify-between items-center bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg px-4 py-2.5">
                              <span>dd/mm/yyyy</span>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                              </svg>
                            </div>
                          )}
                          {field.input_type === 'FILE' && (
                            <div className="glass-input text-xs flex items-center justify-center gap-2 border-dashed border-slate-700 bg-slate-950/10">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                              </svg>
                              <span>Upload Document / Attachment (PDF/Image)</span>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}
      </div>

    </div>
  );
}

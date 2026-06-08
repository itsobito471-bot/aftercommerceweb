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
  description?: string;
}

export default function KycPreviewPage() {
  const router = useRouter();
  const [fields, setFields] = useState<KycField[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [pendingOrderFields, setPendingOrderFields] = useState<KycField[] | null>(null);

  // Mascot Zustand Store hooks
  const { setEmotion, speak } = useCharacterStore();

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dragReady, setDragReady] = useState(false);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    setDragReady(false);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const reordered = [...fields];
    const draggedItem = reordered[draggedIndex];
    
    reordered.splice(draggedIndex, 1);
    reordered.splice(index, 0, draggedItem);
    
    const updated = reordered.map((f, i) => ({ ...f, order_index: i + 1 }));
    
    setFields(updated);
    setPendingOrderFields(updated);
    setDraggedIndex(null);
    setDragOverIndex(null);
    setDragReady(false);
  };

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

      {/* Floating Reorder Actions Bar */}
      {pendingOrderFields && (
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-4 flex items-center justify-between animate-fade-in select-none max-w-[700px] mx-auto mb-6">
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

      {/* Form Preview Envelope */}
      <div className="form-preview-envelope animate-card-enter">
        
        {/* Loading Spinner overlay */}
        {(isLoading || isSavingOrder) && (
          <div className="loading-overlay" style={{ borderRadius: '12px' }}>
            <div className="spinner"></div>
            {isSavingOrder && (
              <p style={{ marginTop: '10px', fontWeight: 600 }}>Saving Order...</p>
            )}
          </div>
        )}

        {/* Form Preview Header Card */}
        <div className="form-preview-header select-none">
          <h3 className="preview-title">Student KYC Setup</h3>
          <p className="preview-subtitle">
            Please complete your profile to access the course catalog.
          </p>
        </div>

        {/* Empty state card */}
        {!isLoading && fields.length === 0 && (
          <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: 'var(--color-text-muted)' }}>No fields created yet.</p>
          </div>
        )}

        {/* Dynamic Fields List */}
        {!isLoading && fields.length > 0 && (
          <div className={draggedIndex !== null ? 'cdk-drop-list-dragging' : ''}>
            {fields.map((field, index) => {
              const isPlaceholding = dragOverIndex === index && draggedIndex !== index;
              return (
                <div 
                  key={field._id}
                  draggable={dragReady}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`preview-field-card ${
                    !field.is_active ? 'inactive-field' : ''
                  } ${
                    draggedIndex === index ? 'opacity-40 scale-[0.98]' : ''
                  } ${
                    isPlaceholding ? 'cdk-drag-placeholder' : ''
                  }`}
                >
                  
                  {/* Drag Handle Grip Grip (Hidden by default, shown on card hover) */}
                  <div 
                    className="drag-handle-grip select-none" 
                    title="Drag to reorder"
                    onMouseDown={() => setDragReady(true)}
                    onMouseUp={() => setDragReady(false)}
                    onTouchStart={() => setDragReady(true)}
                    onTouchEnd={() => setDragReady(false)}
                  >
                    <svg width="12" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="9" cy="5" r="1.5" />
                      <circle cx="9" cy="12" r="1.5" />
                      <circle cx="9" cy="19" r="1.5" />
                      <circle cx="15" cy="5" r="1.5" />
                      <circle cx="15" cy="12" r="1.5" />
                      <circle cx="15" cy="19" r="1.5" />
                    </svg>
                  </div>

                  {/* Card Header Flex */}
                  <div className="card-header-flex">
                    <label className="field-preview-label select-none flex items-center">
                      {field.label}
                      {field.is_required && <span className="required-asterisk font-bold">*</span>}
                      {!field.is_active && <span className="inactive-tag">(Hidden)</span>}
                    </label>

                    {/* Action Pill */}
                    <div className="action-pill select-none">
                      <span className="order-text">#{field.order_index}</span>
                      
                      {/* Edit icon button */}
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/admin/kyc/kyc-form/${field._id}`);
                        }}
                        className="icon-btn cursor-pointer"
                        title="Edit Field"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>

                      {/* Toggle status icon button */}
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStatus(field);
                        }}
                        className={`icon-btn cursor-pointer ${!field.is_active ? 'active-icon' : ''}`}
                        title={field.is_active ? 'Hide Field' : 'Show Field'}
                      >
                        {field.is_active ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.5 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                            <line x1="1" y1="1" x2="23" y2="23"></line>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Optional Field Description */}
                  {field.description && (
                    <p className="field-preview-desc select-none">
                      {field.description}
                    </p>
                  )}

                  {/* Faux Inputs wrapper */}
                  <div className="fake-input-wrapper">
                    {(field.input_type === 'TEXT' || field.input_type === 'NUMBER') && (
                      <input type="text" disabled className="faux-input" placeholder="Short answer text..." />
                    )}
                    {field.input_type === 'TEXTAREA' && (
                      <textarea disabled rows={3} className="faux-input" placeholder="Long answer text..." />
                    )}
                    {field.input_type === 'DROPDOWN' && (
                      <select disabled className="faux-input">
                        <option value="" disabled selected>Select an option...</option>
                        {field.options && field.options.map((opt) => (
                          <option key={opt}>{opt}</option>
                        ))}
                      </select>
                    )}
                    {field.input_type === 'DATE' && (
                      <div className="faux-input faux-flex">
                        <span>dd/mm/yyyy</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                      </div>
                    )}
                    {field.input_type === 'FILE' && (
                      <div className="faux-input faux-file gap-2">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="17 8 12 3 7 8"></polyline>
                          <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                        <span>Upload Document / Image</span>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

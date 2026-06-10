import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  title = 'Are you sure?',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'warning',
  isLoading = false,
}: ConfirmModalProps) {
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent scrolling on body when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  // Type specific styles
  let iconColor = 'text-yellow-500';
  let iconBg = 'bg-yellow-500/10';
  let confirmBtnClass = 'bg-yellow-600 hover:bg-yellow-500 text-white shadow-[0_0_15px_rgba(202,138,4,0.3)] border-yellow-500/50';
  let iconSvg = (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );

  if (type === 'danger') {
    iconColor = 'text-red-500';
    iconBg = 'bg-red-500/10';
    confirmBtnClass = 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)] border-red-500/50';
    iconSvg = (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    );
  } else if (type === 'info') {
    iconColor = 'text-blue-500';
    iconBg = 'bg-blue-500/10';
    confirmBtnClass = 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] border-blue-500/50';
    iconSvg = (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => !isLoading && onCancel()}
        aria-hidden="true"
      ></div>

      {/* Modal Content */}
      <div 
        className="relative bg-[var(--color-bg-surface)] border border-[var(--glass-border)] shadow-2xl rounded-2xl w-full max-w-md overflow-hidden animate-fade-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`shrink-0 flex items-center justify-center w-12 h-12 rounded-full ${iconBg} ${iconColor}`}>
              {iconSvg}
            </div>
            <div className="pt-1">
              <h3 className="text-lg font-bold text-[var(--color-text-primary)] tracking-tight" id="modal-title">
                {title}
              </h3>
              <p className="mt-2 text-sm text-[var(--color-text-muted)] leading-relaxed">
                {message}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-[var(--color-bg-base)] border-t border-[var(--glass-border)] flex items-center justify-end gap-3 opacity-90">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] bg-transparent hover:bg-black/5 dark:hover:bg-white/5 border border-[var(--glass-border)] rounded-lg transition-colors disabled:opacity-50"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium border rounded-lg transition-all disabled:opacity-50 flex items-center justify-center min-w-[90px] ${confirmBtnClass}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

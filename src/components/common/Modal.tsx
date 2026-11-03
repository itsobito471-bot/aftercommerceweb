'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';

export type ModalType = 'success' | 'info' | 'warning' | 'error' | 'default';

export interface ModalAction {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  isLoading?: boolean;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  type?: ModalType;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  primaryAction?: ModalAction;
  secondaryAction?: ModalAction;
  showCloseButton?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  type = 'success',
  icon,
  children,
  primaryAction,
  secondaryAction,
  showCloseButton = true,
  maxWidth = 'md',
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent scroll when modal is active
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

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  // Type-specific icon and accent styles
  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          iconBg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
          defaultIcon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ),
          accentBorder: 'border-emerald-500/30'
        };
      case 'warning':
        return {
          iconBg: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
          defaultIcon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
          accentBorder: 'border-amber-500/30'
        };
      case 'error':
        return {
          iconBg: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
          defaultIcon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ),
          accentBorder: 'border-rose-500/30'
        };
      case 'info':
        return {
          iconBg: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
          defaultIcon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          accentBorder: 'border-blue-500/30'
        };
      default:
        return {
          iconBg: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
          defaultIcon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          ),
          accentBorder: 'border-indigo-500/30'
        };
    }
  };

  const { iconBg, defaultIcon } = getTypeConfig();

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  }[maxWidth];

  const renderActionButton = (action: ModalAction, isPrimary: boolean) => {
    const baseClass = "px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer";
    let styleClass = "";

    if (action.variant === 'danger') {
      styleClass = "bg-rose-600 hover:bg-rose-500 text-white shadow-md hover:shadow-lg active:scale-95";
    } else if (action.variant === 'secondary') {
      styleClass = "bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[var(--color-text-primary)] border border-[var(--glass-border)] active:scale-95";
    } else if (action.variant === 'ghost') {
      styleClass = "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5";
    } else {
      // primary
      styleClass = "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_4px_16px_rgba(79,70,229,0.30)] hover:shadow-[0_6px_22px_rgba(79,70,229,0.40)] active:scale-95";
    }

    if (action.href) {
      return (
        <Link 
          href={action.href}
          onClick={() => {
            if (action.onClick) action.onClick();
            onClose();
          }}
          className={`${baseClass} ${styleClass}`}
        >
          {action.label}
        </Link>
      );
    }

    return (
      <button
        type="button"
        onClick={() => {
          if (action.onClick) action.onClick();
        }}
        disabled={action.isLoading}
        className={`${baseClass} ${styleClass} disabled:opacity-50`}
      >
        {action.isLoading && (
          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        )}
        <span>{action.label}</span>
      </button>
    );
  };

  const modalBody = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Liquid Glass Backdrop with smooth blur */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div 
        className={`relative w-full ${maxWidthClasses} rounded-3xl p-6 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.25)] border transition-all duration-300 overflow-hidden z-10 animate-scale-in`}
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          borderColor: 'var(--glass-border)',
          color: 'var(--color-text-primary)'
        }}
        role="dialog"
        aria-modal="true"
      >
        {/* Subtle Ambient Glows inside card */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full filter blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-emerald-500/10 rounded-full filter blur-2xl pointer-events-none" />

        {/* Top bar with icon and close button */}
        <div className="flex items-start justify-between gap-4 mb-4 relative z-10">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm shrink-0 ${iconBg}`}>
            {icon || defaultIcon}
          </div>

          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Title & Description */}
        <div className="relative z-10 mb-4">
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            {title}
          </h2>
          {description && (
            <p className="mt-1.5 text-xs sm:text-sm opacity-70 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Optional Custom Content or Summary Chips */}
        {children && (
          <div className="relative z-10 my-4">
            {children}
          </div>
        )}

        {/* Actions Footer */}
        {(primaryAction || secondaryAction) && (
          <div className="relative z-10 mt-6 pt-4 border-t flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5" style={{ borderColor: 'var(--glass-border)' }}>
            {secondaryAction && renderActionButton(secondaryAction, false)}
            {primaryAction && renderActionButton(primaryAction, true)}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalBody, document.body);
};

export default Modal;

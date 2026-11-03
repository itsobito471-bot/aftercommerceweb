'use client';

import React, { useEffect, useRef, useState } from 'react';
import 'quill/dist/quill.snow.css';

interface QuillEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export const QuillEditor: React.FC<QuillEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write a comprehensive course description, syllabus breakdown, prerequisites, and learning objectives...',
  minHeight = '220px'
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillInstanceRef = useRef<any>(null);
  const isInternalChangeRef = useRef(false);
  const valueRef = useRef(value);
  valueRef.current = value;
  const [showHtmlSource, setShowHtmlSource] = useState(false);
  const [localSource, setLocalSource] = useState(value || '');

  // Synchronize localSource when external value changes while NOT in HTML mode
  useEffect(() => {
    if (!showHtmlSource) {
      setLocalSource(value || '');
    }
  }, [value, showHtmlSource]);

  // Helper to safely set contents in Quill
  const setQuillContent = (quill: any, html: string) => {
    if (!quill) return;
    const cleanHtml = (html || '').trim();
    if (!cleanHtml || cleanHtml === '<p><br></p>' || cleanHtml === '<br>') {
      quill.setText('');
    } else {
      try {
        if (quill.clipboard && typeof quill.clipboard.dangerouslyPasteHTML === 'function') {
          quill.clipboard.dangerouslyPasteHTML(cleanHtml);
        } else {
          quill.root.innerHTML = cleanHtml;
        }
      } catch {
        quill.root.innerHTML = cleanHtml;
      }
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initQuill = async () => {
      if (typeof window === 'undefined' || !editorRef.current || quillInstanceRef.current) {
        return;
      }

      try {
        const QuillModule = await import('quill');
        const Quill = QuillModule.default || QuillModule;

        if (!isMounted || !editorRef.current || quillInstanceRef.current) return;

        const quill = new Quill(editorRef.current, {
          theme: 'snow',
          placeholder,
          modules: {
            toolbar: [
              [{ header: [1, 2, 3, 4, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ color: [] }, { background: [] }],
              [{ list: 'ordered' }, { list: 'bullet' }],
              [{ align: [] }],
              ['blockquote', 'code-block'],
              ['link', 'image'],
              ['clean']
            ]
          }
        });

        quillInstanceRef.current = quill;

        // Set initial HTML value using latest valueRef
        const initialHtml = valueRef.current || '';
        if (initialHtml) {
          setQuillContent(quill, initialHtml);
        }

        // Listen for changes
        quill.on('text-change', () => {
          isInternalChangeRef.current = true;
          const html = quill.root.innerHTML;
          // Empty quill editor root contains `<p><br></p>` or `<br>`
          const sanitized = (html === '<p><br></p>' || html === '<br>') ? '' : html;
          onChange(sanitized);
          setTimeout(() => {
            isInternalChangeRef.current = false;
          }, 0);
        });
      } catch (err) {
        console.error('Failed to initialize Quill editor:', err);
      }
    };

    initQuill();

    return () => {
      isMounted = false;
    };
  }, []);

  // Update editor if value changes externally (e.g. form reset, async fetch, or after save)
  useEffect(() => {
    valueRef.current = value;
    if (quillInstanceRef.current && !isInternalChangeRef.current && !showHtmlSource) {
      const currentHtml = quillInstanceRef.current.root.innerHTML;
      const normalizedCurrent = (currentHtml === '<p><br></p>' || currentHtml === '<br>') ? '' : currentHtml;
      const normalizedValue = (value || '').trim();
      if (normalizedValue !== normalizedCurrent.trim()) {
        isInternalChangeRef.current = true;
        setQuillContent(quillInstanceRef.current, normalizedValue);
        setTimeout(() => {
          isInternalChangeRef.current = false;
        }, 50);
      }
    }
  }, [value, showHtmlSource]);

  // Robust handler to toggle between Visual Snow Editor and Raw HTML Source
  const toggleSourceMode = () => {
    if (showHtmlSource) {
      // Switching from HTML Source back to Visual Editor
      const contentToApply = localSource;
      onChange(contentToApply);
      if (quillInstanceRef.current) {
        isInternalChangeRef.current = true;
        setQuillContent(quillInstanceRef.current, contentToApply);
        setTimeout(() => {
          isInternalChangeRef.current = false;
          if (quillInstanceRef.current) {
            quillInstanceRef.current.update();
            quillInstanceRef.current.focus();
          }
        }, 50);
      }
      setShowHtmlSource(false);
    } else {
      // Switching from Visual Editor to HTML Source
      const currentHtml = quillInstanceRef.current?.root?.innerHTML || value || '';
      const cleanHtml = (currentHtml === '<p><br></p>' || currentHtml === '<br>') ? '' : currentHtml;
      setLocalSource(cleanHtml);
      setShowHtmlSource(true);
    }
  };

  return (
    <div className="quill-editor-wrapper flex flex-col rounded-xl overflow-hidden border transition-all" style={{ borderColor: 'var(--glass-border)', backgroundColor: 'var(--color-bg-elevated)' }}>
      {/* Top utility bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-3.5 py-1.5 border-b bg-black/[0.02] dark:bg-white/[0.02] text-xs" style={{ borderColor: 'var(--glass-border)' }}>
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
          <span className="font-mono text-[10px] uppercase font-bold tracking-wider opacity-70 truncate">
            Rich HTML Description Editor (Quill Snow)
          </span>
        </div>
        <button
          type="button"
          onClick={toggleSourceMode}
          className="px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-colors hover:bg-black/5 dark:hover:bg-white/5 whitespace-nowrap shrink-0 ml-auto flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
          style={{ borderColor: 'var(--glass-border)' }}
          title={showHtmlSource ? 'Return to Visual Rich-Text Editor' : 'Switch to Raw HTML Code Editor'}
        >
          {showHtmlSource ? (
            <>
              <span>Visual Editor</span>
              <span>✍️</span>
            </>
          ) : (
            <>
              <span>HTML Source</span>
              <span>💻</span>
            </>
          )}
        </button>
      </div>

      {/* Raw HTML Mode */}
      <textarea
        value={localSource}
        onChange={(e) => {
          setLocalSource(e.target.value);
          onChange(e.target.value);
        }}
        placeholder="<p>Enter raw HTML content directly...</p>"
        className={`w-full p-4 font-mono text-xs outline-none resize-y ${showHtmlSource ? 'block' : 'hidden'}`}
        style={{
          minHeight,
          backgroundColor: 'var(--color-bg-elevated)',
          color: 'var(--color-text-primary)'
        }}
      />

      {/* Visual Quill Snow Container */}
      <div 
        className={`quill-container relative ${showHtmlSource ? 'hidden' : 'block'}`} 
        style={{ minHeight }}
      >
        <div ref={editorRef} style={{ minHeight }} />
      </div>

      {/* Custom Theme overrides for Quill inside application styles */}
      <style jsx global>{`
        .quill-editor-wrapper .ql-toolbar.ql-snow {
          border: none !important;
          border-bottom: 1px solid var(--glass-border) !important;
          background: rgba(0, 0, 0, 0.02);
          border-radius: 0.75rem 0.75rem 0 0;
          padding: 8px 10px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 2px 4px;
        }
        .dark .quill-editor-wrapper .ql-toolbar.ql-snow {
          background: rgba(255, 255, 255, 0.02);
        }
        .quill-editor-wrapper .ql-container.ql-snow {
          border: none !important;
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif !important;
          font-size: 14px;
        }
        .quill-editor-wrapper .ql-editor {
          min-height: ${minHeight};
          padding: 16px;
          line-height: 1.6;
          color: var(--color-text-primary);
        }
        .quill-editor-wrapper .ql-editor.ql-blank::before {
          color: rgba(148, 163, 184, 0.7) !important;
          font-style: normal !important;
        }
        .dark .quill-editor-wrapper .ql-snow .ql-stroke {
          stroke: #cbd5e1 !important;
        }
        .dark .quill-editor-wrapper .ql-snow .ql-fill {
          fill: #cbd5e1 !important;
        }
        .dark .quill-editor-wrapper .ql-snow .ql-picker {
          color: #cbd5e1 !important;
        }
      `}</style>
    </div>
  );
};

"use client";

import React, { useState, useEffect } from 'react';
import { LearningUnit, LearningUnitType, VideoContentData } from '@/types/course';
import { useCharacterStore } from '@/store/useCharacterStore';
import { createLearningUnit, updateLearningUnit, uploadDocument } from '@/services/adminApi';
import { QuillEditor } from '@/components/common/QuillEditor';
import { Modal } from '@/components/common/Modal';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5001';

interface LearningUnitFormProps {
  moduleId: string | null;
  initialData?: Partial<LearningUnit>;
  availableUnits?: { id: string; title: string }[]; // Used for prerequisite dropdown
  onSave?: (data: Partial<LearningUnit>) => void;
}

/**
 * Resolves a stored relative path or full URL to a playable streaming URL
 * by prefixing BACKEND_URL when relative (e.g., /api/admin/documents/:id -> http://localhost:5001/api/admin/documents/:id)
 */
export const getFullVideoUrl = (pathOrUrl?: string): string => {
  if (!pathOrUrl) return '';
  let trimmed = pathOrUrl.trim();
  if (!trimmed) return '';
  // Clean up any accidental 'undefined' prefix
  if (trimmed.startsWith('undefined')) {
    trimmed = trimmed.replace(/^undefined/, '');
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${BACKEND_URL}${cleanPath}`;
};

/**
 * Normalizes any video path / URL to a migration-safe relative path
 * (e.g. extracts document ID and returns /api/admin/documents/:id)
 * Never hardcodes domain/port into MongoDB.
 */
export const toRelativeVideoPath = (urlOrPath?: string): string => {
  if (!urlOrPath) return '';
  let trimmed = urlOrPath.trim();
  if (trimmed.startsWith('undefined')) {
    trimmed = trimmed.replace(/^undefined/, '');
  }
  const match = trimmed.match(/([0-9a-fA-F]{24})/);
  if (match) {
    return `/api/admin/documents/${match[1]}`;
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const parsed = new URL(trimmed);
      return parsed.pathname;
    } catch {
      return trimmed;
    }
  }
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
};

export const LearningUnitForm: React.FC<LearningUnitFormProps> = ({ moduleId, initialData, availableUnits = [], onSave }) => {
  const triggerCharacter = useCharacterStore((state) => state.triggerCharacter);

  const [unitId, setUnitId] = useState<string>(initialData?.id || '');
  const [activeType, setActiveType] = useState<LearningUnitType>(initialData?.type || LearningUnitType.VIDEO);
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [prerequisiteId, setPrerequisiteId] = useState(initialData?.prerequisite_unit_id || '');
  
  // Video Source configuration: 'vdocipher' (DRM Protected) vs 'direct_upload' (Cloud Storage)
  const initialVData = initialData?.content_data as any;
  const initialSource = initialVData?.video_source_type || (initialVData?.direct_video_url ? 'direct_upload' : 'vdocipher');
  const [videoSourceType, setVideoSourceType] = useState<'vdocipher' | 'direct_upload'>(initialSource);
  const [vdoCipherId, setVdoCipherId] = useState(initialVData?.vdo_cipher_id || '');
  const [directVideoUrl, setDirectVideoUrl] = useState(initialVData?.direct_video_url ? getFullVideoUrl(initialVData.direct_video_url) : '');
  const [videoDocId, setVideoDocId] = useState(initialVData?.document_id || '');
  const [videoFileName, setVideoFileName] = useState(initialVData?.original_file_name || '');
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  // Notes state
  const [notesContent, setNotesContent] = useState((initialData?.content_data as any)?.rich_text_content || '');

  // Synchronize internal state when switching between different units in curriculum tree
  useEffect(() => {
    if (initialData) {
      setUnitId(initialData.id || '');
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setActiveType(initialData.type || LearningUnitType.VIDEO);
      setPrerequisiteId(initialData.prerequisite_unit_id || '');
      
      const vData = initialData.content_data as any;
      const detectedSource = vData?.video_source_type || (vData?.direct_video_url ? 'direct_upload' : 'vdocipher');
      setVideoSourceType(detectedSource);
      setVdoCipherId(vData?.vdo_cipher_id || '');
      setDirectVideoUrl(vData?.direct_video_url ? getFullVideoUrl(vData.direct_video_url) : '');
      setVideoDocId(vData?.document_id || '');
      setVideoFileName(vData?.original_file_name || '');
      setNotesContent(vData?.rich_text_content || '');
    }
  }, [
    initialData?.id, 
    initialData?.title, 
    initialData?.description,
    initialData?.type, 
    initialData?.prerequisite_unit_id, 
    (initialData?.content_data as any)?.vdo_cipher_id,
    (initialData?.content_data as any)?.direct_video_url,
    (initialData?.content_data as any)?.video_source_type,
    (initialData?.content_data as any)?.rich_text_content
  ]);

  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 500MB
    if (file.size > 500 * 1024 * 1024) {
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Video Too Large',
        description: 'File size exceeds 500MB. For large multi-hour recordings, please use VdoCipher DRM streaming.'
      });
      return;
    }

    setIsUploadingVideo(true);
    setUploadProgress(`Uploading ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)...`);

    try {
      const res = await uploadDocument(file);
      if (res.success && res.data) {
        const doc = res.data;
        const fullStreamUrl = `${BACKEND_URL}/api/admin/documents/${doc._id}`;
        setDirectVideoUrl(fullStreamUrl);
        setVideoDocId(doc._id || '');
        setVideoFileName(doc.original_name || file.name);
        setUploadProgress(null);
        triggerCharacter('celebrating', 'Video successfully uploaded and ready to stream!');
      } else {
        throw new Error('Upload response did not return valid file data.');
      }
    } catch (err: any) {
      console.error('Failed to upload video:', err);
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to upload video file.';
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Upload Failed',
        description: errMsg
      });
      setUploadProgress(null);
    } finally {
      setIsUploadingVideo(false);
      e.target.value = '';
    }
  };

  const handleTypeChange = (type: LearningUnitType) => {
    setActiveType(type);
    if (type === LearningUnitType.VIDEO) {
      triggerCharacter('thinking', 'Select between VdoCipher DRM protection or direct Cloud Video Upload.');
    } else if (type === LearningUnitType.NOTES) {
      triggerCharacter('helper', 'Use the rich Quill editor to break down complex topics, add headings, lists, and code blocks.');
    } else {
      triggerCharacter('celebrating', 'Interactive elements increase student engagement greatly!');
    }
  };

  const handlePrerequisiteFocus = () => {
    triggerCharacter('helper', 'Combine prerequisite locks with Drip days for total curriculum control.');
  };

  const [isLoading, setIsLoading] = useState(false);

  // Modal notification state for success and errors
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning';
    title: string;
    description: string;
    details?: string;
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!moduleId || moduleId.startsWith('mod-')) {
      setModalState({
        isOpen: true,
        type: 'warning',
        title: 'Save Parent Module First',
        description: 'Please save the parent Module to the database before adding and saving Learning Units under it.'
      });
      triggerCharacter('helper', 'Please save the parent Module first before adding Learning Units!');
      return;
    }

    if (!title.trim()) {
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Unit Title Required',
        description: 'Please provide a title for this learning unit.'
      });
      return;
    }

    if (activeType === LearningUnitType.VIDEO) {
      if (videoSourceType === 'vdocipher' && !vdoCipherId.trim()) {
        setModalState({
          isOpen: true,
          type: 'error',
          title: 'VdoCipher Video ID Required',
          description: 'Please provide a valid 32-character VdoCipher Video ID for DRM video streaming.'
        });
        return;
      }
      if (videoSourceType === 'direct_upload' && !directVideoUrl.trim()) {
        setModalState({
          isOpen: true,
          type: 'error',
          title: 'Direct Video Required',
          description: 'Please upload a video file or provide a direct cloud video URL before saving.'
        });
        return;
      }
    }

    setIsLoading(true);

    try {
      let contentPayload: any = {};
      if (activeType === LearningUnitType.VIDEO) {
        if (videoSourceType === 'vdocipher') {
          contentPayload = {
            video_source_type: 'vdocipher',
            vdo_cipher_id: vdoCipherId.trim()
          };
        } else {
          contentPayload = {
            video_source_type: 'direct_upload',
            direct_video_url: toRelativeVideoPath(directVideoUrl),
            document_id: videoDocId || undefined,
            original_file_name: videoFileName || undefined
          };
        }
      } else if (activeType === LearningUnitType.NOTES) {
        contentPayload = { rich_text_content: notesContent };
      } else {
        contentPayload = initialData?.content_data || {};
      }

      const payload: Partial<LearningUnit> = {
        title: title.trim(),
        description: description || '',
        type: activeType,
        prerequisite_unit_id: prerequisiteId || null,
        module_id: moduleId,
        content_data: contentPayload,
        order_index: initialData?.order_index || 0
      };

      let savedUnit;
      const effectiveId = unitId || initialData?.id;
      if (effectiveId && !effectiveId.startsWith('unit-')) {
        savedUnit = await updateLearningUnit(effectiveId, payload);
      } else {
        savedUnit = await createLearningUnit(payload);
      }

      const returnedUnit = (savedUnit?.data as any) || savedUnit;
      const returnedId = returnedUnit?._id || returnedUnit?.id || effectiveId || '';
      if (returnedId) {
        setUnitId(returnedId);
      }

      setModalState({
        isOpen: true,
        type: 'success',
        title: 'Learning Unit Saved Successfully!',
        description: `Unit "${title.trim()}" has been saved and patched to the module curriculum.`,
        details: activeType === LearningUnitType.VIDEO
          ? (videoSourceType === 'vdocipher'
              ? `VdoCipher DRM Video ID: ${vdoCipherId.trim()}`
              : `Cloud Storage Video: ${videoFileName || 'Direct MP4/WebM URL'}`)
          : activeType === LearningUnitType.NOTES
          ? `Lecture Notes: ${notesContent ? 'Rich HTML Content Stored' : 'Empty Draft'}`
          : `Unit Type: ${activeType}`
      });

      triggerCharacter('celebrating', 'Learning Unit successfully saved!');

      if (onSave) {
        onSave({
          ...payload,
          id: returnedId,
          content_data: returnedUnit?.content_data || contentPayload
        });
      }
    } catch (error: any) {
      console.error('Failed to save learning unit:', error);
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to save learning unit. Please check your connection and required inputs.';
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Failed to Save Learning Unit',
        description: errorMsg
      });
      triggerCharacter('helper', 'Failed to save learning unit. Check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all";
  const labelClass = "block text-sm font-semibold mb-1.5 opacity-90";

  return (
    <form onSubmit={handleSubmit} className="space-y-8" style={{ color: 'var(--color-text-primary)' }}>
      {/* 4-Tier Type Selector */}
      <div>
        <label className={labelClass}>Unit Type</label>
        <div className="flex flex-wrap gap-2 p-1 rounded-xl border bg-black/5 dark:bg-white/5" style={{ borderColor: 'var(--glass-border)' }}>
          {Object.values(LearningUnitType).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => handleTypeChange(type)}
              className={`flex-1 min-w-[120px] px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeType === type 
                  ? 'bg-[var(--color-bg-elevated)] shadow-sm border border-[var(--glass-border)] text-indigo-500' 
                  : 'opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>Unit Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            style={{ backgroundColor: 'var(--color-bg-elevated)', borderColor: 'var(--glass-border)' }}
            placeholder="e.g. Setting Up Your Environment"
            required
          />
        </div>

        <div>
          <label className={labelClass}>Progression Lock (Prerequisite)</label>
          <select
            value={prerequisiteId}
            onChange={(e) => setPrerequisiteId(e.target.value)}
            onFocus={handlePrerequisiteFocus}
            className={inputClass}
            style={{ backgroundColor: 'var(--color-bg-elevated)', borderColor: 'var(--glass-border)' }}
          >
            <option value="">-- None (Unlocked) --</option>
            {availableUnits.map(unit => (
              <option key={unit.id} value={unit.id}>{unit.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── UNIT DESCRIPTION (QUILL RICH TEXT EDITOR - OPTIONAL) ── */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <label className={labelClass}>Unit Description & Student Instructions</label>
            <span className="text-[10px] font-mono text-slate-400 font-normal">(Optional)</span>
          </div>
          <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 font-bold border border-indigo-500/20 whitespace-nowrap shrink-0 self-start sm:self-auto">
            Quill Rich HTML
          </span>
        </div>
        <p className="text-xs opacity-70 mb-2 leading-relaxed">
          Provide contextual overview, lesson guidelines, and helpful tips displayed directly to the student.
        </p>
        <QuillEditor
          value={description}
          onChange={(html) => setDescription(html)}
          placeholder="Write unit objectives, summary, lesson instructions, and recommended reading for the student..."
          minHeight="180px"
        />
      </div>

      {/* Dynamic Content Rendering */}
      <div className="pt-6 border-t" style={{ borderColor: 'var(--glass-border)' }}>
        <h3 className="text-lg font-bold mb-4">Content Configuration</h3>
        
        {activeType === LearningUnitType.VIDEO && (
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* Delivery Mode Selector */}
            <div>
              <label className={labelClass}>Video Delivery Mode</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Mode 1: VdoCipher DRM */}
                <div
                  onClick={() => setVideoSourceType('vdocipher')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                    videoSourceType === 'vdocipher'
                      ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-sm ring-1 ring-indigo-500/20'
                      : 'border-[var(--glass-border)] bg-[var(--color-bg-elevated)] hover:border-slate-300 opacity-75 hover:opacity-100'
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg shrink-0 font-bold border border-indigo-500/20">
                    🔒
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-indigo-700 dark:text-indigo-400">VdoCipher (DRM Stream)</span>
                      {videoSourceType === 'vdocipher' && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs opacity-75 mt-0.5 leading-relaxed">
                      Forensic dynamic watermarking & screen-record prevention (ideal for core paid lectures).
                    </p>
                  </div>
                </div>

                {/* Mode 2: Direct Cloud Upload */}
                <div
                  onClick={() => setVideoSourceType('direct_upload')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                    videoSourceType === 'direct_upload'
                      ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-sm ring-1 ring-emerald-500/20'
                      : 'border-[var(--glass-border)] bg-[var(--color-bg-elevated)] hover:border-slate-300 opacity-75 hover:opacity-100'
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg shrink-0 font-bold border border-emerald-500/20">
                    ☁️
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-emerald-700 dark:text-emerald-400">Direct Cloud Upload</span>
                      {videoSourceType === 'direct_upload' && (
                        <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs opacity-75 mt-0.5 leading-relaxed">
                      Upload orientation trailers, syllabus intro, or preview videos directly to Cloudflare R2.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mode 1 Fields: VdoCipher ID */}
            {videoSourceType === 'vdocipher' && (
              <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 font-mono">
                    VdoCipher Video ID
                  </label>
                  <span className="text-[10px] font-mono opacity-60">32-character hex string</span>
                </div>
                <input
                  type="text"
                  value={vdoCipherId}
                  onChange={(e) => setVdoCipherId(e.target.value)}
                  className={inputClass}
                  style={{ backgroundColor: 'var(--color-bg-elevated)', borderColor: 'var(--glass-border)' }}
                  placeholder="e.g. 5a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p"
                />
                <p className="text-xs opacity-60">
                  Paste the unique 32-character encrypted video ID from your VdoCipher enterprise dashboard.
                </p>
              </div>
            )}

            {/* Mode 2 Fields: Cloud Video File Upload & URL */}
            {videoSourceType === 'direct_upload' && (
              <div className="p-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 font-mono">
                    Cloud Video File (.mp4, .webm, .mov)
                  </label>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-500/20">
                    Max 500 MB
                  </span>
                </div>

                {/* Upload Action Row */}
                <div className="flex flex-wrap items-center gap-3">
                  <label className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-md hover:shadow-lg flex items-center gap-2 transition-all active:scale-95 border border-emerald-500">
                    <svg className="w-4 h-4 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-white font-bold tracking-wide">
                      {directVideoUrl ? 'Replace Video File' : 'Upload Video to Cloud'}
                    </span>
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime,video/mkv"
                      onChange={handleVideoFileChange}
                      disabled={isUploadingVideo}
                      className="hidden"
                    />
                  </label>

                  {isUploadingVideo && (
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-white/90 dark:bg-emerald-950/50 px-3 py-2 rounded-xl border border-emerald-300 dark:border-emerald-700 shadow-sm">
                      <div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-600 rounded-full animate-spin shrink-0" />
                      <span>{uploadProgress || 'Uploading to Cloudflare R2...'}</span>
                    </div>
                  )}

                  {!isUploadingVideo && videoFileName && (
                    <div className="flex items-center gap-2 text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 shadow-sm font-semibold">
                      <span className="text-sm">🎬</span>
                      <span className="truncate max-w-xs">{videoFileName}</span>
                    </div>
                  )}
                </div>

                {/* Direct Video URL input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Direct Video Relative Path / Document ID
                    </label>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      Portable (Domain-Agnostic)
                    </span>
                  </div>
                  <input
                    type="text"
                    value={directVideoUrl}
                    onChange={(e) => {
                      const val = e.target.value;
                      const trimmed = val.trim();
                      // Auto-resolve if raw MongoDB Document ID is pasted
                      if (/^[0-9a-fA-F]{24}$/.test(trimmed)) {
                        setDirectVideoUrl(`${BACKEND_URL}/api/admin/documents/${trimmed}`);
                        setVideoDocId(trimmed);
                      } else {
                        setDirectVideoUrl(val);
                        const match = trimmed.match(/([0-9a-fA-F]{24})/);
                        if (match) {
                          setVideoDocId(match[1]);
                        }
                      }
                      if (!videoFileName) setVideoFileName('Direct Video Stream');
                    }}
                    className={inputClass}
                    style={{ backgroundColor: 'var(--color-bg-elevated)', borderColor: 'var(--glass-border)' }}
                    placeholder={`e.g. ${BACKEND_URL}/api/admin/documents/6aeb7eeea3f90898bef28c72`}
                  />
                  <p className="text-[11px] opacity-60 mt-1">
                    Saved to database as relative path (<code className="font-mono text-emerald-600">/api/admin/documents/:id</code>) so server migrations never break playback.
                  </p>
                </div>

                {/* In-Editor Live Video Player Preview */}
                {directVideoUrl && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <span>▶️</span>
                        <span>Video Player Preview</span>
                      </p>
                      <span className="text-[10px] font-mono opacity-60 truncate max-w-xs">
                        {getFullVideoUrl(directVideoUrl)}
                      </span>
                    </div>
                    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-md bg-black max-w-md aspect-video">
                      <video
                        src={getFullVideoUrl(directVideoUrl)}
                        controls
                        className="w-full h-full object-contain"
                        preload="metadata"
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeType === LearningUnitType.NOTES && (
          <div className="animate-in fade-in duration-300">
            <div className="flex items-center justify-between gap-2 mb-2">
              <label className={labelClass}>Rich Text Lecture Notes</label>
              <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 font-bold border border-indigo-500/20 whitespace-nowrap shrink-0">
                Quill Rich HTML
              </span>
            </div>
            <QuillEditor
              value={notesContent}
              onChange={(html) => setNotesContent(html)}
              placeholder="Draft comprehensive lecture notes, key takeaways, diagrams, references, and formatted content..."
              minHeight="240px"
            />
          </div>
        )}

        {(activeType === LearningUnitType.ASSESSMENT || activeType === LearningUnitType.ASSIGNMENT) && (
          <div className="animate-in fade-in duration-300">
            <div className="p-6 rounded-xl border border-dashed text-center opacity-60" style={{ borderColor: 'var(--glass-border)', backgroundColor: 'var(--color-bg-elevated)' }}>
              <p className="font-mono text-sm">[ {activeType} Builder Interface Placeholder ]</p>
              <p className="text-xs mt-2">Connects to the global assessment bank and assignment engine.</p>
            </div>
          </div>
        )}
      </div>

      <div className="pt-6 flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : null}
          {isLoading ? 'Saving...' : 'Save Learning Unit'}
        </button>
      </div>

      {/* ── REUSABLE MODAL FEEDBACK ── */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        title={modalState.title}
        type={modalState.type}
        description={modalState.description}
        primaryAction={{
          label: modalState.type === 'error' ? 'Dismiss' : 'Continue Editing ➔',
          onClick: () => setModalState(prev => ({ ...prev, isOpen: false })),
          variant: modalState.type === 'error' ? 'secondary' : 'primary'
        }}
      >
        {modalState.details && (
          <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-600 dark:text-slate-300">
            {modalState.details}
          </div>
        )}
      </Modal>
    </form>
  );
};

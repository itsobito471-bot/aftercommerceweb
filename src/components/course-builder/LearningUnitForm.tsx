"use client";

import React, { useState, useEffect } from 'react';
import { LearningUnit, LearningUnitType, VideoContentData } from '@/types/course';
import { useCharacterStore } from '@/store/useCharacterStore';
import { createLearningUnit, updateLearningUnit } from '@/services/adminApi';
import { QuillEditor } from '@/components/common/QuillEditor';
import { Modal } from '@/components/common/Modal';

interface LearningUnitFormProps {
  moduleId: string | null;
  initialData?: Partial<LearningUnit>;
  availableUnits?: { id: string; title: string }[]; // Used for prerequisite dropdown
  onSave?: (data: Partial<LearningUnit>) => void;
}

export const LearningUnitForm: React.FC<LearningUnitFormProps> = ({ moduleId, initialData, availableUnits = [], onSave }) => {
  const triggerCharacter = useCharacterStore((state) => state.triggerCharacter);

  const [unitId, setUnitId] = useState<string>(initialData?.id || '');
  const [activeType, setActiveType] = useState<LearningUnitType>(initialData?.type || LearningUnitType.VIDEO);
  const [title, setTitle] = useState(initialData?.title || '');
  const [prerequisiteId, setPrerequisiteId] = useState(initialData?.prerequisite_unit_id || '');
  
  // Content states
  const [vdoCipherId, setVdoCipherId] = useState((initialData?.content_data as VideoContentData)?.vdo_cipher_id || '');
  const [notesContent, setNotesContent] = useState((initialData?.content_data as any)?.rich_text_content || '');

  // Synchronize internal state when switching between different units in curriculum tree
  useEffect(() => {
    if (initialData) {
      setUnitId(initialData.id || '');
      setTitle(initialData.title || '');
      setActiveType(initialData.type || LearningUnitType.VIDEO);
      setPrerequisiteId(initialData.prerequisite_unit_id || '');
      setVdoCipherId((initialData.content_data as VideoContentData)?.vdo_cipher_id || '');
      setNotesContent((initialData.content_data as any)?.rich_text_content || '');
    }
  }, [
    initialData?.id, 
    initialData?.title, 
    initialData?.type, 
    initialData?.prerequisite_unit_id, 
    (initialData?.content_data as any)?.vdo_cipher_id,
    (initialData?.content_data as any)?.rich_text_content
  ]);

  const handleTypeChange = (type: LearningUnitType) => {
    setActiveType(type);
    if (type === LearningUnitType.VIDEO) {
      triggerCharacter('thinking', 'Make sure your VdoCipher video is fully encoded before pasting the ID.');
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

    if (activeType === LearningUnitType.VIDEO && !vdoCipherId.trim()) {
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'VdoCipher Video ID Required',
        description: 'Please provide a valid VdoCipher Video ID for video lectures.'
      });
      return;
    }

    setIsLoading(true);

    try {
      let contentPayload: any = {};
      if (activeType === LearningUnitType.VIDEO) {
        contentPayload = { vdo_cipher_id: vdoCipherId.trim() };
      } else if (activeType === LearningUnitType.NOTES) {
        contentPayload = { rich_text_content: notesContent };
      } else {
        contentPayload = initialData?.content_data || {};
      }

      const payload: Partial<LearningUnit> = {
        title: title.trim(),
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
          ? `VdoCipher Video ID: ${vdoCipherId.trim()}`
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

      {/* Dynamic Content Rendering */}
      <div className="pt-6 border-t" style={{ borderColor: 'var(--glass-border)' }}>
        <h3 className="text-lg font-bold mb-4">Content Configuration</h3>
        
        {activeType === LearningUnitType.VIDEO && (
          <div className="animate-in fade-in duration-300">
            <label className={labelClass}>VdoCipher Video ID</label>
            <input
              type="text"
              value={vdoCipherId}
              onChange={(e) => setVdoCipherId(e.target.value)}
              className={inputClass}
              style={{ backgroundColor: 'var(--color-bg-elevated)', borderColor: 'var(--glass-border)' }}
              placeholder="e.g. 5a1b2c3d4e5f6g7h8i9j0"
              required
            />
            <p className="text-xs opacity-60 mt-2">Paste the 32-character video ID provided by your VdoCipher dashboard.</p>
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

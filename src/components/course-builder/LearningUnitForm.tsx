"use client";

import React, { useState } from 'react';
import { LearningUnit, LearningUnitType, VideoContentData } from '@/types/course';
import { useCharacterStore } from '@/store/useCharacterStore';
import { createLearningUnit, updateLearningUnit } from '@/services/adminApi';

interface LearningUnitFormProps {
  moduleId: string | null;
  initialData?: Partial<LearningUnit>;
  availableUnits?: { id: string; title: string }[]; // Used for prerequisite dropdown
  onSave?: (data: Partial<LearningUnit>) => void;
}

export const LearningUnitForm: React.FC<LearningUnitFormProps> = ({ moduleId, initialData, availableUnits = [], onSave }) => {
  const triggerCharacter = useCharacterStore((state) => state.triggerCharacter);

  const [activeType, setActiveType] = useState<LearningUnitType>(initialData?.type || LearningUnitType.VIDEO);
  const [title, setTitle] = useState(initialData?.title || '');
  const [prerequisiteId, setPrerequisiteId] = useState(initialData?.prerequisite_unit_id || '');
  
  // Content states
  const [vdoCipherId, setVdoCipherId] = useState((initialData?.content_data as VideoContentData)?.vdo_cipher_id || '');

  const handleTypeChange = (type: LearningUnitType) => {
    setActiveType(type);
    if (type === LearningUnitType.VIDEO) {
      triggerCharacter('thinking', 'Make sure your VdoCipher video is fully encoded before pasting the ID.');
    } else if (type === LearningUnitType.NOTES) {
      triggerCharacter('helper', 'Use rich text to break down complex topics cleanly.');
    } else {
      triggerCharacter('celebrating', 'Interactive elements increase student engagement greatly!');
    }
  };

  const handlePrerequisiteFocus = () => {
    triggerCharacter('helper', 'Combine prerequisite locks with Drip days for total curriculum control.');
  };

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!moduleId || moduleId.startsWith('mod-')) {
      triggerCharacter('helper', 'Please save the parent Module first before adding Learning Units!');
      return;
    }

    setIsLoading(true);

    try {
      const payload: Partial<LearningUnit> = {
        title,
        type: activeType,
        prerequisite_unit_id: prerequisiteId || null,
        module_id: moduleId,
        content_data: activeType === LearningUnitType.VIDEO 
          ? { vdo_cipher_id: vdoCipherId } 
          : { rich_text_content: '' } as any 
      };

      let savedUnit;
      if (initialData?.id && !initialData.id.startsWith('unit-')) {
        savedUnit = await updateLearningUnit(initialData.id, payload);
      } else {
        savedUnit = await createLearningUnit(payload);
      }

      triggerCharacter('celebrating', 'Learning Unit successfully saved!');

      if (onSave) {
        onSave({
          ...payload,
          id: savedUnit?.data?._id || savedUnit?.data?.id || initialData?.id
        });
      }
    } catch (error) {
      console.error('Failed to save learning unit:', error);
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
            <label className={labelClass}>Rich Text Content</label>
            <textarea
              className={`${inputClass} min-h-[160px] resize-y`}
              style={{ backgroundColor: 'var(--color-bg-elevated)', borderColor: 'var(--glass-border)' }}
              placeholder="Draft your lecture notes here... (Rich Text Editor initialization placeholder)"
            ></textarea>
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
          className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : null}
          {isLoading ? 'Saving...' : 'Save Learning Unit'}
        </button>
      </div>
    </form>
  );
};

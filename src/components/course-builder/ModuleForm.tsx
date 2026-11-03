"use client";

import React, { useState, useEffect } from 'react';
import { Module } from '@/types/course';
import { useCharacterStore } from '@/store/useCharacterStore';
import { createModule, updateModule } from '@/services/adminApi';
import { QuillEditor } from '@/components/common/QuillEditor';

interface ModuleFormProps {
  courseId: string;
  initialData?: Partial<Module>;
  onSave?: (data: Partial<Module>) => void;
}

export const ModuleForm: React.FC<ModuleFormProps> = ({ courseId, initialData, onSave }) => {
  const triggerCharacter = useCharacterStore((state) => state.triggerCharacter);

  const [formData, setFormData] = useState<Partial<Module>>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    order_index: initialData?.order_index || 1,
    unlock_days: initialData?.unlock_days || 0,
  });

  // Synchronize internal state when selecting a different module in the curriculum tree
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        title: initialData.title !== undefined ? initialData.title : prev.title,
        description: initialData.description !== undefined ? initialData.description : (prev.description || ''),
        order_index: initialData.order_index !== undefined ? initialData.order_index : prev.order_index,
        unlock_days: initialData.unlock_days !== undefined ? initialData.unlock_days : prev.unlock_days,
      }));
    }
  }, [initialData?.id, initialData?.title, initialData?.description, initialData?.order_index, initialData?.unlock_days]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleUnlockFocus = () => {
    triggerCharacter('helper', 'Drip content allows you to lock this module until a specific number of days after the student enrolls!');
  };

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (courseId.startsWith('course-')) {
      triggerCharacter('helper', 'Please save the Course Shell first before creating modules!');
      return;
    }

    setIsLoading(true);

    try {
      let savedModule;
      // Use API if it's an existing module, else create it
      if (initialData?.id && !initialData.id.startsWith('mod-')) {
        savedModule = await updateModule(initialData.id, formData);
      } else {
        const payload = { ...formData, course_id: courseId };
        savedModule = await createModule(payload);
      }

      const returnedModule = savedModule?.data as any;
      const savedId = returnedModule?._id || returnedModule?.id || initialData?.id || '';
      const savedDescription = returnedModule?.description !== undefined ? returnedModule.description : (formData.description || '');
      
      setFormData(prev => ({
        ...prev,
        id: savedId,
        description: savedDescription
      }));

      triggerCharacter('celebrating', 'Module successfully saved!');
      
      if (onSave) {
        onSave({
          ...formData,
          id: savedId,
          description: savedDescription
        });
      }
    } catch (error) {
      console.error('Failed to save module:', error);
      triggerCharacter('helper', 'Oops, failed to save module. Check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all";
  const labelClass = "block text-sm font-semibold mb-1.5 opacity-90";

  return (
    <form onSubmit={handleSubmit} className="space-y-6" style={{ color: 'var(--color-text-primary)' }}>
      <div>
        <label className={labelClass}>Module Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={inputClass}
          style={{ backgroundColor: 'var(--color-bg-elevated)', borderColor: 'var(--glass-border)' }}
          placeholder="e.g. Introduction to Financial Modeling"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>Order Index</label>
          <input
            type="number"
            name="order_index"
            min="1"
            value={formData.order_index}
            onChange={handleChange}
            className={inputClass}
            style={{ backgroundColor: 'var(--color-bg-elevated)', borderColor: 'var(--glass-border)' }}
            required
          />
          <p className="text-xs opacity-60 mt-1">Controls the display order in the curriculum tree.</p>
        </div>

        <div>
          <label className={labelClass}>Unlock Days (Drip Content)</label>
          <input
            type="number"
            name="unlock_days"
            min="0"
            value={formData.unlock_days}
            onChange={handleChange}
            onFocus={handleUnlockFocus}
            className={inputClass}
            style={{ backgroundColor: 'var(--color-bg-elevated)', borderColor: 'var(--glass-border)' }}
            required
          />
          <p className="text-xs opacity-60 mt-1">0 means instantly available upon enrollment.</p>
        </div>
      </div>

      {/* ── MODULE DESCRIPTION (QUILL RICH TEXT EDITOR) ── */}
      <div className="pt-4 border-t" style={{ borderColor: 'var(--glass-border)' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-base font-bold">Module Overview & Learning Objectives</h3>
              <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 font-bold border border-indigo-500/20 whitespace-nowrap shrink-0">
                Quill Rich HTML
              </span>
            </div>
            <p className="text-xs opacity-70 mt-1 leading-relaxed">
              Detail chapter goals, target learning outcomes, required background, and recommended pacing with rich formatting.
            </p>
          </div>
        </div>

        <QuillEditor
          value={formData.description || ''}
          onChange={(html) => setFormData(prev => ({ ...prev, description: html }))}
          placeholder="Craft rich chapter summary, module outcomes, core competencies, and reading materials..."
          minHeight="220px"
        />
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
          {isLoading ? 'Saving...' : 'Save Module'}
        </button>
      </div>
    </form>
  );
};

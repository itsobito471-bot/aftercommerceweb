"use client";

import React, { useState } from 'react';
import { Module } from '@/types/course';
import { useCharacterStore } from '@/store/useCharacterStore';
import { createModule, updateModule } from '@/services/adminApi';

interface ModuleFormProps {
  courseId: string;
  initialData?: Partial<Module>;
  onSave?: (data: Partial<Module>) => void;
}

export const ModuleForm: React.FC<ModuleFormProps> = ({ courseId, initialData, onSave }) => {
  const triggerCharacter = useCharacterStore((state) => state.triggerCharacter);

  const [formData, setFormData] = useState<Partial<Module>>({
    title: initialData?.title || '',
    order_index: initialData?.order_index || 1,
    unlock_days: initialData?.unlock_days || 0,
  });

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
      
      triggerCharacter('celebrating', 'Module successfully saved!');
      
      if (onSave) {
        onSave({
          ...formData,
          id: savedModule?.data?._id || savedModule?.data?.id || initialData?.id
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
          placeholder="e.g. Introduction to React"
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

      <div className="pt-6 flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-2"
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

"use client";

import React, { useState } from 'react';
import { Course } from '@/types/course';

interface CourseTreeSidebarProps {
  courseData: Course;
  activeView: 'shell' | 'module' | 'unit';
  selectedModuleId: string | null;
  selectedUnitId: string | null;
  onSelectShell: () => void;
  onSelectModule: (moduleId: string) => void;
  onSelectUnit: (unitId: string, moduleId: string) => void;
  onAddModule: () => void;
  onAddUnit: (moduleId: string) => void;
}

export const CourseTreeSidebar: React.FC<CourseTreeSidebarProps> = ({
  courseData,
  activeView,
  selectedModuleId,
  selectedUnitId,
  onSelectShell,
  onSelectModule,
  onSelectUnit,
  onAddModule,
  onAddUnit,
}) => {
  // Local state to track which modules are expanded in the accordion
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  // Auto-expand active module
  React.useEffect(() => {
    if (selectedModuleId) {
      setExpandedModules(prev => ({ ...prev, [selectedModuleId]: true }));
    }
  }, [selectedModuleId]);

  const toggleModule = (moduleId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selecting the module when just expanding/collapsing
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  return (
    <div 
      className="w-80 h-full flex flex-col shadow-lg overflow-y-auto"
      style={{
        backgroundColor: 'var(--color-bg-surface)',
        borderRight: '1px solid var(--glass-border)'
      }}
    >
      <div className="p-5 border-b" style={{ borderColor: 'var(--glass-border)' }}>
        <h2 className="text-sm font-bold tracking-widest uppercase mb-4 opacity-80" style={{ color: 'var(--color-text-primary)' }}>
          Curriculum Tree
        </h2>
        
        {/* Global Settings / Shell Selector */}
        <button
          onClick={onSelectShell}
          className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all duration-200 font-medium ${
            activeView === 'shell' 
              ? 'bg-indigo-500/15 text-indigo-500 shadow-inner' 
              : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-80 hover:opacity-100'
          }`}
          style={{ color: activeView === 'shell' ? undefined : 'var(--color-text-primary)' }}
        >
          ⚙️ Course Settings
        </button>
      </div>

      <div className="p-3 flex-1 overflow-y-auto space-y-1">
        {[...(courseData.modules || [])]
          .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
          .map((mod) => (
          <div key={mod.id} className="flex flex-col">
            {/* Module Accordion Header */}
            <div 
              className={`group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
                activeView === 'module' && selectedModuleId === mod.id
                  ? 'bg-indigo-500/10 text-indigo-500 font-semibold'
                  : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-80 hover:opacity-100'
              }`}
              style={{ color: (activeView === 'module' && selectedModuleId === mod.id) ? undefined : 'var(--color-text-primary)' }}
              onClick={() => onSelectModule(mod.id)}
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <button onClick={(e) => toggleModule(mod.id, e)} className="focus:outline-none shrink-0 p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-md transition-colors">
                  <svg 
                    className={`w-3.5 h-3.5 transition-transform duration-300 ${expandedModules[mod.id] ? 'rotate-90' : ''}`} 
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <span className="text-sm truncate leading-none">{mod.title || 'Untitled Module'}</span>
              </div>
            </div>

            {/* Units Accordion Body */}
            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                expandedModules[mod.id] ? 'max-h-[1000px] opacity-100 mt-1 mb-2' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="pl-7 pr-2 py-1 space-y-1 border-l-2 ml-5" style={{ borderColor: 'var(--glass-border)' }}>
                {[...(mod.units || [])]
                  .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
                  .map((unit) => (
                  <div
                    key={unit.id}
                    onClick={() => onSelectUnit(unit.id, mod.id)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      activeView === 'unit' && selectedUnitId === unit.id
                        ? 'bg-indigo-500/10 text-indigo-500 font-medium'
                        : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100'
                    }`}
                    style={{ color: (activeView === 'unit' && selectedUnitId === unit.id) ? undefined : 'var(--color-text-primary)' }}
                  >
                    <div className="flex items-center gap-2.5 truncate text-sm">
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md border" style={{ borderColor: 'var(--glass-border)', backgroundColor: 'var(--glass-bg)' }}>
                        {unit.type.substring(0, 1)}
                      </span>
                      <span className="truncate">{unit.title || 'Untitled Unit'}</span>
                    </div>
                    {/* Visual Queue: Lock icon if prerequisite exists */}
                    {unit.prerequisite_unit_id && (
                      <svg className="w-3.5 h-3.5 opacity-50 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    )}
                  </div>
                ))}
                
                <button
                  onClick={() => onAddUnit(mod.id)}
                  className="w-full text-left px-3 py-2 mt-1 text-xs text-indigo-500 hover:text-indigo-400 transition-colors flex items-center gap-1.5 font-bold uppercase tracking-wider"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Unit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t backdrop-blur-md" style={{ borderColor: 'var(--glass-border)', backgroundColor: 'var(--glass-bg)' }}>
        <button
          onClick={onAddModule}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-semibold transition-all hover:shadow-md active:scale-95"
          style={{ borderColor: 'var(--glass-border)', color: 'var(--color-text-primary)' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Module
        </button>
      </div>
    </div>
  );
};

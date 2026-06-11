"use client";

import React, { useState } from 'react';
import { CourseTreeSidebar } from '@/components/course-builder/CourseTreeSidebar';
import { CourseShellForm } from '@/components/course-builder/CourseShellForm';
import { ModuleForm } from '@/components/course-builder/ModuleForm';
import { LearningUnitForm } from '@/components/course-builder/LearningUnitForm';
import { Course, StructureMode, LearningUnitType, Module, LearningUnit } from '@/types/course';
import { useSearchParams } from 'next/navigation';
import { getCourseTree } from '@/services/adminApi';

export default function CourseBuilderOrchestrator() {
  const searchParams = useSearchParams();
  const courseIdParam = searchParams.get('id');

  // 1. Central Course Data State
  const [courseData, setCourseData] = useState<Course>({
    id: `course-${Date.now()}`,
    title: 'Untitled Course',
    category: '',
    price: 0,
    validity_days: 365,
    structure_mode: StructureMode.LINEAR,
    is_published: false,
    modules: [],
  });

  const [isLoading, setIsLoading] = useState(!!courseIdParam);

  // Hydrate from Backend if ?id= exists
  React.useEffect(() => {
    if (!courseIdParam) return;

    const fetchTree = async () => {
      try {
        const response = await getCourseTree(courseIdParam);
        const data = response.data;
        if (data) {
          // Deep map _id to id for the frontend Course interface
          setCourseData({
            id: data._id,
            title: data.title,
            category: data.category_id, 
            price: data.pricing?.regular_price || 0,
            validity_days: data.validity_days,
            structure_mode: data.structure_mode === 'flexible' ? StructureMode.FREE_FLEXIBLE : StructureMode.LINEAR,
            is_published: data.is_published,
            modules: (data.modules || []).map((m: any) => ({
              id: m._id,
              course_id: m.course_id,
              title: m.title,
              order_index: m.order_index,
              unlock_days: m.unlock_days,
              units: (m.units || []).map((u: any) => ({
                id: u._id,
                module_id: u.module_id,
                title: u.title,
                type: u.type as LearningUnitType,
                content_data: u.content_data,
                order_index: u.order_index,
                prerequisite_unit_id: u.prerequisite_unit_id
              }))
            }))
          });
        }
      } catch (err) {
        console.error("Failed to load course tree:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTree();
  }, [courseIdParam]);

  // 2. Navigation / UI State
  const [activeView, setActiveView] = useState<'shell' | 'module' | 'unit'>('shell');
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  // 3. Tree Manipulation Handlers
  const handleAddModule = () => {
    const newModuleId = `mod-${Date.now()}`;
    const newModule: Module = {
      id: newModuleId,
      course_id: courseData.id,
      title: 'New Module',
      order_index: (courseData.modules?.length || 0) + 1,
      unlock_days: 0,
      units: []
    };
    
    setCourseData(prev => ({
      ...prev,
      modules: [...(prev.modules || []), newModule]
    }));
    
    // Auto-focus the newly created module
    setActiveView('module');
    setSelectedModuleId(newModuleId);
  };

  const handleAddUnit = (moduleId: string) => {
    const newUnitId = `unit-${Date.now()}`;
    const newUnit: LearningUnit = {
      id: newUnitId,
      module_id: moduleId,
      title: 'New Unit',
      type: LearningUnitType.VIDEO,
      content_data: { vdo_cipher_id: '' }, // Polymorphic wrapper defaults to Video
      order_index: 1, 
    };

    setCourseData(prev => ({
      ...prev,
      modules: prev.modules?.map(m => {
        if (m.id === moduleId) {
          // Re-calculate order index dynamically for safety
          newUnit.order_index = (m.units?.length || 0) + 1;
          return {
            ...m,
            units: [...(m.units || []), newUnit]
          };
        }
        return m;
      })
    }));

    // Auto-focus the newly created unit
    setActiveView('unit');
    setSelectedModuleId(moduleId);
    setSelectedUnitId(newUnitId);
  };

  if (isLoading) {
    return (
      <div className="flex w-full h-[calc(100vh-4rem)] items-center justify-center bg-[var(--color-bg-base)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-sm font-semibold opacity-60">Loading Course Ecosystem...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex w-full h-[calc(100vh-4rem)] overflow-hidden"
      style={{ backgroundColor: 'var(--color-bg-base)' }}
    >
      {/* Split Pane - Left (Curriculum Navigation) */}
      <CourseTreeSidebar 
        courseData={courseData}
        activeView={activeView}
        selectedModuleId={selectedModuleId}
        selectedUnitId={selectedUnitId}
        onSelectShell={() => setActiveView('shell')}
        onSelectModule={(id) => {
          setSelectedModuleId(id);
          setActiveView('module');
        }}
        onSelectUnit={(unitId, moduleId) => {
          setSelectedModuleId(moduleId);
          setSelectedUnitId(unitId);
          setActiveView('unit');
        }}
        onAddModule={handleAddModule}
        onAddUnit={handleAddUnit}
      />

      {/* Split Pane - Right (Dynamic Form Workspace) */}
      <div className="flex-1 overflow-y-auto p-8 relative">
        <div 
          className="max-w-4xl mx-auto rounded-2xl p-10 shadow-sm min-h-[600px] transition-all"
          style={{ 
            backgroundColor: 'var(--color-bg-surface)', 
            borderColor: 'var(--glass-border)', 
            borderWidth: '1px' 
          }}
        >
          {/* View: Course Shell Settings */}
          {activeView === 'shell' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
              <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Course Settings
              </h1>
              <p className="text-sm opacity-60 mb-8" style={{ color: 'var(--color-text-primary)' }}>
                Configure global settings, pricing, and overarching category metadata here.
              </p>
              
              <CourseShellForm 
                initialData={courseData} 
                onSave={(data) => setCourseData(prev => ({ ...prev, ...data }))} 
              />
            </div>
          )}

          {/* View: Module Settings */}
          {activeView === 'module' && selectedModuleId && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
              <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Module Configuration
              </h1>
              <p className="text-sm opacity-60 mb-8" style={{ color: 'var(--color-text-primary)' }}>
                Setup module-level drip delays, structural gating, and general titles.
              </p>
              
              <ModuleForm 
                courseId={courseData.id}
                initialData={courseData.modules?.find(m => m.id === selectedModuleId)}
                onSave={(data) => {
                  setCourseData(prev => ({
                    ...prev,
                    modules: prev.modules?.map(m => m.id === selectedModuleId ? { ...m, ...data } : m)
                  }));
                  if (data.id && data.id !== selectedModuleId) {
                    setSelectedModuleId(data.id);
                  }
                }}
              />
            </div>
          )}

          {/* View: Learning Unit Settings */}
          {activeView === 'unit' && selectedUnitId && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
              <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Learning Unit Editor
              </h1>
              <p className="text-sm opacity-60 mb-8" style={{ color: 'var(--color-text-primary)' }}>
                Upload videos, draft rich-text notes, link assessments, and establish prerequisites.
              </p>
              
              <LearningUnitForm 
                moduleId={selectedModuleId}
                initialData={courseData.modules?.find(m => m.id === selectedModuleId)?.units?.find(u => u.id === selectedUnitId)}
                onSave={(data) => {
                  setCourseData(prev => ({
                    ...prev,
                    modules: prev.modules?.map(m => {
                      if (m.id === selectedModuleId) {
                        return {
                          ...m,
                          units: m.units?.map(u => u.id === selectedUnitId ? { ...u, ...data } : u)
                        };
                      }
                      return m;
                    })
                  }));
                  if (data.id && data.id !== selectedUnitId) {
                    setSelectedUnitId(data.id);
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

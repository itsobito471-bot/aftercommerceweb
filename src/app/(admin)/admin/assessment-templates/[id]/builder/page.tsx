'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getAssessmentTemplateById, 
  getTemplateFields, 
  syncTemplateFields 
} from '@/services/adminApi';
import { useCharacterStore } from '@/store/characterStore';

interface OptionItem {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface QuestionItem {
  _id?: string | null;
  input_type: 'MCQ' | 'CHECKBOX' | 'TEXT_SHORT';
  label: string;
  points: number;
  is_required: boolean;
  options_config: OptionItem[];
}

export default function QuestionBuilderPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const templateId = params.id;

  // Component State
  const [templateTitle, setTemplateTitle] = useState('Loading...');
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  
  // UI State
  const [isFetching, setIsFetching] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Mascot Guide
  const { setEmotion, speak } = useCharacterStore();

  // Helper to generate A, B, C based on index
  const generateOptionLetter = (index: number): string => {
    return String.fromCharCode(65 + index);
  };

  // Fetch Template details & questions
  useEffect(() => {
    async function loadTemplateData() {
      try {
        setIsFetching(true);
        
        // 1. Fetch template details (to show the title)
        const templateRes = await getAssessmentTemplateById(templateId);
        if (templateRes.success && templateRes.data) {
          setTemplateTitle(templateRes.data.title || 'Assessment');
        }

        // 2. Fetch existing questions
        const fieldsRes = await getTemplateFields(templateId);
        if (fieldsRes.success && fieldsRes.data && fieldsRes.data.length > 0) {
          setQuestions(fieldsRes.data);
        } else {
          // If empty, add a default MCQ question to start
          setQuestions([
            {
              _id: null,
              input_type: 'MCQ',
              label: '',
              points: 1,
              is_required: true,
              options_config: [
                { id: 'A', text: '', isCorrect: false },
                { id: 'B', text: '', isCorrect: false }
              ]
            }
          ]);
        }
      } catch (err) {
        console.error('Failed to load template data', err);
        speak('Error! Failed to retrieve assessment question fields.', 4000);
      } finally {
        setIsFetching(false);
      }
    }

    loadTemplateData();
  }, [templateId]);

  // Question manipulation
  const addQuestion = () => {
    const newQuestion: QuestionItem = {
      _id: null,
      input_type: 'MCQ',
      label: '',
      points: 1,
      is_required: true,
      options_config: [
        { id: 'A', text: '', isCorrect: false },
        { id: 'B', text: '', isCorrect: false }
      ]
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (qIndex: number) => {
    const updated = questions.filter((_, idx) => idx !== qIndex);
    if (updated.length === 0) {
      setQuestions([
        {
          _id: null,
          input_type: 'MCQ',
          label: '',
          points: 1,
          is_required: true,
          options_config: [
            { id: 'A', text: '', isCorrect: false },
            { id: 'B', text: '', isCorrect: false }
          ]
        }
      ]);
    } else {
      setQuestions(updated);
    }
  };

  const updateQuestionField = (qIndex: number, field: keyof QuestionItem, value: any) => {
    const updated = [...questions];
    updated[qIndex] = {
      ...updated[qIndex],
      [field]: value
    };
    setQuestions(updated);
  };

  const handleTypeChange = (qIndex: number, newType: 'MCQ' | 'CHECKBOX' | 'TEXT_SHORT') => {
    const updated = [...questions];
    const currentQ = updated[qIndex];
    
    let options: OptionItem[] = [];
    if (newType === 'MCQ' || newType === 'CHECKBOX') {
      options = currentQ.options_config.length > 0 
        ? currentQ.options_config.map((opt, idx) => ({ ...opt, id: generateOptionLetter(idx) }))
        : [
            { id: 'A', text: '', isCorrect: false },
            { id: 'B', text: '', isCorrect: false }
          ];
    }
    
    updated[qIndex] = {
      ...currentQ,
      input_type: newType,
      options_config: options
    };
    setQuestions(updated);
  };

  // Option manipulation
  const addOption = (qIndex: number) => {
    const updated = [...questions];
    const currentQ = updated[qIndex];
    const optionsArray = [...currentQ.options_config];
    optionsArray.push({
      id: generateOptionLetter(optionsArray.length),
      text: '',
      isCorrect: false
    });
    
    updated[qIndex] = {
      ...currentQ,
      options_config: optionsArray
    };
    setQuestions(updated);
  };

  const removeOption = (qIndex: number, optIndex: number) => {
    const updated = [...questions];
    const currentQ = updated[qIndex];
    
    // Maintain at least two options for MCQ/CHECKBOX questions
    if (currentQ.options_config.length <= 2) return;

    const optionsArray = currentQ.options_config.filter((_, idx) => idx !== optIndex)
      .map((opt, idx) => ({ ...opt, id: generateOptionLetter(idx) }));

    updated[qIndex] = {
      ...currentQ,
      options_config: optionsArray
    };
    setQuestions(updated);
  };

  const updateOptionField = (qIndex: number, optIndex: number, field: keyof OptionItem, value: any) => {
    const updated = [...questions];
    const currentQ = updated[qIndex];
    const optionsArray = [...currentQ.options_config];
    
    if (field === 'isCorrect' && currentQ.input_type === 'MCQ') {
      // Single choice MCQ: uncheck all other options
      optionsArray.forEach((opt, idx) => {
        opt.isCorrect = idx === optIndex ? value : false;
      });
    } else {
      optionsArray[optIndex] = {
        ...optionsArray[optIndex],
        [field]: value
      };
    }

    updated[qIndex] = {
      ...currentQ,
      options_config: optionsArray
    };
    setQuestions(updated);
  };

  // Calculations
  const getTotalScore = () => {
    return questions.reduce((total, q) => total + Number(q.points || 0), 0);
  };

  // Form Validation
  const validateForm = (): boolean => {
    setValidationError('');
    
    for (let qIdx = 0; qIdx < questions.length; qIdx++) {
      const q = questions[qIdx];
      if (!q.label.trim()) {
        setValidationError(`Question ${qIdx + 1}: Question text cannot be empty.`);
        return false;
      }

      if (q.input_type === 'MCQ' || q.input_type === 'CHECKBOX') {
        if (q.options_config.length < 2) {
          setValidationError(`Question ${qIdx + 1}: Multiple choice questions must have at least 2 options.`);
          return false;
        }

        const hasEmptyOption = q.options_config.some(opt => !opt.text.trim());
        if (hasEmptyOption) {
          setValidationError(`Question ${qIdx + 1}: Option texts cannot be empty.`);
          return false;
        }

        const hasCorrectOption = q.options_config.some(opt => opt.isCorrect);
        if (!hasCorrectOption) {
          setValidationError(`Question ${qIdx + 1}: Please select at least one correct answer option.`);
          return false;
        }
      }
    }

    return true;
  };

  // Save all questions
  const saveQuestions = async () => {
    if (!validateForm()) {
      speak('Validation Error! Please fill out all required question inputs.', 4000);
      return;
    }

    try {
      setIsLoading(true);
      setEmotion('thinking');

      // Sync and format payload including the dynamic order index
      const payload = {
        fields: questions.map((q, index) => ({
          ...q,
          order_index: index
        }))
      };

      const res = await syncTemplateFields(templateId, payload);
      if (res && res.success) {
        setEmotion('celebrating');
        speak('Success! Assessment questions saved and integrated.', 4000);
        router.push('/admin/assessment-templates');
      }
    } catch (err: any) {
      console.error('Failed to sync questions list', err);
      const msg = err.response?.data?.message || 'Failed to sync questions list with the server.';
      speak(`Error! ${msg}`, 4000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl">
      
      {/* Page Header */}
      <div className="page-header animate-header select-none">
        <div className="header-content">
          <div className="page-label-wrap">
            <span className="page-label-root">Templates</span>
            <span className="page-label-sep">›</span>
            <span 
              className="page-label-root cursor-pointer hover:underline" 
              onClick={() => router.push('/admin/assessment-templates')}
            >
              Assessment Templates
            </span>
            <span className="page-label-sep">›</span>
            <span className="page-label-current">Builder</span>
          </div>
          <h1 className="page-title">Question Builder</h1>
          <p className="page-subtitle">
            Designing: <strong className="text-indigo-400 font-bold">{templateTitle}</strong>
          </p>
        </div>

        {/* Right Header Panel Actions */}
        <div className="flex gap-4 items-center">
          <div className="glass-badge glass-badge--active text-sm px-4 py-2 select-none">
            Total Score: {getTotalScore()} Pts
          </div>
          <button 
            onClick={() => router.push(`/admin/assessment-templates/template-form/${templateId}`)}
            className="action-btn back-btn"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 008 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
            <span>Back to Settings</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-[900px] mx-auto relative pb-32">
        
        {/* Processing Spinner Overlay */}
        {isFetching && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p className="text-sm font-semibold tracking-wide text-indigo-300">Loading questions...</p>
          </div>
        )}

        {/* Validation Errors Header Banner */}
        {validationError && (
          <div className="glass-card border-red-500/30 bg-red-500/10 p-4 mb-6 text-sm text-red-200 rounded-xl flex items-center gap-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{validationError}</span>
          </div>
        )}

        {!isFetching && (
          <div className="space-y-6">
            
            {/* Questions List */}
            {questions.map((q, qIdx) => (
              <div 
                key={qIdx} 
                className="glass-card p-6 animate-card-enter border border-white/[0.08] bg-slate-900/40 relative hover:border-white/[0.12] transition-colors"
              >
                {/* Header: Title & Remove Button */}
                <div className="flex justify-between items-center border-b border-white/[0.05] pb-4 mb-4 select-none">
                  <h3 className="text-base font-semibold text-slate-200">Question {qIdx + 1}</h3>
                  <button 
                    type="button" 
                    onClick={() => removeQuestion(qIdx)}
                    className="action-btn action-delete"
                    title="Remove Question"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      <line x1="10" y1="11" x2="10" y2="17" />
                      <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                  </button>
                </div>

                {/* Form row: Type & Points */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                  
                  {/* Type Select */}
                  <div className="glass-form-group md:col-span-2">
                    <label className="glass-label">Question Type</label>
                    <select 
                      value={q.input_type}
                      onChange={(e) => handleTypeChange(qIdx, e.target.value as any)}
                      className="glass-select"
                    >
                      <option value="MCQ">Multiple Choice (MCQ)</option>
                      <option value="CHECKBOX">Multiple Select (Checkbox)</option>
                      <option value="TEXT_SHORT">Short Text / Essay</option>
                    </select>
                  </div>

                  {/* Points Input */}
                  <div className="glass-form-group">
                    <label className="glass-label">Points</label>
                    <input 
                      type="number" 
                      min={0}
                      value={q.points}
                      onChange={(e) => updateQuestionField(qIdx, 'points', Math.max(0, Number(e.target.value)))}
                      className="glass-input" 
                    />
                  </div>

                </div>

                {/* Question Label Textarea */}
                <div className="glass-form-group mb-6">
                  <label className="glass-label">Question Text <span className="text-red-500">*</span></label>
                  <textarea 
                    value={q.label}
                    onChange={(e) => updateQuestionField(qIdx, 'label', e.target.value)}
                    rows={2}
                    placeholder="Type your question here..."
                    className="glass-input"
                  />
                </div>

                {/* Answer Options Box (only for MCQ/CHECKBOX) */}
                {(q.input_type === 'MCQ' || q.input_type === 'CHECKBOX') && (
                  <div className="bg-slate-950/30 border border-white/[0.04] p-5 rounded-xl space-y-4">
                    <label className="glass-label block mb-2 select-none text-xs text-slate-350">Answer Options</label>
                    
                    <div className="space-y-3">
                      {q.options_config.map((opt, optIdx) => (
                        <div key={optIdx} className="flex gap-3 items-center">
                          {/* Option Badge A, B, C */}
                          <div className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/10 bg-white/5 text-indigo-300 font-bold select-none text-sm shrink-0">
                            {opt.id}
                          </div>

                          {/* Option text input */}
                          <input 
                            type="text" 
                            value={opt.text}
                            onChange={(e) => updateOptionField(qIdx, optIdx, 'text', e.target.value)}
                            placeholder="Option text"
                            className="glass-input flex-1"
                          />

                          {/* Correct option toggle */}
                          <label className="flex items-center gap-2 cursor-pointer select-none px-2 py-1 rounded hover:bg-white/5 transition-colors">
                            <input 
                              type={q.input_type === 'MCQ' ? 'radio' : 'checkbox'}
                              name={`correct-choice-${qIdx}`}
                              checked={opt.isCorrect}
                              onChange={(e) => updateOptionField(qIdx, optIdx, 'isCorrect', e.target.checked)}
                              className="custom-checkbox text-indigo-600 border-slate-800 focus:ring-indigo-500 rounded"
                            />
                            <span className="text-xs font-semibold text-slate-400">Correct</span>
                          </label>

                          {/* Option Delete Button */}
                          {q.options_config.length > 2 && (
                            <button 
                              type="button" 
                              onClick={() => removeOption(qIdx, optIdx)}
                              className="action-btn action-delete shrink-0"
                              title="Delete option"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Add option button */}
                    <button 
                      type="button" 
                      onClick={() => addOption(qIdx)}
                      className="btn-primary mt-2 select-none border-dashed"
                      style={{ background: 'transparent', borderColor: 'rgba(255, 255, 255, 0.2)', color: 'var(--color-text-muted)', fontSize: '11px', padding: '4px 12px' }}
                    >
                      + Add Option
                    </button>
                  </div>
                )}

              </div>
            ))}

            {/* Add Question Button */}
            <div className="text-center py-6">
              <button 
                type="button" 
                onClick={addQuestion}
                className="btn-primary select-none inline-flex items-center gap-2"
                style={{ background: 'var(--glass-bg)', borderColor: 'var(--color-accent)', color: 'var(--color-accent)' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Add Another Question</span>
              </button>
            </div>

            {/* Sticky Save Footer */}
            <div className="fixed bottom-0 left-0 md:left-[240px] right-0 bg-slate-950/75 backdrop-blur-xl border-t border-slate-800/40 p-5 z-40 flex justify-center transition-all duration-300">
              <button 
                type="button" 
                disabled={isLoading}
                onClick={saveQuestions}
                className="btn-primary submit-btn w-full max-w-[320px] shadow-lg shadow-indigo-600/15"
              >
                {isLoading ? (
                  <>
                    <div className="spinner mr-2 border-2" style={{ width: '16px', height: '16px' }} />
                    <span>Saving questions...</span>
                  </>
                ) : (
                  <>
                    <span>Save All Questions</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                      <polyline points="17 21 17 13 7 13 7 21" />
                      <polyline points="7 3 7 8 15 8" />
                    </svg>
                  </>
                )}
              </button>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getInfluencerById, createInfluencer, updateInfluencer } from '@/services/adminApi';
import { useCharacterStore } from '@/store/characterStore';

export default function InfluencerFormPage({ params }: { params: { id?: string[] } }) {
  const router = useRouter();
  
  // Extract optional id from catch-all dynamic path array
  const influencerId = params.id && params.id[0];
  const isEditMode = !!influencerId;

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [commissionPercentage, setCommissionPercentage] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  
  // Validation touch trackers
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phone: false,
    referralCode: false,
  });

  // Mascot Zustand Store hooks
  const { setEmotion, speak } = useCharacterStore();

  // Validate phone number formatting (strictly 10 to 15 digits/characters)
  const isPhoneValid = (val: string) => /^[+0-9\s()-.]{10,15}$/.test(val);
  
  // Validate email address pattern
  const isEmailValid = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  // Auto-generate Referral Code when Name or Discount changes (Only in Create Mode)
  useEffect(() => {
    if (isEditMode) return;
    
    if (!name) {
      setReferralCode('');
      return;
    }

    // Take first word, remove non-alphabetic chars, uppercase
    const cleanName = name.split(' ')[0].replace(/[^a-zA-Z]/g, '').toUpperCase();
    const discountStr = discountPercentage > 0 ? discountPercentage.toString() : '';
    setReferralCode(`${cleanName}${discountStr}`);
  }, [name, discountPercentage, isEditMode]);

  // Load influencer details on edit mode mount
  useEffect(() => {
    if (!isEditMode || !influencerId) return;

    async function loadDetails(id: string) {
      try {
        setIsLoading(true);
        const response = await getInfluencerById(id);
        if (response.success && response.data) {
          const user = response.data;
          setName(user.name || '');
          setEmail(user.email || '');
          setPhone(user.phone || '');
          setReferralCode(user.influencer_profile?.referral_code || '');
          setDiscountPercentage(user.influencer_profile?.discount_percentage || 0);
          setCommissionPercentage(user.influencer_profile?.commission_percentage || 0);
          setIsActive(user.is_active !== false);
        }
      } catch (err) {
        console.error('Failed to load influencer details', err);
        speak('Error! Failed to retrieve influencer details.', 4000);
        router.push('/admin/affiliates');
      } finally {
        setIsLoading(false);
      }
    }

    loadDetails(influencerId);
  }, [isEditMode, influencerId, router]);

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all as touched
    setTouched({ name: true, email: true, phone: true, referralCode: true });

    // Validations
    if (!name) return;
    if (!email || !isEmailValid(email)) return;
    if (!phone || !isPhoneValid(phone)) return;
    if (!referralCode || referralCode.length < 3) return;

    try {
      setIsLoading(true);
      setEmotion('thinking');

      const payload = {
        name,
        email,
        phone,
        is_active: isActive,
        referral_code: referralCode,
        discount_percentage: Number(discountPercentage),
        commission_percentage: Number(commissionPercentage),
      };

      if (isEditMode && influencerId) {
        const response = await updateInfluencer(influencerId, payload);
        if (response.success) {
          setEmotion('celebrating');
          speak('Success! Influencer configurations updated successfully.', 4000);
          router.push('/admin/affiliates');
        }
      } else {
        const response = await createInfluencer(payload);
        if (response.success) {
          setEmotion('celebrating');
          speak('Success! New influencer created. Access credentials dispatched.', 4000);
          router.push('/admin/affiliates');
        }
      }
    } catch (err: any) {
      console.error('Failed to save influencer', err);
      const msg = err.response?.data?.message || 'Failed to submit influencer configurations.';
      speak(`Error! ${msg}`, 4000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlur = (field: 'name' | 'email' | 'phone' | 'referralCode') => {
    setTouched({ ...touched, [field]: true });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl">
      
      {/* Page Header */}
      <div className="page-header select-none">
        <div className="header-content">
          <h1 className="page-title">{isEditMode ? 'Edit Influencer' : 'Configure New Influencer'}</h1>
          <p className="page-subtitle text-slate-400">
            Setup referral codes and financial percentages for your affiliate partners.
          </p>
        </div>
        
        <button 
          type="button" 
          onClick={() => router.push('/admin/affiliates')}
          className="action-btn back-btn"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to List
        </button>
      </div>

      {/* Form Card Container */}
      <div className="glass-card form-container">
        
        {/* Processing Spinner Overlay */}
        {isLoading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p className="text-sm font-semibold tracking-wide text-indigo-300">Processing details...</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-grid">
            
            {/* Input 1: Name */}
            <div className="glass-form-group">
              <label className="glass-label">Full Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => handleBlur('name')}
                placeholder="Influencer's real name"
                className="glass-input" 
              />
              {touched.name && !name && (
                <span className="error-text">Name is required.</span>
              )}
            </div>

            {/* Input 2: Email */}
            <div className="glass-form-group">
              <label className="glass-label">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur('email')}
                placeholder="contact@influencer.com"
                disabled={isEditMode}
                className="glass-input disabled:opacity-50 disabled:cursor-not-allowed" 
              />
              {touched.email && (!email || !isEmailValid(email)) && (
                <span className="error-text">A valid email address is required.</span>
              )}
              {isEditMode && (
                <small className="helper-text select-none text-amber-450">Email cannot be changed after account creation.</small>
              )}
            </div>

            {/* Input 3: Phone */}
            <div className="glass-form-group">
              <label className="glass-label">Phone Number</label>
              <input 
                type="text" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onBlur={() => handleBlur('phone')}
                placeholder="+1 (555) 000-0000"
                className="glass-input" 
              />
              {touched.phone && (!phone || !isPhoneValid(phone)) && (
                <span className="error-text">A valid phone number is required (10-15 characters).</span>
              )}
            </div>

            {/* Input 4: Unique Referral Code */}
            <div className="glass-form-group">
              <label className="glass-label">Unique Referral Code</label>
              <input 
                type="text" 
                value={referralCode}
                readOnly
                placeholder="Auto-generated..."
                className="glass-input cursor-not-allowed bg-white/[0.02] font-bold tracking-wider select-all" 
                style={{ textTransform: 'uppercase' }}
              />
              <span className="helper-text select-none">
                This code is automatically generated based on the name and discount.
              </span>
            </div>

          </div>

          <div className="form-grid pt-2">
            
            {/* Input 5: Student Discount (%) */}
            <div className="glass-form-group">
              <label className="glass-label">Student Discount (%)</label>
              <div className="relative">
                <input 
                  type="number" 
                  min={0}
                  max={100}
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(Math.max(0, Math.min(100, Number(e.target.value))))}
                  className="glass-input pr-10" 
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold select-none">%</span>
              </div>
            </div>

            {/* Input 6: Influencer Commission (%) */}
            <div className="glass-form-group">
              <label className="glass-label">Influencer Commission (%)</label>
              <div className="relative">
                <input 
                  type="number" 
                  min={0}
                  max={100}
                  value={commissionPercentage}
                  onChange={(e) => setCommissionPercentage(Math.max(0, Math.min(100, Number(e.target.value))))}
                  className="glass-input pr-10" 
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold select-none">%</span>
              </div>
            </div>

          </div>

          {/* Active Status Checkbox */}
          <div className="glass-form-group flex items-center gap-3 select-none">
            <input 
              type="checkbox" 
              id="activeCheck" 
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="custom-checkbox h-5 w-5 rounded border border-slate-800 bg-slate-950/20 text-indigo-600 focus:ring-indigo-500" 
            />
            <label htmlFor="activeCheck" className="text-sm font-semibold text-slate-200 cursor-pointer">
              Account is Active and Referral Code is valid
            </label>
          </div>

          <hr className="form-divider border-slate-800/40 my-6" />

          {/* Form Actions */}
          <div className="form-actions select-none">
            <button 
              type="submit" 
              disabled={isLoading}
              className="btn-primary submit-btn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              <span>{isEditMode ? 'Update Configuration' : 'Create & Send Credentials'}</span>
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}

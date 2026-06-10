'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getAdminProfile, 
  updateProfile, 
  uploadDocument, 
  getDocumentUrl 
} from '@/services/adminApi';
import { User } from '@/types/admin-lms';

export default function ProfileSettingsPage() {
  const router = useRouter();
  
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form states
  const [displayName, setDisplayName] = useState('');
  const [avatarDocId, setAvatarDocId] = useState<string | null>(null);
  
  // Image Preview & Upload States
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // UI Feedback
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const userProfile = await getAdminProfile();
        setProfile(userProfile);
        setDisplayName(userProfile.display_name || userProfile.name || '');
        setAvatarDocId(userProfile.avatar_doc_id || null);

        if (userProfile.avatar_doc_id) {
          const docRes = await getDocumentUrl(userProfile.avatar_doc_id);
          if (docRes.success && docRes.data.url) {
            setAvatarPreview(docRes.data.url);
          }
        }
      } catch (err) {
        console.error('Failed to load profile', err);
        setMessage({ type: 'error', text: 'Failed to load profile data.' });
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, []);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Create local preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      let finalAvatarDocId = avatarDocId;

      // 1. Upload new image if selected
      if (selectedFile) {
        const uploadRes = await uploadDocument(selectedFile);
        if (uploadRes.success && uploadRes.data && uploadRes.data._id) {
          finalAvatarDocId = uploadRes.data._id;
          setAvatarDocId(finalAvatarDocId);
        } else {
          throw new Error('Failed to upload avatar image.');
        }
      }

      // 2. Update profile data
      const updateRes = await updateProfile({
        display_name: displayName,
        avatar_doc_id: finalAvatarDocId || undefined
      });

      if (updateRes.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setSelectedFile(null); // Clear selected file after successful save
        
        // Slight delay, then reload to ensure header updates
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        throw new Error('Profile update failed.');
      }
    } catch (err: any) {
      console.error('Save failed:', err);
      setMessage({ type: 'error', text: err.message || 'An error occurred while saving.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Helper for initial avatar if no image exists
  const getInitials = () => {
    if (!profile?.name) return 'AD';
    return profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-8">
      {/* Page Header */}
      <div className="page-header animate-header select-none">
        <div className="header-content">
          <div className="page-label-wrap">
            <span className="page-label-root">Settings</span>
            <span className="page-label-sep">›</span>
            <span className="page-label-current">My Profile</span>
          </div>
          <h1 className="page-title">Profile Settings</h1>
          <p className="page-subtitle">Manage your personal information and avatar</p>
        </div>
      </div>

      {/* Main Glass Card */}
      <div 
        className="glass-card animate-card-enter rounded-2xl overflow-hidden relative"
        style={{ backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--glass-border)' }}
      >
        <form onSubmit={handleSave} className="p-8 pt-6">
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
            
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-3">
              <div 
                className="relative w-28 h-28 rounded-full cursor-pointer group shadow-xl"
                onClick={handleFileClick}
              >
                {/* Avatar Display */}
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Avatar Preview" 
                    className="w-full h-full rounded-full object-cover border-[3px] border-[var(--glass-border)] shadow-sm transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-[var(--color-brand-blue)] to-[var(--color-sky-blue)] flex items-center justify-center text-3xl font-bold text-white shadow-sm transition-transform duration-300 group-hover:scale-[1.02]">
                    {getInitials()}
                  </div>
                )}
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>

                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden"
                />
              </div>
              <p className="text-[10px] font-bold text-[var(--color-text-subtle)] uppercase tracking-wider text-center">
                Click to Change
              </p>
            </div>

            {/* Form Fields Section */}
            <div className="flex-1 w-full space-y-5 mt-2">
              
              <div className="glass-form-group">
                <label className="glass-label text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Display Name</label>
                <input 
                  type="text" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="glass-input mt-1" 
                  placeholder="Enter your display name"
                />
                <span className="helper-text mt-1 text-[11px]">This is how your name will appear across the LMS.</span>
              </div>

              <div className="glass-form-group opacity-70">
                <label className="glass-label text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Email Address</label>
                <input 
                  type="email" 
                  value={profile?.email || ''}
                  readOnly
                  className="glass-input mt-1 bg-black/5 cursor-not-allowed" 
                />
                <span className="helper-text mt-1 text-[11px]">Email cannot be changed directly. Contact an administrator.</span>
              </div>

              <div className="glass-form-group opacity-70">
                <label className="glass-label text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">System Role</label>
                <input 
                  type="text" 
                  value={profile?.role ? profile.role.replace('_', ' ').toUpperCase() : ''}
                  readOnly
                  className="glass-input mt-1 bg-black/5 cursor-not-allowed uppercase font-semibold text-[var(--color-text-muted)]" 
                />
              </div>

            </div>
          </div>

          {/* Feedback Message */}
          {message && (
            <div className={`mt-6 p-3 rounded-lg flex items-center gap-3 border ${
              message.type === 'success' 
                ? 'bg-[var(--color-success)]/10 border-[var(--color-success)]/30 text-[var(--color-success)]' 
                : 'bg-red-500/10 border-red-500/30 text-red-500'
            }`}>
              {message.type === 'success' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              )}
              <span className="font-medium text-[13px]">{message.text}</span>
            </div>
          )}

          {/* Form Actions */}
          <div className="mt-8 pt-6 border-t border-dashed border-[var(--glass-border)] flex justify-end">
            <button 
              type="submit" 
              disabled={isSaving}
              className="btn-primary w-full md:w-auto min-w-[160px] py-2.5 text-sm"
            >
              {isSaving ? (
                <>
                  <div className="spinner mr-2" style={{ width: '16px', height: '16px', borderWidth: '2px', marginBottom: 0 }}></div>
                  Saving...
                </>
              ) : (
                'Save Profile'
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

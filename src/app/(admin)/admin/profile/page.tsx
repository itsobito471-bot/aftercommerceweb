'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getAdminProfile, 
  updateProfile, 
  uploadDocument, 
  getDocumentUrl,
  setup2FAProfile,
  verify2FAProfile,
  disable2FAProfile
} from '@/services/adminApi';
import { User } from '@/types/admin-lms';
import ConfirmModal from '@/components/ConfirmModal';

export default function ProfileSettingsPage() {
  const router = useRouter();
  
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form states
  const [displayName, setDisplayName] = useState('');
  const [avatarDocId, setAvatarDocId] = useState<string | null>(null);

  // 2FA Setup States
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [isSettingUp2FA, setIsSettingUp2FA] = useState(false);
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [isDisabling2FA, setIsDisabling2FA] = useState(false);
  
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

  const handleSetup2FA = async () => {
    try {
      setIsSettingUp2FA(true);
      setMessage(null);
      const res = await setup2FAProfile();
      if (res.success && res.qrCodeImage) {
        setQrCode(res.qrCodeImage);
        setShow2FASetup(true);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to setup 2FA.' });
    } finally {
      setIsSettingUp2FA(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!twoFactorCode || twoFactorCode.length !== 6) {
      setMessage({ type: 'error', text: 'Please enter a valid 6-digit code.' });
      return;
    }
    try {
      setIsVerifying2FA(true);
      setMessage(null);
      const res = await verify2FAProfile(twoFactorCode);
      if (res.success) {
        setMessage({ type: 'success', text: '2FA successfully enabled!' });
        setShow2FASetup(false);
        if (profile) setProfile({ ...profile, is_two_factor_enabled: true });
        setTwoFactorCode('');
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Invalid 2FA code.' });
    } finally {
      setIsVerifying2FA(false);
    }
  };

  const handleDisable2FA = () => {
    setShowDisableConfirm(true);
  };

  const confirmDisable2FA = async () => {
    try {
      setIsDisabling2FA(true);
      setMessage(null);
      const res = await disable2FAProfile();
      if (res.success) {
        setMessage({ type: 'success', text: '2FA successfully disabled.' });
        if (profile) setProfile({ ...profile, is_two_factor_enabled: false });
        setShowDisableConfirm(false);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to disable 2FA.' });
    } finally {
      setIsDisabling2FA(false);
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

          {/* Security & 2FA Section */}
          <div className="mt-8 pt-8 border-t border-dashed border-[var(--glass-border)]">
            <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider mb-1">Two-Factor Authentication</h3>
                <p className="text-xs text-[var(--color-text-muted)] max-w-lg">
                  Protect your account with an extra layer of security. Once configured, you'll be required to enter both your password and an authentication code from your mobile app to sign in.
                </p>
              </div>
              
              <div className="shrink-0">
                {profile?.is_two_factor_enabled ? (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/20 rounded-lg font-medium text-xs tracking-wide">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      2FA Enabled
                    </div>
                    <button 
                      type="button" 
                      onClick={handleDisable2FA}
                      className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white rounded-lg font-medium text-xs tracking-wide transition-all duration-300"
                    >
                      Disable
                    </button>
                  </div>
                ) : (
                  <button 
                    type="button"
                    onClick={handleSetup2FA}
                    disabled={isSettingUp2FA || show2FASetup}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-accent)] border border-transparent hover:bg-transparent hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] text-white rounded-lg font-medium text-xs tracking-wide transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSettingUp2FA ? 'Setting up...' : 'Enable 2FA'}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* 2FA Setup Flow (QR Code) */}
            {show2FASetup && qrCode && !profile?.is_two_factor_enabled && (
              <div className="mt-6 p-6 rounded-xl border border-[var(--glass-border)] bg-[var(--color-bg-deep)]/50 flex flex-col md:flex-row gap-8 items-center animate-fade-in">
                <div className="shrink-0 p-3 bg-white rounded-xl shadow-md border border-gray-100">
                  <img src={qrCode} alt="2FA QR Code" className="w-40 h-40 object-contain" />
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">Scan this QR Code</h4>
                    <p className="text-xs text-[var(--color-text-subtle)] leading-relaxed">
                      Use an authenticator app like Google Authenticator, Authy, or 1Password to scan this QR code. Then, enter the generated 6-digit code below to verify and enable 2FA.
                    </p>
                  </div>
                  
                  <div className="flex gap-3 max-w-sm">
                    <input 
                      type="text" 
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      className="glass-input flex-1 text-center font-mono tracking-[0.5em] text-lg py-2"
                    />
                    <button 
                      type="button"
                      onClick={handleVerify2FA}
                      disabled={twoFactorCode.length !== 6 || isVerifying2FA}
                      className="btn-primary px-6 py-2 shrink-0 text-sm"
                    >
                      {isVerifying2FA ? 'Verifying...' : 'Verify'}
                    </button>
                  </div>
                </div>
              </div>
            )}
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

      {/* 2FA Disable Confirmation Modal */}
      <ConfirmModal
        isOpen={showDisableConfirm}
        title="Disable 2FA?"
        message="Are you sure you want to disable 2FA? This will reduce the security of your account."
        confirmText="Disable 2FA"
        cancelText="Cancel"
        type="danger"
        isLoading={isDisabling2FA}
        onConfirm={confirmDisable2FA}
        onCancel={() => setShowDisableConfirm(false)}
      />
    </div>
  );
}

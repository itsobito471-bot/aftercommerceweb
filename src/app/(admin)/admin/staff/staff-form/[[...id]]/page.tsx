'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getAvailablePermissions, 
  getStaffById, 
  createStaff, 
  updateStaff 
} from '@/services/adminApi';
import { User } from '@/types/admin-lms';
import { useCharacterStore } from '@/store/characterStore';

interface PermissionItem {
  label: string;
  value: string;
}

/**
 * Staff Add/Edit Form page
 * Manages administrative team member details, role selection, and dynamic module permission assignments
 */
export default function StaffFormPage({ params }: { params: { id?: string[] } }) {
  const router = useRouter();
  
  // Extract optional id from catch-all dynamic path array
  const staffId = params.id && params.id[0];
  const isEditMode = !!staffId;

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'staff' | 'admin'>('staff');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // Telemetry list configurations
  const [availablePermissions, setAvailablePermissions] = useState<PermissionItem[]>([]);
  
  // Validation touch trackers
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phone: false,
  });

  // UI state toggles
  const [isLoading, setIsLoading] = useState(false);

  // Mascot Zustand Store hooks
  const { setEmotion, speak } = useCharacterStore();

  // Validate phone number formatting (strictly 10 digits)
  const isPhoneValid = (val: string) => /^[0-9]{10}$/.test(val);
  
  // Validate email address pattern
  const isEmailValid = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  // Parse permissions from standard "module:action" to "Module: Action" label formats
  const formatPermissionLabel = (perm: string): string => {
    const parts = perm.split(':');
    if (parts.length === 2) {
      const moduleStr = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
      const actionStr = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
      return `${moduleStr}: ${actionStr}`;
    }
    return perm;
  };

  // Fetch available permission lists from the backend
  useEffect(() => {
    async function loadPermissions() {
      try {
        const response = await getAvailablePermissions();
        if (response.success && response.data) {
          const formatted = response.data.map((perm) => ({
            label: formatPermissionLabel(perm),
            value: perm,
          }));
          setAvailablePermissions(formatted);
        }
      } catch (err) {
        console.error('Failed to load permissions list', err);
      }
    }

    loadPermissions();
  }, []);

  // Fetch staff member details on edit mode mount
  useEffect(() => {
    if (!isEditMode || !staffId) return;

    async function loadStaffDetails(id: string) {
      try {
        setIsLoading(true);
        const response = await getStaffById(id);
        if (response.success && response.data) {
          const user = response.data;
          setName(user.name);
          setEmail(user.email);
          setPhone(user.phone);
          setRole(user.role === 'admin' || user.role === 'super_admin' ? 'admin' : 'staff');
          setSelectedPermissions((user.permissions as string[]) || []);
        }
      } catch (err) {
        console.error('Failed to load staff details', err);
        speak('Error! Failed to retrieve team member details.', 4000);
        router.push('/admin/staff');
      } finally {
        setIsLoading(false);
      }
    }

    loadStaffDetails(staffId);
  }, [isEditMode, staffId, router]);

  // Handle toggling of permissions cards
  const togglePermission = (val: string) => {
    if (selectedPermissions.includes(val)) {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== val));
    } else {
      setSelectedPermissions([...selectedPermissions, val]);
    }
  };

  const hasPermission = (val: string) => selectedPermissions.includes(val);

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all as touched for validation alerts
    setTouched({ name: true, email: true, phone: true });

    // Validate parameters
    if (!name) return;
    if (!email || !isEmailValid(email)) return;
    if (!phone || !isPhoneValid(phone)) return;

    try {
      setIsLoading(true);
      setEmotion('thinking');

      // Super Admins don't store individual permissions
      const payload: Partial<User> = {
        name,
        email,
        phone,
        role,
        permissions: role === 'admin' ? [] : selectedPermissions,
      };

      if (isEditMode && staffId) {
        const response = await updateStaff(staffId, payload);
        if (response.success) {
          setEmotion('celebrating');
          speak('Success! Staff member details updated successfully.', 4000);
          router.push('/admin/staff');
        }
      } else {
        const response = await createStaff(payload);
        if (response.success) {
          setEmotion('celebrating');
          speak('Success! Staff member created. Invite email sent!', 4000);
          router.push('/admin/staff');
        }
      }
    } catch (err: any) {
      console.error('Failed to save staff member', err);
      const msg = err.response?.data?.message || 'Failed to submit staff parameters.';
      speak(`Error! ${msg}`, 4000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlur = (field: 'name' | 'email' | 'phone') => {
    setTouched({ ...touched, [field]: true });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Page Header */}
      <div className="page-header select-none">
        <div className="header-content">
          <h1 className="page-title">{isEditMode ? 'Edit Staff Member' : 'Add Staff Member'}</h1>
          <p className="page-subtitle text-slate-400">
            {isEditMode 
              ? 'Update account details, role, and module permissions.' 
              : 'Create a new administrative account and send an email invite link.'}
          </p>
        </div>
        
        <button 
          type="button" 
          onClick={() => router.push('/admin/staff')}
          className="action-btn back-btn"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Team
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
                placeholder="John Doe"
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
                placeholder="john@company.com"
                disabled={isEditMode}
                className="glass-input disabled:opacity-50 disabled:cursor-not-allowed" 
              />
              {touched.email && (!email || !isEmailValid(email)) && (
                <span className="error-text">A valid email address is required.</span>
              )}
              {!isEditMode && (
                <small className="helper-text select-none">An invite link will be sent here.</small>
              )}
            </div>

            {/* Input 3: Phone */}
            <div className="glass-form-group">
              <label className="glass-label">Phone Number</label>
              <input 
                type="text" 
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                onBlur={() => handleBlur('phone')}
                placeholder="9876543210"
                maxLength={10}
                className="glass-input" 
              />
              {touched.phone && (!phone || !isPhoneValid(phone)) && (
                <span className="error-text">A valid 10-digit phone number is required.</span>
              )}
            </div>

            {/* Input 4: Role selection */}
            <div className="glass-form-group">
              <label className="glass-label">System Role</label>
              <select 
                value={role}
                onChange={(e) => {
                  const val = e.target.value as 'staff' | 'admin';
                  setRole(val);
                  if (val === 'admin') {
                    setSelectedPermissions([]);
                  }
                }}
                className="glass-select"
              >
                <option value="staff">Staff (Restricted Access)</option>
                <option value="admin">Super Admin (Full Access)</option>
              </select>
            </div>

          </div>

          {/* Module Permissions Grid (rendered only for RESTRICTED staff roles) */}
          {role === 'staff' && (
            <div className="permissions-section border-t border-slate-800/40 pt-6 animate-fade-in">
              <label className="glass-label mb-4 block select-none">Module Permissions</label>
              
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                {availablePermissions.map((perm) => {
                  const isActive = hasPermission(perm.value);
                  return (
                    <div 
                      key={perm.value} 
                      onClick={() => togglePermission(perm.value)}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-950/20 p-3 select-none hover:bg-slate-900/40 hover:border-slate-700/60 transition-all ${
                        isActive ? 'border-indigo-500/50 bg-indigo-500/5 shadow-md shadow-indigo-500/5' : ''
                      }`}
                    >
                      <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border border-slate-700 transition-colors ${
                        isActive ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950/40'
                      }`}>
                        {isActive && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-slate-350 truncate">{perm.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Form actions submitting button */}
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
              <span>{isEditMode ? 'Save Changes' : 'Create & Send Invite'}</span>
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}

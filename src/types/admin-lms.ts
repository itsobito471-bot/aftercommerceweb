/**
 * Learning Management System (LMS) Admin Enterprise Type Definitions
 */

// User Roles
export type UserRole = 'super_admin' | 'admin' | 'staff' | 'student' | 'influencer';

// Permission Types
export type Permission =
  | 'course:view'
  | 'course:create'
  | 'course:edit'
  | 'course:delete'
  | 'content:manage'
  | 'user:view'
  | 'user:edit'
  | 'user:block'
  | 'team:view'
  | 'team:create'
  | 'team:edit'
  | 'finance:view'
  | 'finance:payout'
  | 'finance:refund'
  | 'marketing:view'
  | 'marketing:edit'
  | 'coupon:manage'
  | 'community:view'
  | 'community:moderate'
  | 'settings:manage';

// Onboarding & Preferences
export interface UserPreferences {
  email_reminders: boolean;
  new_courses: boolean;
}

// Influencer Metrics & Profile
export interface InfluencerMetrics {
  total_referrals: number;
  total_earnings: number;
  pending_payout: number;
}

export interface InfluencerProfile {
  referral_code?: string;
  discount_percentage?: number;
  commission_percentage?: number;
  metrics: InfluencerMetrics;
}

// Full User Entity Model (matching Mongoose User schema & admin requirements)
export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  permissions: Permission[] | string[];
  is_onboarded: boolean;
  is_blocked: boolean;
  
  // 2FA Setup Parameters
  is_two_factor_enabled: boolean;
  two_factor_secret?: string | null;
  backup_codes?: string[];

  // Referral & Wallet parameters
  referral_code?: string;
  referred_by_id?: string | null;
  commission_rate?: number | null;
  
  // Dual-state wallet parameters
  wallet_balance: number;
  pending_balance: number;
  commission_percentage?: number;

  // Profiles and Settings
  influencer_profile?: InfluencerProfile;
  notification_preferences: UserPreferences;

  // Metadata timestamps
  createdAt: string;
  updatedAt: string;
}

// Category Entity
export interface Category {
  _id: string;
  name: string;
  slug: string;
  is_active: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Course Pricing Metadata
export interface CoursePricing {
  is_free: boolean;
  regular_price?: number;
  discounted_price?: number;
}

// Course Structure & Validity
export type CourseStructureMode = 'linear' | 'flexible';
export type PostCompletionAccess = 'RETAIN' | 'REVOKE';

// Full Course Entity Model (matching Mongoose Course Schema)
export interface Course {
  _id: string;
  category_id: string | Category; // populated or raw reference ID
  title: string;
  slug: string; // Automated SEO slug tracking
  pricing: CoursePricing;
  validity_days: number;
  structure_mode: CourseStructureMode;
  is_published: boolean;
  
  // Post-Completion parameters
  post_completion_access: PostCompletionAccess;
  thank_you_message?: string; // HTML content
  issues_certificate: boolean;
  is_certificate_enabled: boolean;
  certificate_template_id?: string | null;

  createdAt: string;
  updatedAt: string;
}

// Pagination Wrapper Scheme matching Mongoose pagination response
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    totalDocs: number;
    limit: number;
    page: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// KYC Status Decisions
export type KycStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// Custom Field Types
export type KycInputType = 'TEXT' | 'NUMBER' | 'DROPDOWN' | 'FILE';

export interface KycField {
  _id: string;
  label: string;
  input_type: KycInputType;
  options: string[];
  is_required: boolean;
  order_index: number;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Student KYC Submission
export interface KycDocumentValue {
  field_id: string | KycField;
  value: string; // File URL or text input
}

export interface UserKycRecord {
  _id: string;
  user_id: string | User;
  verification_status: KycStatus;
  submitted_documents: KycDocumentValue[];
  admin_feedback?: string | null;
  createdAt: string;
  updatedAt: string;
}

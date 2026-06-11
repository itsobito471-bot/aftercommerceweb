import axios from 'axios';
import { User, Course as AdminCourse, PaginatedResponse, UserKycRecord, Category } from '../types/admin-lms';
import { Course, Module, LearningUnit } from '../types/course';

// Base backend URL config
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

// Central Axios client instance for LMS administration
export const adminApi = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Cookie Retrieval Utility
 * Retrieves value of standard client-side browser cookies
 */
const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
};

/**
 * Token Retrieval Hook
 * Pulls auth token from localStorage or document cookies
 */
const getAdminToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('admin_token') || getCookie('admin_token');
  } catch (e) {
    return getCookie('admin_token');
  }
};

/**
 * Base64 Query String Encoder
 * Encodes query objects to standardized Base64 formats for filter contracts
 */
export const encodeQuery = (obj: Record<string, unknown>): string => {
  const jsonStr = JSON.stringify(obj);
  if (typeof window !== 'undefined') {
    // Unicode-safe Base64 encoding in the browser
    return btoa(encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (_, p1) => {
      return String.fromCharCode(parseInt(p1, 16));
    }));
  }
  // Server-side (Node.js) Base64 encoding
  return Buffer.from(jsonStr).toString('base64');
};

// Request Interceptor: Inject Authorization Header automatically
adminApi.interceptors.request.use(
  (config) => {
    const token = getAdminToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Catch auth errors (401/403) and clear session
adminApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status } = error.response;
      if (status === 401 || status === 403) {
        if (typeof window !== 'undefined') {
          // Clear authentication tokens from client storage
          localStorage.removeItem('admin_token');
          localStorage.removeItem('me');
          document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict; Secure';
          // Redirect the administrator back to the login interface
          window.location.href = '/admin-login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// ==========================================
// 1. AUTHENTICATION & SESSION MANAGEMENT
// ==========================================

export const login = async (data: Record<string, unknown>): Promise<{ success: boolean; token: string; message?: string }> => {
  const response = await adminApi.post<{ success: boolean; token: string; message?: string }>('/api/admin/auth/login', data);
  return response.data;
};

export const verify2FA = async (
  data: Record<string, unknown>,
  tempToken: string
): Promise<{ success: boolean; token: string }> => {
  const response = await adminApi.post<{ success: boolean; token: string }>(
    '/api/admin/auth/login/2fa',
    data,
    {
      headers: {
        Authorization: `Bearer ${tempToken}`,
      },
    }
  );
  return response.data;
};

export const completeSetup = async (data: Record<string, unknown>): Promise<{ success: boolean; message: string }> => {
  const response = await adminApi.post<{ success: boolean; message: string }>('/api/admin/auth/complete-setup', data);
  return response.data;
};

export const logout = async (): Promise<{ success: boolean }> => {
  const response = await adminApi.post<{ success: boolean }>('/api/admin/auth/logout', {});
  return response.data;
};

export const getDashboardStats = async () => {
  const response = await adminApi.get('/api/admin/dashboard');
  return response.data.data;
};

export const getAdminProfile = async (): Promise<User> => {
  const response = await adminApi.get<{ success: boolean; data: User }>('/api/admin/users/me');
  return response.data.data;
};

export const UserDetails = async (): Promise<User> => {
  return getAdminProfile();
};

export const getMe = (): User | null => {
  if (typeof window === 'undefined') return null;
  const meData = localStorage.getItem('me');
  if (meData) {
    try {
      return JSON.parse(decodeURIComponent(atob(meData)));
    } catch (e) {
      return null;
    }
  }
  return null;
};

export const setup2FAProfile = async (): Promise<{ success: boolean; qrCodeImage: string; secret: string }> => {
  const response = await adminApi.post<{ success: boolean; qrCodeImage: string; secret: string }>('/api/admin/auth/2fa/setup');
  return response.data;
};

export const verify2FAProfile = async (code: string): Promise<{ success: boolean; message: string }> => {
  const response = await adminApi.post<{ success: boolean; message: string }>('/api/admin/auth/2fa/verify', { code });
  return response.data;
};

export const disable2FAProfile = async (): Promise<{ success: boolean; message: string }> => {
  const response = await adminApi.post<{ success: boolean; message: string }>('/api/admin/auth/2fa/disable', {});
  return response.data;
};

// ==========================================
// 2. STAFF / TEAM DIRECTORY MANAGEMENT
// ==========================================

export const getStaffList = async (params = ''): Promise<{ success: boolean; data: User[] }> => {
  const response = await adminApi.get<{ success: boolean; data: User[] }>(`/api/admin/users${params}`);
  return response.data;
};

export const getStaffById = async (id: string): Promise<{ success: boolean; data: User }> => {
  const response = await adminApi.get<{ success: boolean; data: User }>(`/api/admin/users/${id}`);
  return response.data;
};

export const createStaff = async (data: Partial<User>): Promise<{ success: boolean; data: User }> => {
  const response = await adminApi.post<{ success: boolean; data: User }>('/api/admin/team', data);
  return response.data;
};

export const updateStaff = async (id: string, data: Partial<User>): Promise<{ success: boolean; data: User }> => {
  const response = await adminApi.put<{ success: boolean; data: User }>(`/api/admin/users/${id}`, data);
  return response.data;
};

export const deleteStaff = async (id: string): Promise<{ success: boolean }> => {
  const response = await adminApi.delete<{ success: boolean }>(`/api/admin/users/${id}`);
  return response.data;
};

export const getAvailablePermissions = async (): Promise<{ success: boolean; data: string[] }> => {
  const response = await adminApi.get<{ success: boolean; data: string[] }>('/api/admin/permissions');
  return response.data;
};

// ==========================================
// 3. COURSE CATALOG MANAGEMENT
// ==========================================

export const getCourses = async (
  page = 1,
  limit = 10,
  filters: Record<string, unknown> = {}
): Promise<PaginatedResponse<AdminCourse>> => {
  const queryPayload = {
    page,
    limit,
    ...filters,
  };
  const encodedQuery = encodeQuery(queryPayload);
  const response = await adminApi.get<PaginatedResponse<AdminCourse>>(
    `/api/admin/courses/filter?q=${encodedQuery}`
  );
  return response.data;
};

export const createCourse = async (payload: Partial<AdminCourse>): Promise<AdminCourse> => {
  const response = await adminApi.post<{ success: boolean; data: AdminCourse }>('/api/admin/courses', payload);
  return response.data.data;
};

// ==========================================
// 4. CATEGORY MANAGEMENT
// ==========================================

export const getCategories = async (params = ''): Promise<PaginatedResponse<Category>> => {
  const response = await adminApi.get<PaginatedResponse<Category>>(`/api/admin/categories/filter${params}`);
  return response.data;
};
export const getCategoryById = async (id: string): Promise<{ success: boolean; data: Category }> => {
  const response = await adminApi.get<{ success: boolean; data: Category }>(`/api/admin/categories/${id}`);
  return response.data;
};

export const createCategory = async (data: Partial<Category>): Promise<{ success: boolean; data: Category }> => {
  const response = await adminApi.post<{ success: boolean; data: Category }>('/api/admin/categories', data);
  return response.data;
};

export const updateCategory = async (id: string, data: Partial<Category>): Promise<{ success: boolean; data: Category }> => {
  const response = await adminApi.put<{ success: boolean; data: Category }>(`/api/admin/categories/${id}`, data);
  return response.data;
};

export const deleteCategory = async (id: string): Promise<{ success: boolean }> => {
  const response = await adminApi.delete<{ success: boolean }>(`/api/admin/categories/${id}`);
  return response.data;
};

// ==========================================
// 5. DYNAMIC FORM BUILDER (KYC)
// ==========================================

export const getKycFields = async (): Promise<{ success: boolean; data: any[] }> => {
  const response = await adminApi.get<{ success: boolean; data: any[] }>('/api/admin/kyc/kyc-fields');
  return response.data;
};

export const createKycField = async (data: Record<string, unknown>): Promise<{ success: boolean; data: any }> => {
  const response = await adminApi.post<{ success: boolean; data: any }>('/api/admin/kyc/kyc-fields', data);
  return response.data;
};

export const updateKycField = async (id: string, data: Record<string, unknown>): Promise<{ success: boolean; data: any }> => {
  const response = await adminApi.put<{ success: boolean; data: any }>(`/api/admin/kyc/kyc-fields/${id}`, data);
  return response.data;
};

export const getKycFieldById = async (id: string): Promise<{ success: boolean; data: any }> => {
  const response = await adminApi.get<{ success: boolean; data: any }>(`/api/admin/kyc/kyc-fields/${id}`);
  return response.data;
};

export const verifyKycStatus = async (
  userId: string,
  decision: 'APPROVED' | 'REJECTED',
  feedback?: string
): Promise<{ success: boolean; message: string; data: UserKycRecord }> => {
  try {
    const response = await adminApi.post<{ success: boolean; message: string; data: UserKycRecord }>(
      '/api/admin/kyc/verify',
      {
        userId,
        decision,
        feedback,
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      const response = await adminApi.put<{ success: boolean; message: string; data: UserKycRecord }>(
        `/api/admin/kyc/kyc-review/${userId}`,
        {
          status: decision,
          admin_feedback: feedback,
        }
      );
      return response.data;
    }
    throw error;
  }
};

// ==========================================
// 6. INFLUENCER / AFFILIATE MANAGEMENT
// ==========================================

export const getInfluencers = async (): Promise<{ success: boolean; data: any[] }> => {
  const response = await adminApi.get<{ success: boolean; data: any[] }>('/api/admin/influencer');
  return response.data;
};

export const getInfluencerById = async (id: string): Promise<{ success: boolean; data: any }> => {
  const response = await adminApi.get<{ success: boolean; data: any }>(`/api/admin/influencer/${id}`);
  return response.data;
};

export const createInfluencer = async (data: Record<string, unknown>): Promise<{ success: boolean; data: any }> => {
  const response = await adminApi.post<{ success: boolean; data: any }>('/api/admin/influencer', data);
  return response.data;
};

export const updateInfluencer = async (id: string, data: Record<string, unknown>): Promise<{ success: boolean; data: any }> => {
  const response = await adminApi.put<{ success: boolean; data: any }>(`/api/admin/influencer/${id}`, data);
  return response.data;
};

export const getInfluencersFilter = async (q: string): Promise<{ success: boolean; data: any[] }> => {
  const response = await adminApi.get<{ success: boolean; data: any[] }>(`/api/admin/influencer/filter?q=${q}`);
  return response.data;
};

// ==========================================
// 7. ASSESSMENT TEMPLATES
// ==========================================

export const getAssessmentTemplates = async (params = ''): Promise<{ success: boolean; data: any[] }> => {
  const response = await adminApi.get<{ success: boolean; data: any[] }>(`/api/admin/assessments${params}`);
  return response.data;
};

export const getAssessmentTemplateById = async (id: string): Promise<{ success: boolean; data: any }> => {
  const response = await adminApi.get<{ success: boolean; data: any }>(`/api/admin/assessments/${id}`);
  return response.data;
};

export const createAssessmentTemplate = async (data: Record<string, unknown>): Promise<{ success: boolean; data: any }> => {
  const response = await adminApi.post<{ success: boolean; data: any }>('/api/admin/assessments', data);
  return response.data;
};

export const updateAssessmentTemplate = async (id: string, data: Record<string, unknown>): Promise<{ success: boolean; data: any }> => {
  const response = await adminApi.put<{ success: boolean; data: any }>(`/api/admin/assessments/${id}`, data);
  return response.data;
};

export const deleteAssessmentTemplate = async (id: string): Promise<{ success: boolean }> => {
  const response = await adminApi.delete<{ success: boolean }>(`/api/admin/assessments/${id}`);
  return response.data;
};

export const getTemplateFields = async (templateId: string): Promise<{ success: boolean; data: any[] }> => {
  const response = await adminApi.get<{ success: boolean; data: any[] }>(`/api/admin/assessments/${templateId}/fields`);
  return response.data;
};

export const syncTemplateFields = async (
  templateId: string,
  data: Record<string, unknown>
): Promise<{ success: boolean; data: any }> => {
  const response = await adminApi.put<{ success: boolean; data: any }>(`/api/admin/assessments/${templateId}/fields/sync`, data);
  return response.data;
};

// ==========================================
// 8. DOCUMENTS & PROFILE
// ==========================================

export const uploadDocument = async (file: File): Promise<{ success: boolean; data: any }> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await adminApi.post<{ success: boolean; data: any }>('/api/admin/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateProfile = async (data: { display_name?: string; avatar_doc_id?: string }): Promise<{ success: boolean; data: User }> => {
  const response = await adminApi.patch<{ success: boolean; data: User }>('/api/admin/users/me', data);
  return response.data;
};

export const getDocumentUrl = async (docId: string): Promise<{ success: boolean; data: { url: string } }> => {
  const response = await adminApi.get<{ success: boolean; data: { url: string } }>(`/api/admin/documents/${docId}`);
  return response.data;
};

// ==========================================
// 9. COURSE BUILDER (ECOSYSTEM)
// ==========================================

export const createCourseShell = async (data: Partial<Course>): Promise<{ success: boolean; data: Course }> => {
  const response = await adminApi.post<{ success: boolean; data: Course }>('/api/admin/courses', data);
  return response.data;
};

export const updateCourseShell = async (id: string, data: Partial<Course>): Promise<{ success: boolean; data: Course }> => {
  const response = await adminApi.patch<{ success: boolean; data: Course }>(`/api/admin/courses/${id}`, data);
  return response.data;
};

export const createModule = async (data: Partial<Module>): Promise<{ success: boolean; data: Module }> => {
  const response = await adminApi.post<{ success: boolean; data: Module }>('/api/admin/modules', data);
  return response.data;
};

export const updateModule = async (id: string, data: Partial<Module>): Promise<{ success: boolean; data: Module }> => {
  const response = await adminApi.patch<{ success: boolean; data: Module }>(`/api/admin/modules/${id}`, data);
  return response.data;
};

export const createLearningUnit = async (data: Partial<LearningUnit>): Promise<{ success: boolean; data: LearningUnit }> => {
  const response = await adminApi.post<{ success: boolean; data: LearningUnit }>('/api/admin/units', data);
  return response.data;
};

export const updateLearningUnit = async (id: string, data: Partial<LearningUnit>): Promise<{ success: boolean; data: LearningUnit }> => {
  const response = await adminApi.patch<{ success: boolean; data: LearningUnit }>(`/api/admin/units/${id}`, data);
  return response.data;
};

export const getCourseTree = async (id: string): Promise<{ success: boolean; data: any }> => {
  const response = await adminApi.get<{ success: boolean; data: any }>(`/api/admin/courses/${id}/tree`);
  return response.data;
};

// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000/api/v1',
  TIMEOUT: 30000, // 30 seconds
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  ME: '/auth/me',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',

  // Files
  FILES: '/files',
  UPLOAD_FILE: '/files/upload',
  FILE_BY_ID: (id: string) => `/files/${id}`,
  FILE_STATUS: (id: string) => `/files/${id}/status`,

  // Chats
  CHATS: '/chats',
  CHAT_BY_ID: (id: string) => `/chats/${id}`,

  // Messages
  MESSAGES: (chatId: string) => `/chats/${chatId}/messages`,

  // Notifications
  NOTIFICATIONS: '/notifications',
};

// Helper function to get full URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get auth headers
export const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper function to get auth headers for file upload
export const getAuthHeadersForUpload = (): HeadersInit => {
  const token = localStorage.getItem('accessToken');
  return {
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

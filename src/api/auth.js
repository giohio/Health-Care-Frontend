import { apiFetch } from './client'

export const authApi = {
  login: async (email, password) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: (logoutAll = false) =>
    apiFetch('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ logout_all_devices: logoutAll }),
    }),

  me: () => apiFetch('/auth/me'),

  register: (email, password) =>
    apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  registerStaff: (body) =>
    apiFetch('/auth/admin/register-staff', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  verifyEmail: (email, otp) =>
    apiFetch('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    }),

  resendOtp: (email) =>
    apiFetch('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  forgotPassword: (email) =>
    apiFetch('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (email, otp, newPassword) =>
    apiFetch('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, otp, new_password: newPassword }),
    }),

  // Admin endpoints
  getConfig: () => apiFetch('/auth/admin/config'),

  updateConfig: (body) =>
    apiFetch('/auth/admin/config', {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  getUsers: (query) =>
    apiFetch(`/auth/admin/users?${new URLSearchParams(query || {})}`),

  updateUser: (userId, body) =>
    apiFetch(`/auth/admin/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  setUserStatus: (userId, isActive) =>
    apiFetch(`/auth/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: isActive }),
    }),

  // Notification settings
  getNotificationSettings: () => apiFetch('/auth/admin/settings/notifications'),
  updateNotificationSettings: (settings) =>
    apiFetch('/auth/admin/settings/notifications', {
      method: 'PUT',
      body: JSON.stringify({ settings }),
    }),

  // Security settings
  getSecuritySettings: () => apiFetch('/auth/admin/settings/security'),
  updateSecuritySettings: (body) =>
    apiFetch('/auth/admin/settings/security', {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
}

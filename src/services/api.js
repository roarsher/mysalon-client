 import axios from 'axios';

/**
 * api.js
 * ------
 * Axios instance for all backend calls.
 * Auth is JWT-based (not Firebase tokens).
 * Token is stored in localStorage and attached via interceptor.
 */
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
});

// ── Attach JWT token to every request ────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mysalon_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Normalise error shape ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('mysalon_token');
      localStorage.removeItem('mysalon_user');
    }
    return Promise.reject(err);
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH  — these mirror the reference register.js / login.js exactly
// ═══════════════════════════════════════════════════════════════════════════════

/** Register — backend sends 6-digit OTP to email, returns userId */
export const registerAPI = (data) => api.post('/auth/register', data);

/** Verify OTP — returns { user, token, requiresPhone? } */
export const verifyEmailAPI = (data) => api.post('/auth/verify-otp', data);

/** Resend OTP to the same email */
export const resendOtpAPI = (userId) => api.post('/auth/resend-otp', { userId });

/** Login with email + password — returns { user, token } or { requiresVerification, userId } */
export const loginAPI = (data) => api.post('/auth/login', data);

/** Google sign-in — send Firebase idToken, get back { user, token, requiresPhone?, isNewUser } */
export const googleSignInAPI = (idToken) => api.post('/auth/google', { idToken });

/** Complete profile — save phone number after Google signup */
export const completeProfileAPI = (data) => api.patch('/auth/complete-profile', data);

/** Forgot password — send reset link to email */
export const forgotPasswordAPI = (email) => api.post('/auth/forgot-password', { email });

/** Reset password with token from email */
export const resetPasswordAPI = (data) => api.post('/auth/reset-password', data);

// ═══════════════════════════════════════════════════════════════════════════════
// USERS
// ═══════════════════════════════════════════════════════════════════════════════
export const getProfile       = ()       => api.get('/users/profile');
export const updateProfile    = (data)   => api.put('/users/profile', data);
export const updateProfilePhoto = (form) =>
  api.put('/users/profile/photo', form, { headers: { 'Content-Type': 'multipart/form-data' } });

// ═══════════════════════════════════════════════════════════════════════════════
// SALONS
// ═══════════════════════════════════════════════════════════════════════════════
export const getSalons        = (params) => api.get('/salons', { params });
export const getSalonById     = (id)     => api.get(`/salons/${id}`);
export const getMySalons      = ()       => api.get('/salons/owner/my');
export const createSalon      = (form)   =>
  api.post('/salons', form, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateSalon      = (id, form) =>
  api.put(`/salons/${id}`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteSalon         = (id)      => api.delete(`/salons/${id}`);
export const deleteGalleryImage  = (id, data)=> api.delete(`/salons/${id}/gallery`, { data });

// ═══════════════════════════════════════════════════════════════════════════════
// SERVICES
// ═══════════════════════════════════════════════════════════════════════════════
export const getServices   = (salonId, params) => api.get(`/salons/${salonId}/services`, { params });
export const createService = (salonId, form)   =>
  api.post(`/salons/${salonId}/services`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateService = (salonId, id, form) =>
  api.put(`/salons/${salonId}/services/${id}`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
export const toggleService = (salonId, id)     => api.patch(`/salons/${salonId}/services/${id}/toggle`);
export const deleteService = (salonId, id)     => api.delete(`/salons/${salonId}/services/${id}`);

// ═══════════════════════════════════════════════════════════════════════════════
// BOOKINGS
// ═══════════════════════════════════════════════════════════════════════════════
export const createBooking    = (data)         => api.post('/bookings', data);
export const getMyBookings    = (params)       => api.get('/bookings/my', { params });
export const getBookingById   = (id)           => api.get(`/bookings/${id}`);
export const cancelBooking    = (id, data)     => api.patch(`/bookings/${id}/cancel`, data);
export const getSalonBookings = (salonId, p)   => api.get(`/bookings/salon/${salonId}`, { params: p });

// ═══════════════════════════════════════════════════════════════════════════════
// QUEUE
// ═══════════════════════════════════════════════════════════════════════════════
export const getQueueBySalon        = (salonId)    => api.get(`/queue/salon/${salonId}`);
export const getQueuePosition       = (bookingId)  => api.get(`/queue/position/${bookingId}`);
export const serveNext              = (salonId)    => api.post(`/queue/serve/${salonId}`);
export const completeCurrentBooking = (salonId)    => api.post(`/queue/complete/${salonId}`);
export const toggleQueuePause       = (salonId, d) => api.patch(`/queue/pause/${salonId}`, d);
export const ownerCancelBooking     = (id, d)      => api.patch(`/queue/cancel-booking/${id}`, d);

// ═══════════════════════════════════════════════════════════════════════════════
// REVIEWS
// ═══════════════════════════════════════════════════════════════════════════════
export const createReview = (formData) =>
  api.post('/reviews', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
 export const getSalonReviews = (salonId, params = {}) =>
  api.get(`/reviews/salon/${salonId}`, { params });
export const replyToReview   = (id, data)      => api.patch(`/reviews/${id}/reply`, data);



// Payment APIs
export const createOrder   = (data)      => api.post('/payments/create-order', data);
export const verifyPayment = (data)      => api.post('/payments/verify', data);
export const initiateRefund = (bookingId) => api.post(`/payments/refund/${bookingId}`);
export default api;

// Pricing preview before booking (includes GST, platform fee, first-booking discount)
export const getPricingPreview = (salonId, serviceIds) =>
  api.get('/bookings/pricing-preview', { params: { salonId, serviceIds } });

 

// ── Add these to your services/api.js ────────────────────────────────────────

export const getNotifications          = ()    => api.get('/notifications');
export const getUnreadCount            = ()    => api.get('/notifications/unread-count');
export const markNotificationRead      = (id)  => api.patch(`/notifications/${id}/read`);
export const markAllNotificationsRead  = ()    => api.patch('/notifications/read-all');
export const deleteNotification        = (id)  => api.delete(`/notifications/${id}`);


// ── Add these to src/services/api.js ─────────────────────────────────────────

export const getSalonStylists = (salonId)        => api.get(`/salons/${salonId}/stylists`);
export const createStylist    = (salonId, form)  => api.post(`/salons/${salonId}/stylists`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateStylist    = (salonId, id, form) => api.put(`/salons/${salonId}/stylists/${id}`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
export const toggleStylist    = (salonId, id)    => api.patch(`/salons/${salonId}/stylists/${id}/toggle`);
export const deleteStylist    = (salonId, id)    => api.delete(`/salons/${salonId}/stylists/${id}`);

// ── Add these to src/services/api.js ─────────────────────────────────────────

export const getSalonSlots         = (salonId, date)  => api.get(`/slots/${salonId}`, { params: { date } });
export const getSalonAvailableDates = (salonId, month) => api.get(`/slots/${salonId}/dates`, { params: { month } });


export const getAdminStats        = ()           => api.get('/admin/stats');
export const getAdminSalons       = (params)     => api.get('/admin/salons', { params });
export const verifySalon          = (id, data)   => api.patch(`/admin/salons/${id}/verify`, data);
export const getAdminUsers        = (params)     => api.get('/admin/users', { params });
export const updateUserStatus     = (id, data)   => api.patch(`/admin/users/${id}/status`, data);
export const updateUserRole       = (id, data)   => api.patch(`/admin/users/${id}/role`, data);
export const getAdminRevenue      = (params)     => api.get('/admin/revenue', { params });
export const getAdminBookings     = (params)     => api.get('/admin/bookings', { params });
export const flagBooking          = (id, data)   => api.patch(`/admin/bookings/${id}/flag`, data);
export const refundOverride       = (id, data)   => api.patch(`/admin/bookings/${id}/refund-override`, data);
export const updateBookingStatus  = (id, data)   => api.patch(`/admin/bookings/${id}/status`, data);



export const getSalonRevenue    = (salonId, params) => api.get(`/owner/${salonId}/revenue`,   { params });
export const getSalonCustomers  = (salonId, params) => api.get(`/owner/${salonId}/customers`, { params });
export const getCustomerHistory = (salonId, userId) => api.get(`/owner/${salonId}/customers/${userId}/history`);

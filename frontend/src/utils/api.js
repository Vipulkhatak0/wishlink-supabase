import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('wishlink_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('wishlink_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const wishAPI = {
  create: (data) => api.post('/api/wishes', data),
  getAll: () => api.get('/api/wishes/my'),
  getOne: (id) => api.get(`/api/wishes/${id}`),
  update: (id, data) => api.put(`/api/wishes/${id}`, data),
  delete: (id) => api.delete(`/api/wishes/${id}`),
  publish: (id) => api.put(`/api/wishes/${id}/publish`),
  getPublic: (slug) => api.get(`/api/w/${slug}`),
  getTrending: () => api.get('/api/wishes/trending'),
  unlockSecret: (slug, password) => api.post(`/api/wishes/${slug}/unlock-secret`, { password }),
};

export const paymentAPI = {
  createOrder: (plan, wishId) => api.post('/api/payments/create-order', { plan, wishId }),
  verify: (data) => api.post('/api/payments/verify', data),
  getMyPayments: () => api.get('/api/payments/my'),
};

export const uploadAPI = {
  image: (formData) => api.post('/api/upload/image', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  video: (formData) => api.post('/api/upload/video', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  audio: (formData) => api.post('/api/upload/audio', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (publicId, resourceType) => api.delete('/api/upload', { data: { publicId, resourceType } }),
};

export const aiAPI = {
  generateMessage: (data) => api.post('/api/ai/generate-message', data),
  generateLoveLetter: (data) => api.post('/api/ai/love-letter', data),
};

export const commentAPI = {
  add: (slug, data) => api.post(`/api/comments/${slug}`, data),
  getAll: (slug) => api.get(`/api/comments/${slug}`),
  delete: (id) => api.delete(`/api/comments/${id}`),
};

export const analyticsAPI = {
  getDashboard: () => api.get('/api/analytics/dashboard'),
  getWish: (id) => api.get(`/api/analytics/wish/${id}`),
};

export const adminAPI = {
  getDashboard: () => api.get('/api/admin/dashboard'),
  getUsers: () => api.get('/api/admin/users'),
  getPayments: () => api.get('/api/admin/payments'),
  toggleUser: (id) => api.put(`/api/admin/users/${id}/toggle`),
};

export default api;

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
});

export const fetchPublicContent = async () => {
  const { data } = await api.get('/public/content');
  return data;
};

export const fetchAvailabilityByDate = async (date) => {
  const { data } = await api.get('/public/availability', {
    params: { date }
  });
  return data;
};

export const sendContact = async (payload) => {
  const { data } = await api.post('/public/contact', payload);
  return data;
};

export const createAppointment = async (payload) => {
  const { data } = await api.post('/public/appointments', payload);
  return data;
};

export const subscribe = async (payload) => {
  const { data } = await api.post('/public/subscribe', payload);
  return data;
};

export const createTestimonial = async (payload) => {
  const { data } = await api.post('/public/testimonials', payload);
  return data;
};

export const login = async (payload) => {
  const { data } = await api.post('/auth/login', payload);
  return data;
};

export const fetchAdminDashboard = async (token) => {
  const { data } = await api.get('/admin/dashboard', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

export const fetchAdminAvailability = async (token) => {
  const { data } = await api.get('/admin/availability', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

export const updateWeeklyAvailability = async (payload, token) => {
  const { data } = await api.put('/admin/availability', payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

export const fetchAdminAppointments = async (token, params = {}) => {
  const { data } = await api.get('/admin/appointments', {
    params,
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

export const updateAppointmentStatus = async (id, payload, token) => {
  const { data } = await api.patch(`/admin/appointments/${id}/status`, payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

export const updateSection = async (key, payload, token) => {
  const { data } = await api.put(`/admin/sections/${key}`, payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

export const createService = async (payload, token) => {
  const { data } = await api.post('/admin/services', payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

export const updateService = async (id, payload, token) => {
  const { data } = await api.put(`/admin/services/${id}`, payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

export const deleteService = async (id, token) => {
  const { data } = await api.delete(`/admin/services/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

export const createAdminTestimonial = async (payload, token) => {
  const { data } = await api.post('/admin/testimonials', payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

export const updateAdminTestimonial = async (id, payload, token) => {
  const { data } = await api.put(`/admin/testimonials/${id}`, payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

export const createGalleryItem = async (payload, token) => {
  const { data } = await api.post('/admin/gallery', payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

export const updateGalleryItem = async (id, payload, token) => {
  const { data } = await api.put(`/admin/gallery/${id}`, payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

export const deleteGalleryItem = async (id, token) => {
  const { data } = await api.delete(`/admin/gallery/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

export const approveTestimonial = async (id, token) => {
  const { data } = await api.patch(
    `/admin/testimonials/${id}/approve`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return data;
};

export const updateTestimonialVisibility = async (id, payload, token) => {
  const { data } = await api.patch(`/admin/testimonials/${id}/visibility`, payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

export const deleteTestimonial = async (id, token) => {
  const { data } = await api.delete(`/admin/testimonials/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

export const createReviewCode = async (payload, token) => {
  const { data } = await api.post('/admin/review-codes', payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

export default api;

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
});

export const fetchPublicContent = async () => {
  const { data } = await api.get('/public/content');
  return data;
};

export const sendContact = async (payload) => {
  const { data } = await api.post('/public/contact', payload);
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

export const updateService = async (id, payload, token) => {
  const { data } = await api.put(`/admin/services/${id}`, payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

export default api;

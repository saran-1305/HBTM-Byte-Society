import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export const searchKnowledge = async (query = '', category = '', stage = '') => {
  const params = new URLSearchParams();
  if (query) params.append('q', query);
  if (category) params.append('category', category);
  if (stage) params.append('stage', stage);
  
  const response = await api.get(`/knowledge/search?${params.toString()}`);
  return response.data;
};

export const getCategories = async () => {
  const response = await api.get('/knowledge/categories');
  return response.data;
};

export const refreshKnowledge = async (query = '') => {
  const response = await api.post(`/knowledge/refresh?q=${encodeURIComponent(query)}`);
  return response.data;
};

export const getKnowledgeDetails = async (id: string) => {
  const response = await api.get(`/knowledge/${id}`);
  return response.data;
};

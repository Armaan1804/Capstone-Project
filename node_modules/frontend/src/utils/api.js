import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export const uploadDocument = async (file) => {
  const formData = new FormData();
  formData.append('document', file);
  
  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

export const getJobStatus = async (jobId) => {
  const response = await api.get(`/jobs/${jobId}`);
  return response.data;
};

export const searchDocuments = async (query, page = 1, limit = 10) => {
  const response = await api.get('/search', {
    params: { q: query, page, limit }
  });
  return response.data;
};

export const getDocuments = async (page = 1, limit = 10) => {
  const response = await api.get('/documents', {
    params: { page, limit }
  });
  return response.data;
};

export const getDocumentPages = async (documentId) => {
  const response = await api.get(`/documents/${documentId}/pages`);
  return response.data;
};

export const reprocessDocument = async (documentId, options = {}) => {
  const response = await api.post(`/documents/${documentId}/reprocess`, options);
  return response.data;
};

export default api;
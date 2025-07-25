// src/lib/axios.ts
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'https://icp-backend-e3fk.onrender.com/api';

export const axiosInstance = axios.create({
  baseURL: API_BASE,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

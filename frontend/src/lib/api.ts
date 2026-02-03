import axios from 'axios';
import { toast } from 'sonner';

const getBaseUrl = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  if (!url.startsWith('http')) {
    url = `https://${url}`;
  }
  return url;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ...

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || 'Terjadi kesalahan pada sistem';

    if (status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } else if (status === 403) {
      toast.error('Akses Ditolak: Anda tidak memiliki izin.');
    } else if (status >= 500) {
      toast.error('Gangguan Server: Silakan coba lagi nanti.');
    } else {
      toast.error(message);
    }
    return Promise.reject(error);
  }
);

export default api;

import axios from 'axios';
import { toast } from 'sonner';

const api = axios.create({
  // ...
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

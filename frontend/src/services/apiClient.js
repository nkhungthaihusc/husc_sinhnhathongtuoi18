import axios from 'axios';
import { tokenStorage } from './tokenStorage.js';

// const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'
const baseURL = 'https://husc-sinhnhathongtuoi18.vercel.app';

let refreshingPromise = null;

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;

    if (status !== 401 || originalRequest?._retry) {
      return Promise.reject(error);
    }

    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      tokenStorage.clear();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshingPromise) {
        refreshingPromise = axios.post(`${baseURL}/auth/refresh-token`, { refreshToken });
      }

      const refreshResponse = await refreshingPromise;
      const nextAccessToken = refreshResponse?.data?.data?.accessToken;

      if (!nextAccessToken) {
        throw new Error('Không thể làm mới phiên đăng nhập');
      }

      tokenStorage.setSession({ accessToken: nextAccessToken });
      originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      tokenStorage.clear();
      return Promise.reject(refreshError);
    } finally {
      refreshingPromise = null;
    }
  }
);


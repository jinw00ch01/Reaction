import axios from 'axios';

// 개발/프로덕션 환경에 따른 기본 URL 설정
const getBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return import.meta.env.VITE_API_URL_PRODUCTION;
  }
  
  return import.meta.env.VITE_API_URL_DEVELOPMENT;
};

export const BASE_URL = getBaseUrl();

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API 엔드포인트 설정
export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    signup: '/auth/signup',
    refresh: '/auth/refresh',
    verify: '/auth/verify',
    logout: '/auth/logout',
    withdraw: '/auth/withdraw'
  },
  diary: {
    create: '/diary',
    list: '/diary/list',
    detail: (id) => `/diary/${id}`,
    update: (id) => `/diary/${id}`,
    delete: (id) => `/diary/${id}`,
  },
  user: {
    profile: '/user/profile',
    update: '/user/profile',
    password: '/user/password',
  }
};

// 요청 인터셉터
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 토큰 만료 에러 (401) 처리
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { token } = response.data;
        localStorage.setItem('token', token);

        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axiosInstance(originalRequest);
      } catch (error) {
        // 리프레시 토큰도 만료된 경우
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance; 
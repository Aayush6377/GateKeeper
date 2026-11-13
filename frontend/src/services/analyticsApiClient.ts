import axios from 'axios';

export const analyticsApiClient = axios.create({
  baseURL: `${import.meta.env.VITE_ANALYTICS_URL}/api/v1`,
});

analyticsApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('gatekeeper_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

analyticsApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return analyticsApiClient(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('gatekeeper_refresh_token');
        
        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/refresh`, { refreshToken });
        const { accessToken } = response.data;

        localStorage.setItem('gatekeeper_access_token', accessToken);
        analyticsApiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        processQueue(null, accessToken);

        return analyticsApiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
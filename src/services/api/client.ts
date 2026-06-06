import axios from 'axios';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const client = axios.create({
  baseURL: 'http://localhost:4000/api',
  withCredentials: true,
  timeout: 30000,
});

client.interceptors.request.use(
  (config) => {
    try {
      const storageRaw = localStorage.getItem('edu-auth-storage');
      if (storageRaw) {
        const storage = JSON.parse(storageRaw);
        const state = storage.state;
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      }
    } catch {
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

function normalizeFields(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(normalizeFields);
  }
  if (obj && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (key === 'realName' && !(obj as Record<string, unknown>).name) {
        result.name = normalizeFields(value);
      } else if (key === 'registeredAt' && !(obj as Record<string, unknown>).createdAt) {
        result.createdAt = normalizeFields(value);
      } else {
        result[key] = normalizeFields(value);
      }
    }
    return result;
  }
  return obj;
}

client.interceptors.response.use(
  (response) => {
    const data = response.data;
    if (data && typeof data === 'object' && 'data' in data) {
      (data as { data: unknown }).data = normalizeFields((data as { data: unknown }).data);
    }
    return data;
  },
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;

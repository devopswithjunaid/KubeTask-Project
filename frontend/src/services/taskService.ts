import axios, { AxiosError } from 'axios';

// Use localhost for browser access
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

console.log('🔧 API Configuration:', {
  API_URL,
  environment: import.meta.env.NODE_ENV,
  viteApiUrl: import.meta.env.VITE_API_URL
});

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  timeout: 15000, // 15 second timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Add withCredentials if needed for CORS
  withCredentials: false,
});

// Enhanced request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('🚀 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      data: config.data,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Enhanced response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      url: response.config.url
    });
    return response;
  },
  (error: AxiosError) => {
    console.error('❌ API Response Error:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      baseURL: error.config?.baseURL
    });

    // Provide user-friendly error messages
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      console.error('🔌 Backend server is not reachable. Check if backend is running on', API_URL);
    } else if (error.code === 'TIMEOUT_ERROR') {
      console.error('⏰ Request timed out. Backend might be slow or not responding.');
    } else if (error.response?.status === 404) {
      console.error('🔍 API endpoint not found:', error.config?.url);
    } else if (error.response?.status === 500) {
      console.error('💥 Backend server error');
    }

    return Promise.reject(error);
  }
);

// API functions with better error handling
export const getTasks = async () => {
  try {
    console.log('📋 Fetching tasks...');
    const response = await api.get('/tasks');
    console.log('✅ Tasks fetched successfully:', response.data);
    return response;
  } catch (error) {
    console.error('❌ Failed to fetch tasks:', error);
    throw error;
  }
};

export const createTask = async (task: { title: string; description: string; status?: string }) => {
  try {
    console.log('➕ Creating task:', task);
    const response = await api.post('/tasks', task);
    console.log('✅ Task created successfully:', response.data);
    return response;
  } catch (error) {
    console.error('❌ Failed to create task:', error);
    throw error;
  }
};

export const updateTask = async (id: number, updates: { title?: string; description?: string; status?: string }) => {
  try {
    console.log('📝 Updating task:', id, updates);
    const response = await api.put(`/tasks/${id}`, updates);
    console.log('✅ Task updated successfully:', response.data);
    return response;
  } catch (error) {
    console.error('❌ Failed to update task:', error);
    throw error;
  }
};

export const deleteTask = async (id: number) => {
  try {
    console.log('🗑️ Deleting task:', id);
    const response = await api.delete(`/tasks/${id}`);
    console.log('✅ Task deleted successfully');
    return response;
  } catch (error) {
    console.error('❌ Failed to delete task:', error);
    throw error;
  }
};

// Health check function
export const checkBackendHealth = async () => {
  try {
    console.log('🏥 Checking backend health...');
    const response = await axios.get(`${API_URL}/health`, { timeout: 5000 });
    console.log('✅ Backend is healthy:', response.data);
    return response;
  } catch (error) {
    console.error('❌ Backend health check failed:', error);
    throw error;
  }
};
import axios from 'axios';
import supabase from '../utils/supabase';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  timeout: 120000, // 2 minutes timeout for AI generation
  headers: {
    'Content-Type': 'application/json',
  },
});

// Log the configured timeout
console.log('API timeout configured:', api.defaults.timeout);

// Request interceptor for logging and auth
api.interceptors.request.use(
  async (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    
    // Add auth header if user is logged in
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    } catch (error) {
      console.error('Error getting auth session:', error);
    }
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.message);
    
    // Enhance error messages for better UX
    if (error.code === 'ECONNABORTED') {
      error.userMessage = 'Request timed out. Please try again with a simpler prompt.';
    } else if (error.code === 'ERR_NETWORK') {
      error.userMessage = 'Unable to connect to the server. Please check if the backend is running.';
    } else if (error.response) {
      // Server responded with error
      switch (error.response.status) {
        case 400:
          error.userMessage = error.response.data?.message || 'Invalid request. Please check your prompt.';
          break;
        case 401:
          error.userMessage = 'Authentication failed. Please check the API configuration.';
          break;
        case 429:
          error.userMessage = 'Too many requests. Please wait a moment before trying again.';
          break;
        case 500:
          error.userMessage = error.response.data?.message || 'Server error. Please try again later.';
          break;
        default:
          error.userMessage = `Server error (${error.response.status}). Please try again.`;
      }
    } else {
      error.userMessage = 'Network error. Please check your connection and try again.';
    }
    
    return Promise.reject(error);
  }
);

/**
 * Generate code using AI
 * @param {string} prompt - The user's prompt describing what code to generate
 * @param {string} projectId - Optional project ID for version tracking
 * @returns {Promise<{success: boolean, code: string, language: string, framework: string}>}
 */
export const generateCode = async (prompt, projectId = null) => {
  try {
    const response = await api.post('/api/generate', { prompt, projectId });
    return response.data;
  } catch (error) {
    // Re-throw with user-friendly message attached
    throw {
      ...error,
      userMessage: error.userMessage || 'Failed to generate code. Please try again.',
    };
  }
};

/**
 * Health check endpoint
 * @returns {Promise<{status: string, timestamp: string}>}
 */
export const checkHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw {
      ...error,
      userMessage: 'Backend service is not available.',
    };
  }
};

/**
 * Get AI explanation for generated code
 * @param {string|object} code - The code to explain (string for single file, object for multi-file)
 * @returns {Promise<{success: boolean, explanation: object}>}
 */
export const explainCode = async (code) => {
  try {
    const response = await api.post('/api/explain', { code }, {
      timeout: 30000 // 30 second timeout for explanations
    });
    return response.data;
  } catch (error) {
    // Re-throw with user-friendly message attached
    throw {
      ...error,
      userMessage: error.userMessage || 'Failed to generate explanation. Please try again.',
    };
  }
};

/**
 * Edit existing code based on chat message
 * @param {string|object} code - The current code (string for single file, object for multi-file)
 * @param {string} message - The user's edit request
 * @param {Array} history - The chat history for context
 * @param {string} projectId - Optional project ID for version tracking
 * @returns {Promise<{success: boolean, code?: string, files?: object, isProject: boolean}>}
 */
export const chatEdit = async (code, message, history = [], projectId = null) => {
  try {
    const response = await api.post('/api/chat', { 
      code, 
      message, 
      history,
      projectId 
    });
    return response.data;
  } catch (error) {
    // Re-throw with user-friendly message attached
    throw {
      ...error,
      userMessage: error.userMessage || 'Failed to edit code. Please try again.',
    };
  }
};

export default api;
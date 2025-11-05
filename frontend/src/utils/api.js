// API configuration and utilities
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

class ApiError extends Error {
  constructor(message, status, response) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.response = response;
  }
}

// HTTP client with retry mechanism
export const apiClient = {
  async post(endpoint, data, options = {}) {
    const { maxRetries = 3, retryDelay = 1000 } = options;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
          body: JSON.stringify(data),
        });

        const responseData = await response.json();

        if (!response.ok) {
          throw new ApiError(
            responseData.error || `HTTP ${response.status}`,
            response.status,
            responseData
          );
        }

        return responseData;
      } catch (error) {
        // If it's the last attempt or not a network error, throw immediately
        if (attempt === maxRetries || error instanceof ApiError) {
          throw error;
        }

        // Wait before retrying (exponential backoff)
        await new Promise(resolve => 
          setTimeout(resolve, retryDelay * Math.pow(2, attempt - 1))
        );
      }
    }
  },

  async get(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.error || `HTTP ${response.status}`,
          response.status,
          errorData
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Network error', 0, null);
    }
  }
};

// Chat API functions
export const chatApi = {
  async sendMessage(message, conversationHistory = []) {
    if (!message || typeof message !== 'string' || !message.trim()) {
      throw new Error('Message is required and must be a non-empty string');
    }

    // Format conversation history for API
    const formattedHistory = conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    try {
      const response = await apiClient.post('/chat', {
        message: message.trim(),
        conversationHistory: formattedHistory
      });

      if (response.error) {
        throw new ApiError(response.error, 400, response);
      }

      return response.response;
    } catch (error) {
      // Re-throw ApiErrors as-is
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new ApiError('Unable to connect to server. Please check your connection.', 0, null);
      }
      
      // Handle other errors
      throw new ApiError(error.message || 'An unexpected error occurred', 500, null);
    }
  },

  async healthCheck() {
    try {
      return await apiClient.get('/');
    } catch (error) {
      throw new ApiError('Health check failed', error.status || 0, null);
    }
  }
};

// Error handling utilities
export const getErrorMessage = (error) => {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 0:
        return {
          message: 'Unable to connect to server. Please check your internet connection.',
          type: 'network',
          retryable: true
        };
      case 400:
        return {
          message: error.message || 'Invalid request. Please check your input.',
          type: 'validation',
          retryable: false
        };
      case 401:
        return {
          message: 'Authentication failed. Please try again.',
          type: 'auth',
          retryable: true
        };
      case 429:
        return {
          message: 'Too many requests. Please wait a moment and try again.',
          type: 'rate_limit',
          retryable: true
        };
      case 500:
        return {
          message: 'Server error. Please try again later.',
          type: 'server',
          retryable: true
        };
      case 503:
        return {
          message: 'Service temporarily unavailable. Please try again in a few minutes.',
          type: 'service',
          retryable: true
        };
      default:
        return {
          message: error.message || 'An unexpected error occurred.',
          type: 'unknown',
          retryable: true
        };
    }
  }
  
  return {
    message: error.message || 'An unexpected error occurred.',
    type: 'unknown',
    retryable: true
  };
};

// Enhanced retry utility with exponential backoff
export const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on non-retryable errors
      if (error instanceof ApiError) {
        const errorInfo = getErrorMessage(error);
        if (!errorInfo.retryable) {
          throw error;
        }
      }
      
      // If this is the last attempt, throw the error
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Calculate delay with exponential backoff and jitter
      const delay = baseDelay * Math.pow(2, attempt - 1);
      const jitter = Math.random() * 0.1 * delay; // Add up to 10% jitter
      
      await new Promise(resolve => setTimeout(resolve, delay + jitter));
    }
  }
  
  throw lastError;
};

export { ApiError };
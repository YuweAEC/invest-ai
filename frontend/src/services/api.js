import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error('❌ Response Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// API Services
export const chatService = {
  // Send chat message (company-specified format)
  sendQuery: async (userId, query) => {
    try {
      const response = await api.post('/query/', {
        user_id: userId,
        query: query,
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to send query')
    }
  },

  // Enhanced chat message (with session support)
  sendMessage: async (query, sessionId) => {
    try {
      const response = await api.post('/chat/', {
        query: query,
        session_id: sessionId,
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to send message')
    }
  },

  // Get session history
  getSessionHistory: async (sessionId) => {
    try {
      const response = await api.get(`/chat/sessions/${sessionId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to get session history')
    }
  },

  // Get all sessions
  getAllSessions: async () => {
    try {
      const response = await api.get('/chat/sessions/')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to get sessions')
    }
  },

  // Delete session
  deleteSession: async (sessionId) => {
    try {
      const response = await api.delete(`/chat/sessions/${sessionId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to delete session')
    }
  },

  // Health check
  healthCheck: async () => {
    try {
      const response = await api.get('/health/simple')
      return response.data
    } catch (error) {
      throw new Error('Health check failed')
    }
  },
}

export default api

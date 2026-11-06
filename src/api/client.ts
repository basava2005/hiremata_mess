import axios, { AxiosInstance } from 'axios'

// Auto-normalize API Base URL so whether user configured with or without '/api/v1', it works seamlessly
let envApiUrl = (import.meta.env.VITE_API_URL || '/api/v1').trim()
if (envApiUrl.startsWith('http') && !envApiUrl.includes('/api/v1')) {
  envApiUrl = envApiUrl.replace(/\/+$/, '') + '/api/v1'
}

const API_BASE_URL = envApiUrl
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true'

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Token management in memory and localStorage
let inMemoryToken: string | null = null

export const tokenStorage = {
  get: (): string | null => {
    if (inMemoryToken) return inMemoryToken
    try {
      return localStorage.getItem('messpro_token')
    } catch {
      return null
    }
  },
  set: (token: string) => {
    inMemoryToken = token
    try {
      localStorage.setItem('messpro_token', token)
    } catch {}
  },
  clear: () => {
    inMemoryToken = null
    try {
      localStorage.removeItem('messpro_token')
    } catch {}
  },
}

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenStorage.get()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor to handle 401s
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      tokenStorage.clear()
      // Optional: dispatch auth expired event or redirect
    }
    return Promise.reject(error)
  }
)

/**
 * Helper to simulate mock API delay (ultra fast response to prevent late loading)
 */
export async function mockDelay<T>(data: T, delayMs: number = 30): Promise<T> {
  const actualDelay = Math.min(delayMs, 40)
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), actualDelay)
  })
}


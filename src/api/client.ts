import axios, { AxiosInstance } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false'

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
 * Helper to simulate mock API delay
 */
export async function mockDelay<T>(data: T, delayMs: number = 180): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delayMs)
  })
}


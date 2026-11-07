import axios, { AxiosInstance } from 'axios'

// Default to live Render backend in production so it never 404s even if env variables are pending or contain typos
const LIVE_RENDER_API = 'https://hiremata-mess.onrender.com/api/v1'

let rawApiUrl = (import.meta.env.VITE_API_URL || '').trim()

// Extract any valid http/https URL anywhere from the input (strips away any accidental 'I_URL', 'VITE_API_URL=', tabs, or text)
const urlMatch = rawApiUrl.match(/https?:\/\/[^\s"'`]+/i)
if (urlMatch) {
  rawApiUrl = urlMatch[0].trim()
} else if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')) {
  rawApiUrl = LIVE_RENDER_API
} else {
  rawApiUrl = '/api/v1'
}

// Ensure /api/v1 is present for full API endpoints
if (rawApiUrl.startsWith('http') && !rawApiUrl.includes('/api/v1')) {
  rawApiUrl = rawApiUrl.replace(/\/+$/, '') + '/api/v1'
}

const API_BASE_URL = rawApiUrl
// Hardcode to false so mock data is permanently disabled
export const USE_MOCKS = false

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


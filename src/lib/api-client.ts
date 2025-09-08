// API client utility for making authenticated requests with CSRF tokens
import { getCSRFHeaders } from './csrf'

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: any
  headers?: Record<string, string>
  requireCSRF?: boolean
}

export class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl
  }

  async request<T = any>(
    endpoint: string, 
    options: ApiRequestOptions = {}
  ): Promise<T> {
    const {
      method = 'GET',
      body,
      headers = {},
      requireCSRF = true
    } = options

    const url = `${this.baseUrl}${endpoint}`
    
    // Prepare headers
    const requestHeaders: Record<string, string> = { ...headers }
    
    // Add CSRF token for state-changing requests when required
    if (requireCSRF && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      try {
        const csrfHeaders = await getCSRFHeaders()
        Object.assign(requestHeaders, csrfHeaders)
      } catch (error) {
        console.error('Failed to get CSRF token:', error)
        throw new Error('Failed to get CSRF token')
      }
    }

    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
      credentials: 'include', // Include cookies for session
    }

    // Add body for non-GET requests
    if (body && method !== 'GET') {
      requestOptions.body = JSON.stringify(body)
    }

    try {
      const response = await fetch(url, requestOptions)
      
      // Handle non-2xx responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        // Handle validation errors specifically
        if (response.status === 400 && errorData.message) {
          throw new Error(errorData.message)
        }
        
        // Handle other errors
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error(`API request failed: ${method} ${url}`, error)
      throw error
    }
  }

  // Convenience methods
  async get<T = any>(endpoint: string, options: Omit<ApiRequestOptions, 'method'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  async post<T = any>(endpoint: string, body?: any, options: Omit<ApiRequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body })
  }

  async put<T = any>(endpoint: string, body?: any, options: Omit<ApiRequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body })
  }

  async delete<T = any>(endpoint: string, options: Omit<ApiRequestOptions, 'method'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }
}

// Create a default API client instance
export const apiClient = new ApiClient()

// Specific API methods for common operations
export const favoritesApi = {
  async add(couponId: string) {
    return apiClient.post('/api/user/favorites', { couponId })
  },

  async remove(couponId: string) {
    return apiClient.delete(`/api/user/favorites?couponId=${couponId}`)
  },

  async list() {
    return apiClient.get('/api/user/favorites')
  }
}

export const couponsApi = {
  async use(couponId: string) {
    return apiClient.post(`/api/coupons/${couponId}/use`)
  },

  async create(couponData: any) {
    return apiClient.post('/api/coupons/create', couponData)
  },

  async update(couponId: string, couponData: any) {
    return apiClient.put(`/api/coupons/${couponId}`, couponData)
  },

  async delete(couponId: string) {
    return apiClient.delete(`/api/coupons/${couponId}`)
  }
}

export const brandsApi = {
  async create(brandData: any) {
    return apiClient.post('/api/brands', brandData)
  },

  async update(brandId: string, brandData: any) {
    return apiClient.put(`/api/brands/${brandId}`, brandData)
  },

  async delete(brandId: string) {
    return apiClient.delete(`/api/brands/${brandId}`)
  }
}

export const categoriesApi = {
  async create(categoryData: any) {
    return apiClient.post('/api/categories', categoryData)
  },

  async update(categoryId: string, categoryData: any) {
    return apiClient.put(`/api/categories/${categoryId}`, categoryData)
  },

  async delete(categoryId: string) {
    return apiClient.delete(`/api/categories/${categoryId}`)
  }
}

export const submissionsApi = {
  async submitBrand(payload: any) {
    return apiClient.post('/api/submissions', { type: 'BRAND', payload })
  },
  async submitCoupon(payload: any) {
    return apiClient.post('/api/submissions', { type: 'COUPON', payload })
  },
}

// Contacts / Partners
export const contactsApi = {
  async submit(payload: { type: 'CONTACT' | 'PARTNER'; name: string; email: string; company?: string; message: string; budget?: string; goals?: string }) {
    return apiClient.post('/api/contact', payload)
  },
  async list(type?: 'CONTACT' | 'PARTNER') {
    const qs = type ? `?type=${type}` : ''
    return apiClient.get(`/api/contact${qs}`)
  }
}

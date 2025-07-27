import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

class ApiService {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: 'http://localhost:8080/custom/modernui/api.php',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: false // Changed to false to avoid CORS issues
    })

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = useAuthStore.getState().token
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        const { response } = error

        if (response?.status === 401) {
          useAuthStore.getState().logout()
          toast.error('Session expired. Please login again.')
          window.location.href = '/login'
        } else if (response?.status >= 500) {
          toast.error('Server error. Please try again later.')
        } else if (response?.data?.message) {
          toast.error(response.data.message)
        }

        return Promise.reject(error)
      }
    )
  }

  // Generic CRUD methods
  async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, { params })
    return response.data
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data)
    return response.data
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data)
    return response.data
  }

  async delete<T>(url: string): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url)
    return response.data
  }

  async patch<T>(url: string, data?: any): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch(url, data)
    return response.data
  }
}

export const apiService = new ApiService()

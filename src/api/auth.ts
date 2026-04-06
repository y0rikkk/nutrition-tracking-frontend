import axios from 'axios'
import client from './client'
import type { TokenResponse, UserOut } from '@/types'

const baseURL = import.meta.env.VITE_API_URL

export interface RegisterRequest {
  username: string
  password: string
  email?: string
  full_name?: string
  birth_date: string
  gender: 'male' | 'female'
  height_cm: number
  weight_kg: number
  activity_level: string
}

export interface LoginRequest {
  username: string
  password: string
}

export const authApi = {
  register(data: RegisterRequest): Promise<TokenResponse> {
    return axios.post(`${baseURL}/auth/register/`, data).then((r) => r.data)
  },

  login(data: LoginRequest): Promise<TokenResponse> {
    return axios.post(`${baseURL}/auth/login/`, data).then((r) => r.data)
  },

  logout(refreshToken: string): Promise<void> {
    return client.post('/auth/logout/', { refresh_token: refreshToken })
  },

  getMe(): Promise<UserOut> {
    return client.get('/auth/users/me/').then((r) => r.data)
  },

  updateMe(data: Partial<Pick<UserOut, 'birth_date' | 'gender' | 'height_cm' | 'weight_kg' | 'activity_level'>>): Promise<UserOut> {
    return client.patch('/auth/users/me/', data).then((r) => r.data)
  },
}

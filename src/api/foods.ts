import client from './client'
import type { FoodItemOut, PagedResponse, RecognizedDish } from '@/types'

export const foodsApi = {
  getAll(params?: Record<string, string | number | boolean>): Promise<PagedResponse<FoodItemOut>> {
    return client.get('/foods/', { params }).then((r) => r.data)
  },

  search(query: string): Promise<PagedResponse<FoodItemOut>> {
    return client.get('/foods/', { params: { name__ilike: query, limit: 20 } }).then((r) => r.data)
  },

  create(data: {
    name: string
    calories_per_100g: number
    protein_per_100g: number
    fat_per_100g: number
    carbs_per_100g: number
    brand?: string | null
    barcode?: string | null
  }): Promise<FoodItemOut> {
    return client.post('/foods/', data).then((r) => r.data)
  },

  update(id: string, data: Record<string, unknown>): Promise<FoodItemOut> {
    return client.patch(`/foods/${id}/`, data).then((r) => r.data)
  },

  delete(id: string): Promise<void> {
    return client.delete(`/foods/${id}/`)
  },

  analyzePhoto(file: File): Promise<{ dishes: RecognizedDish[] }> {
    const formData = new FormData()
    formData.append('photo', file)
    return client
      .post('/foods/analyze-photo/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60_000,
      })
      .then((r) => r.data)
  },
}

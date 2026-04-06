import client from './client'
import type { FoodItemOut, PagedResponse, RecognizedDish } from '@/types'

export const foodsApi = {
  search(query: string): Promise<PagedResponse<FoodItemOut>> {
    return client.get('/foods/', { params: { name__ilike: query, limit: 20 } }).then((r) => r.data)
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

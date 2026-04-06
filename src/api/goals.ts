import client from './client'
import type { NutritionGoalOut, PagedResponse } from '@/types'

export const goalsApi = {
  getAll(params?: Record<string, string | number | boolean>): Promise<PagedResponse<NutritionGoalOut>> {
    return client.get('/goals/', { params }).then((r) => r.data)
  },

  create(data: {
    calories_kcal: number
    protein_g: number
    fat_g: number
    carbs_g: number
    started_at: string
    notes?: string | null
  }): Promise<NutritionGoalOut> {
    return client.post('/goals/', data).then((r) => r.data)
  },

  update(id: string, data: { is_active?: boolean; notes?: string }): Promise<NutritionGoalOut> {
    return client.patch(`/goals/${id}/`, data).then((r) => r.data)
  },

  delete(id: string): Promise<void> {
    return client.delete(`/goals/${id}/`)
  },
}

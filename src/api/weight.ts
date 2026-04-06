import client from './client'
import type { PagedResponse, WeightLogOut } from '@/types'

export const weightApi = {
  getAll(params?: Record<string, string | number | boolean>): Promise<PagedResponse<WeightLogOut>> {
    return client.get('/weight-logs/', { params }).then((r) => r.data)
  },

  create(data: { date: string; weight_kg: number; notes?: string | null }): Promise<WeightLogOut> {
    return client.post('/weight-logs/', data).then((r) => r.data)
  },

  delete(id: string): Promise<void> {
    return client.delete(`/weight-logs/${id}/`)
  },
}

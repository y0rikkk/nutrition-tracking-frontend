import client from './client'
import type { DashboardOut } from '@/types'

export const dashboardApi = {
  getByDate(date: string): Promise<DashboardOut> {
    return client.get('/dashboard/', { params: { date } }).then((r) => r.data)
  },
}

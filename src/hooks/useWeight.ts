import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { weightApi } from '@/api/weight'

export function useWeightLogs() {
  return useQuery({
    queryKey: ['weight-logs'],
    queryFn: () => weightApi.getAll({ order_by: 'date', desc: false }),
  })
}

export function useAddWeight() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { date: string; weight_kg: number; notes?: string | null }) =>
      weightApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weight-logs'] })
    },
  })
}

export function useDeleteWeight() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => weightApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weight-logs'] })
    },
  })
}

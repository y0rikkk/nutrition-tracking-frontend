import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { goalsApi } from '@/api/goals'

export function useGoals() {
  return useQuery({
    queryKey: ['goals'],
    queryFn: () => goalsApi.getAll({ order_by: 'started_at', desc: true }),
  })
}

export function useCreateGoal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: goalsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}

export function useUpdateGoal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { is_active?: boolean; notes?: string } }) =>
      goalsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}

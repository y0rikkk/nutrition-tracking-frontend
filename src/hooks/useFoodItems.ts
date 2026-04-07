import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { foodsApi } from '@/api/foods'

export function useFoodItems(params: Record<string, string | number | boolean>) {
  return useQuery({
    queryKey: ['food-items', params],
    queryFn: () => foodsApi.getAll(params),
  })
}

export function useCreateFood() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: foodsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['food-items'] })
    },
  })
}

export function useUpdateFood() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => foodsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['food-items'] })
    },
  })
}

export function useDeleteFood() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => foodsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['food-items'] })
    },
  })
}

import { useMutation } from '@tanstack/react-query'
import { adviceApi } from '@/api/advice'

export function useGetAdvice() {
  return useMutation({
    mutationFn: (data: { question?: string; days?: number }) => adviceApi.getAdvice(data),
  })
}

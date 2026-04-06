import { useMutation, useQuery } from '@tanstack/react-query'
import { foodsApi } from '@/api/foods'

export function useFoodSearch(query: string) {
  return useQuery({
    queryKey: ['foods', 'search', query],
    queryFn: () => foodsApi.search(query),
    enabled: query.length >= 2,
    staleTime: 60_000,
  })
}

export function useAnalyzePhoto() {
  return useMutation({
    mutationFn: (file: File) => foodsApi.analyzePhoto(file),
  })
}

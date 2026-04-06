import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/auth'

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => authApi.getMe(),
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const setUser = useAuthStore((s) => s.setUser)

  return useMutation({
    mutationFn: authApi.updateMe,
    onSuccess: (user) => {
      setUser(user)
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}

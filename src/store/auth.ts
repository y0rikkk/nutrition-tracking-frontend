import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserOut } from '@/types'

interface AuthStore {
  accessToken: string | null
  refreshToken: string | null
  user: UserOut | null
  setTokens: (access: string, refresh: string) => void
  setUser: (user: UserOut) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setTokens: (access, refresh) => set({ accessToken: access, refreshToken: refresh }),
      setUser: (user) => set({ user }),
      logout: () => set({ accessToken: null, refreshToken: null, user: null }),
    }),
    { name: 'auth-storage' },
  ),
)

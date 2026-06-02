import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import type { UserProfile } from '~/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserProfile | null>(null)
  const token = useLocalStorage<string | null>('devpulse_vault_token', null)
  const role = useLocalStorage<string | null>('devpulse_vault_role', null)

  const isAuthenticated = computed(() => !!token.value)

  const setAuth = (authData: { token: string; user: UserProfile; role: string }) => {
    token.value = authData.token
    role.value = authData.role || null
    user.value = authData.user
  }

  const logout = async () => {
    token.value = null
    user.value = null
    role.value = null
    await navigateTo('/auth/login')
  }

  return {
    user,
    token,
    role,
    isAuthenticated,
    setAuth,
    logout
  }
})
import { defineStore } from 'pinia'
import type { UserProfile } from '~/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const cookieOptions = {
    maxAge: 60 * 60 * 24 * 7,
    watch: true,
    path: '/'
  }

  const token = useCookie<string | null>('devpulse_vault_token', cookieOptions)
  const role = useCookie<string | null>('devpulse_vault_role', cookieOptions)
  const user = useCookie<UserProfile | null>('devpulse_vault_user', cookieOptions)

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
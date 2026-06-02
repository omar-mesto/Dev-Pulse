import type { LoginInput, RegisterInput } from '~/schemas/auth.schema'
import type { AuthResponse, SocialAuthResponse, GoogleRedirectResponse } from '~/types/auth'

export const useAuthService = () => {
  const api = useApiClient()

  const login = async (credentials: LoginInput): Promise<AuthResponse> => {
    return await api.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: credentials,
    })
  }

  const register = async (userData: Omit<RegisterInput, 'confirmPassword'>): Promise<AuthResponse> => {
    return await api.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: userData,
    })
  }

  const getGoogleRedirect = async (role: string = 'student'): Promise<GoogleRedirectResponse> => {
    return await api.request<GoogleRedirectResponse>('/auth/google/redirect', {
      method: 'GET',
      params: { role },
    })
  }

  const verifyGoogleCallback = async (code: string, role?: string): Promise<SocialAuthResponse> => {
    return await api.request<SocialAuthResponse>('/auth/google/callback', {
      method: 'GET',
      params: {
        code,
        ...(role && { role }),
      },
    })
  }

  return {
    login,
    register,
    getGoogleRedirect,
    verifyGoogleCallback,
  }
}
import type { ProfileCompleteResponse } from '~/types/auth'

export interface ProfileSetupPayload {
  university_id: string
  department: string
  academic_year: string
  bio?: string
  skills: string[]
}

export const useProfileService = () => {
  const api = useApiClient()

  const completeProfile = async (profileData: ProfileSetupPayload): Promise<ProfileCompleteResponse> => {
    return await api.request<ProfileCompleteResponse>('/user/profile/complete', {
      method: 'POST',
      body: profileData,
    })
  }

  return {
    completeProfile
  }
}
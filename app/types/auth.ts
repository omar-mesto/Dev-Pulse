export interface Profile {
  full_name: string
  university_id: string | null
  department: string | null
  academic_year: string | null
  skills: string[] | null
  bio: string | null
}

export interface UserProfile {
  id: number
  name: string
  username: string | null
  email: string
  role: 'student' | 'supervisor' | 'committee' | string
  status: 'active' | 'inactive' | string
  profile_completed: boolean
  profile: Profile
  last_login_at: string
  created_at: string
}

export interface AuthResponse {
  status: boolean
  message: string
  data: {
    token: string
    user: UserProfile
    role: string
  }
}

export interface SocialAuthResponse {
  status: boolean
  message: string
  data?: {
    token: string
    user: UserProfile
    role: string
    status: string
    profile_completed: boolean
  }
  errors?: {
    role?: string[]
  }
}

export interface ProfileCompleteResponse {
  status: boolean
  message: string
}

export interface GoogleRedirectResponse {
  status: boolean
  data: {
    redirect_url: string
  }
}

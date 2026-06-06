export interface PendingUsersResponse {
  status: boolean
  message?: string
  data: UserProfile[] | { data: UserProfile[] }
}

export interface ApiErrorResponse {
  data?: {
    message?: string
  }
}
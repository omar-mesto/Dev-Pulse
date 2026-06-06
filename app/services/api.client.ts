export const useApiClient = () => {
  const authStore = useAuthStore()
  const appToast = useAppToast()
  const BASE_URL = 'http://127.0.0.1:8000/api'

  const request = async <T>(endpoint: string, options: Parameters<typeof $fetch>[1] = {}): Promise<T> => {
    
    const activeToken = authStore.token

    const fetchOptions: Parameters<typeof $fetch>[1] = {
      baseURL: BASE_URL,
      method: options.method || 'GET',
      ...options,
      headers: {
        ...(activeToken && { Authorization: `Bearer ${activeToken}` }),
        'Accept': 'application/json',
        ...options.headers,
      },
      onResponseError({ response }) {
        const errorMessage = response._data?.message || 'An unexpected server error occurred.'
        if (response.status === 403) {
          appToast.warning('Your Account is Under Review', errorMessage)
        } else {
          appToast.error('Server Error', errorMessage)
        }
      }
    }

    const nativeFetch = $fetch.raw as (request: string, opts?: typeof fetchOptions) => Promise<{ _data: T }>
    const response = await nativeFetch(endpoint, fetchOptions)
    
    return response._data
  }

  return {
    request
  }
}
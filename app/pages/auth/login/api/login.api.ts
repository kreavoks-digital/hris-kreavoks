import type { LoginCredentials, AuthResponse, ApiResponse } from '~/types/auth'

export const loginApi = {
  login: async (credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> => {
    const api = useApi()
    return await api('/auth/login' as any, {
      method: 'POST',
      body: credentials,
    })
  }
}

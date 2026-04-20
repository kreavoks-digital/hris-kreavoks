import type { ApiResponse } from '~/types/auth'

export const forgotPasswordApi = {
  submit: async (email: string): Promise<ApiResponse> => {
    const api = useApi()
    return await api('/auth/forgot-password' as any, {
      method: 'POST',
      body: { email },
    })
  }
}

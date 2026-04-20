import type { ResetPasswordData, ApiResponse } from '~/types/auth'

export const resetPasswordApi = {
  reset: async (data: ResetPasswordData): Promise<ApiResponse> => {
    const api = useApi()
    return await api('/auth/reset-password' as any, {
      method: 'POST',
      body: data,
    })
  }
}

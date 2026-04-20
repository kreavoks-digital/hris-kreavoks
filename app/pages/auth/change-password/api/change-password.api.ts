import type { ChangePasswordData, ApiResponse } from '~/types/auth'

export const changePasswordApi = {
  change: async (data: ChangePasswordData): Promise<ApiResponse> => {
    const api = useApi()
    return await api('/auth/change-password' as any, {
      method: 'POST',
      body: data,
    })
  }
}

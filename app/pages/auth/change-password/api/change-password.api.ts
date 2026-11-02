import type { ApiResponse } from '~/types/auth'

export interface ChangePasswordPayload {
  oldPassword: string
  newPassword: string
}

export const changePasswordApi = {
  change: async (data: ChangePasswordPayload): Promise<ApiResponse> => {
    const api = useApi()
    return await api('/auth/change-password' as any, {
      method: 'POST',
      body: data,
    })
  }
}

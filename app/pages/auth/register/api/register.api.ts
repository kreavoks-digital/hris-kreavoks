import type { RegisterData, ApiResponse } from '~/types/auth'

export const registerApi = {
  register: async (data: RegisterData): Promise<ApiResponse> => {
    const api = useApi()
    return await api('/auth/register' as any, {
      method: 'POST',
      body: data,
    })
  }
}

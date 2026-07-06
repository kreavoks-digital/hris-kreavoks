import type { ApiResponse } from '~/types/auth'

export interface SelfRegisterData {
  fullName: string
  email: string
  password: string
  phone?: string
  address?: string
  institution?: string
  department?: string
  position?: string
}

export const registerApi = {
  register: async (data: SelfRegisterData): Promise<ApiResponse> => {
    const api = useApi()
    return await api('/auth/self-register' as any, {
      method: 'POST',
      body: data,
    })
  }
}

import type { Employee, ApiResponse } from '~/types'

export const karyawanApi = {
  getEmployees: async (): Promise<ApiResponse<Employee[]>> => {
    const api = useApi()
    return await api('/employees' as any)
  }
}

import type { Employee, ApiResponse } from '~/types'

export const employeeApi = {
  getEmployees: async (): Promise<ApiResponse<Employee[]>> => {
    const api = useApi()
    const res = await api('/users' as any)
    return {
      success: res.success,
      data: res.data.map((user: any) => ({
        id: user.id.toString(),
        npk: user.npk,
        name: user.fullName || 'Tanpa Nama',
        email: user.email,
        phone: user.phone || '-',
        department: user.department,
        position: user.position,
        status: user.isActive ? 'Aktif' : 'Nonaktif',
        role: user.role
      }))
    }
  }
}

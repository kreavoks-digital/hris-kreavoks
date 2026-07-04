import type { Employee, ApiResponse } from '~/types'

export const employeeApi = {
  getEmployees: async (page = 1, limit = 10, search = "", department = ""): Promise<ApiResponse<{ employees: Employee[], pagination: any }>> => {
    const api = useApi()
    let url = `/users?page=${page}&limit=${limit}`
    if (search) url += `&search=${encodeURIComponent(search)}`
    if (department && department !== 'none') url += `&department=${encodeURIComponent(department)}`

    const res = await api(url as any)
    return {
      success: res.success,
      data: {
        employees: (res.data || []).map((user: any) => ({
          id: user.id.toString(),
          npk: user.npk,
          name: user.fullName || 'Tanpa Nama',
          email: user.email,
          phone: user.phone || '-',
          department: user.department,
          position: user.position,
          status: user.isActive ? 'Aktif' : 'Nonaktif',
          role: user.role,
          startDate: user.startDate ? new Date(user.startDate).toISOString().split('T')[0] : "",
          endDate: user.endDate ? new Date(user.endDate).toISOString().split('T')[0] : "",
          certificateStatus: user.certificateStatus || "NONE"
        })),
        pagination: res.pagination
      }
    }
  }
}

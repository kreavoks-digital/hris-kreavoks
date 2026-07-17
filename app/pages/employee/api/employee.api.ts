import type { Employee, ApiResponse } from '~/types'

const mapEmployee = (user: any): Employee => ({
  id: user.id.toString(),
  npk: user.npk,
  name: user.fullName || user.name || 'Tanpa Nama',
  email: user.email,
  phone: user.phone || '-',
  department: user.department,
  position: user.position,
  status: user.status || (user.isActive ? 'ACTIVE' : 'SUSPENDED'),
  isActive: user.isActive,
  role: user.role,
  startDate: user.startDate ? new Date(user.startDate).toISOString().split('T')[0] : '',
  endDate: user.endDate ? new Date(user.endDate).toISOString().split('T')[0] : '',
  certificateStatus: user.certificateStatus || 'NONE',
  agreementLink: user.agreementLink || null,
  presentCount: user.presentCount || 0,
  totalWorkingDays: user.totalWorkingDays ?? null,
  remainingDays: user.remainingDays ?? null,
  institution: user.institution || null,
  address: user.address || null,
})

export const employeeApi = {
  getEmployees: async (page = 1, limit = 10, search = "", department = "", pendingVerification = false): Promise<ApiResponse<{ employees: Employee[], pagination: any }>> => {
    const api = useApi()
    let url = `/users?page=${page}&limit=${limit}`
    if (search) url += `&search=${encodeURIComponent(search)}`
    if (department && department !== 'none') url += `&department=${encodeURIComponent(department)}`
    if (pendingVerification) url += `&pendingVerification=true`

    const res = await api(url as any)
    return {
      success: res.success,
      data: {
        employees: (res.data || []).map((user: any) => mapEmployee(user)),
        pagination: res.pagination
      }
    }
  },

  getEmployeeById: async (id: string): Promise<ApiResponse<Employee>> => {
    const api = useApi()
    const res = await api(`/users/${id}` as any)

    const user = res.data?.data || res.data || res

    return {
      success: res.success ?? true,
      data: mapEmployee(user)
    }
  }
}

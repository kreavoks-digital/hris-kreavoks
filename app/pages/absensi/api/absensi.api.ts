import type { AttendanceRecord, AttendanceSummary, ApiResponse } from '~/types'

export const absensiApi = {
  getAttendance: async (date: string, isAdmin: boolean): Promise<any> => {
    const api = useApi()
    const endpoint = isAdmin ? '/attendance/history/all' : '/attendance/history'
    const res: any = await api(endpoint as any, {
      query: { date }
    })
    
    // Map backend response to frontend expected format
    const records = res.data.map((item: any) => ({
      id: item.id.toString(),
      npk: `KV-${item.userId.toString().padStart(4, '0')}`,
      employeeName: item.user?.profile?.fullName || item.user?.name || 'Unknown User',
      department: item.user?.profile?.department || (item.user && item.user.role === 'ADMIN' ? 'Management' : 'Staff'),
      date: item.date ? new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-',
      checkIn: item.clockIn ? new Date(item.clockIn).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : null,
      checkOut: item.clockOut ? new Date(item.clockOut).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : null,
      status: item.status.toLowerCase(),
      notes: ''
    }))

    // Calculate summary
    const summary = {
      present: records.filter((r: any) => r.status === 'present').length,
      permission: records.filter((r: any) => r.status === 'permission').length,
      sick: records.filter((r: any) => r.status === 'sick').length,
      absent: records.filter((r: any) => r.status === 'absent').length,
    }

    return {
      success: true,
      data: { records, summary }
    }
  },
  deleteAttendance: async (id: string): Promise<any> => {
    const api = useApi()
    return await api(`/attendance/${id}` as any, {
      method: 'DELETE'
    })
  }
}

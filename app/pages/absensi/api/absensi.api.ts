import type { AttendanceRecord, AttendanceSummary } from '~/types'

export const absensiApi = {
  getAttendance: async (date: string, isAdmin: boolean): Promise<any> => {
    const api = useApi()
    const endpoint = isAdmin ? '/attendance/history/all' : '/attendance/history'
    const res: any = await api(endpoint as any, {
      query: date ? { date } : {}
    })

    // BE-13 FIX: Gunakan npk dari profile jika tersedia, fallback ke generate dari userId
    const records: AttendanceRecord[] = res.data.map((item: any) => ({
      id: item.id.toString(),
      userId: item.userId,
      npk: item.user?.profile?.npk ?? `KV-${item.userId.toString().padStart(4, '0')}`,
      employeeName: item.user?.profile?.fullName || 'Unknown User',
      department: item.user?.profile?.department || (item.user?.role === 'ADMIN' ? 'Management' : 'Staff'),
      date: item.date ? new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-',
      checkIn: item.clockIn ? new Date(item.clockIn).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : null,
      checkOut: item.clockOut ? new Date(item.clockOut).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : null,
      status: item.status.toLowerCase(),
      notes: item.notes || ''
    }))

    // BE-12 FIX: Gunakan summary dari BE jika tersedia (isAdmin route), fallback hitung di FE
    let summary: AttendanceSummary
    if (res.summary) {
      summary = {
        present: res.summary.present || 0,
        permission: res.summary.permit || res.summary.permission || 0,
        sick: res.summary.sick || 0,
        absent: res.summary.absent || 0,
      }
    } else {
      summary = {
        present: records.filter((r) => r.status === 'present').length,
        permission: records.filter((r) => r.status === 'permission' || r.status === 'permit').length,
        sick: records.filter((r) => r.status === 'sick').length,
        absent: records.filter((r) => r.status === 'absent').length,
      }
    }

    return { success: true, data: { records, summary } }
  },

  deleteAttendance: async (id: string): Promise<any> => {
    const api = useApi()
    return await api(`/attendance/${id}` as any, { method: 'DELETE' })
  }
}

import type { AttendanceRecord, AttendanceSummary, ApiResponse } from '~/types'

export const absensiApi = {
  getAttendance: async (date: string): Promise<ApiResponse<{ records: AttendanceRecord[], summary: AttendanceSummary }>> => {
    const api = useApi()
    return await api('/attendance' as any, {
      query: { date }
    })
  }
}

export interface AttendanceRecapData {
  totalWorkingDays: number
  presentCount: number
  sickCount: number
  permitCount: number
  absentCount: number
  lateCount: number
  attendanceScore: number
}

export const certificateApi = {
  async getNextSerial(type: 'INTERN' | 'MENTOR' = 'INTERN', userId?: number | string): Promise<string> {
    const api = useApi()
    const query = userId ? `type=${type}&userId=${userId}` : `type=${type}`
    try {
      const res: any = await api(`/certificates/next-serial?${query}`)
      return res?.data?.serialNumber || ''
    } catch {
      return ''
    }
  },

  async getAttendanceRecap(userId: number | string): Promise<AttendanceRecapData | null> {
    const api = useApi()
    try {
      const res: any = await api(`/certificates/attendance-recap/${userId}`)
      return res?.data || null
    } catch {
      return null
    }
  },

  async saveCertificate(payload: any): Promise<any> {
    const api = useApi()
    try {
      const res: any = await api('/certificates', {
        method: 'POST',
        body: payload
      })
      return res?.data || res
    } catch (error) {
      console.error('Error saving certificate:', error)
      return null
    }
  },

  async getCertificates(params?: { search?: string; type?: string }): Promise<any[]> {
    const api = useApi()
    try {
      const query = new URLSearchParams()
      if (params?.search) query.append('search', params.search)
      if (params?.type) query.append('type', params.type)

      const res: any = await api(`/certificates?${query.toString()}`)
      return res?.data || []
    } catch {
      return []
    }
  },

  async verifyCertificate(serialNumber: string): Promise<any> {
    const api = useApi()
    try {
      const res: any = await api(`/certificates/verify/${encodeURIComponent(serialNumber)}`)
      return res?.data || res
    } catch {
      return null
    }
  }
}

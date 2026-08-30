export interface AttendanceRecapData {
  totalWorkingDays: number
  presentCount: number
  sickCount: number
  permitCount: number
  absentCount: number
  lateCount: number
  attendanceScore: number
  actualCompletionDate?: string | null
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
  },

  async updateCertificate(id: number, payload: any): Promise<any> {
    const api = useApi()
    try {
      const res: any = await api(`/certificates/${id}`, {
        method: 'PUT',
        body: payload
      })
      return res?.data || res
    } catch (error: any) {
      console.error('Error updating certificate:', error)
      throw error
    }
  },

  async deleteCertificate(id: number): Promise<boolean> {
    const api = useApi()
    try {
      await api(`/certificates/${id}`, {
        method: 'DELETE'
      })
      return true
    } catch (error: any) {
      console.error('Error deleting certificate:', error)
      return false
    }
  },

  async sendCertificateEmail(certificateId: number, email?: string): Promise<{ success: boolean; message: string; data?: any }> {
    const api = useApi()
    try {
      const res: any = await api(`/certificates/${certificateId}/send-email`, {
        method: 'POST',
        body: { email }
      })
      return res || { success: true, message: 'Email berhasil dikirim' }
    } catch (error: any) {
      return {
        success: false,
        message: error?.data?.message || error?.message || 'Gagal mengirim email sertifikat'
      }
    }
  }
}

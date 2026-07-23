// Trigger HMR update
import type { ApiResponse } from '~/types'

export interface MentorApplication {
  id: string
  name: string
  email: string
  phone: string | null
  currentJob: string | null
  company: string | null
  expertise: string | null
  experience: string | null
  portfolioLink: string | null
  linkedinLink: string | null
  cvFileUrl: string | null
  ktpFileUrl: string | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
}

export const mentorApplicationApi = {
  getApplications: async (page = 1, limit = 10, search = "", status = "PENDING"): Promise<ApiResponse<{ applications: MentorApplication[], pagination: any }>> => {
    const api = useApi()
    let url = `/mentor-applications?page=${page}&limit=${limit}&status=${status}`
    if (search) url += `&search=${encodeURIComponent(search)}`

    const res = await api(url as any)
    return {
      success: res.success,
      data: {
        applications: res.data || [],
        pagination: res.meta ? {
          totalItems: res.meta.total,
          totalPages: res.meta.totalPages
        } : null
      }
    }
  },

  getApplicationDetail: async (id: string): Promise<ApiResponse<MentorApplication>> => {
    const api = useApi()
    const res = await api(`/mentor-applications/${id}` as any)
    return {
      success: res.success,
      data: res.data
    }
  },

  reviewApplication: async (id: string, status: 'APPROVED' | 'REJECTED'): Promise<ApiResponse<any>> => {
    const api = useApi()
    const res = await api(`/mentor-applications/${id}/review` as any, {
      method: 'PATCH',
      body: { status }
    })
    return {
      success: res.success ?? true,
      data: res.data
    }
  }
}

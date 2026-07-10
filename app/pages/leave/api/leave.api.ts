import type { LeaveRecord, ApiResponse } from '~/types'

export const leaveApi = {
  getLeaves: async (): Promise<ApiResponse<{ leaves: LeaveRecord[], balance: { annual: number, used: number } }>> => {
    const api = useApi()
    return await api('/leaves' as any)
  },
  getLeaveById: async (id: string): Promise<ApiResponse<{ leave: LeaveRecord }>> => {
    const api = useApi()
    return await api(`/leaves/${id}` as any)
  },
  createLeave: async (data: any): Promise<ApiResponse> => {
    const api = useApi()
    return await api('/leaves' as any, {
      method: 'POST',
      body: data
    })
  },
  cancelLeave: async (id: string): Promise<ApiResponse> => {
    const api = useApi()
    return await api(`/leaves/${id}` as any, {
      method: 'DELETE'
    })
  },
  updateLeaveStatus: async (id: string, status: string): Promise<ApiResponse> => {
    const api = useApi()
    return await api(`/leaves/${id}/status` as any, {
      method: 'PUT',
      body: { status }
    })
  }
}

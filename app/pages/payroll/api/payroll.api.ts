import type { PayrollRecord, ApiResponse } from '~/types'

export const payrollApi = {
  getPayroll: async (month?: string, year?: string): Promise<ApiResponse<PayrollRecord[]>> => {
    const api = useApi()
    return await api('/payroll' as any, {
      query: { month, year }
    })
  }
}

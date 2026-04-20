import { payrollApi } from '../api/payroll.api'
import type { PayrollRecord } from '~/types'

export const usePayroll = () => {
  const selectedMonth = ref(new Date().getMonth() + 1)
  const selectedYear = ref(new Date().getFullYear())
  const searchQuery = ref("")
  const filterStatus = ref("")
  const payrolls = ref<PayrollRecord[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const filteredPayrolls = computed(() => {
    let result = payrolls.value

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter((item) => 
        item.employeeName.toLowerCase().includes(query) ||
        item.nik.toLowerCase().includes(query)
      )
    }

    if (filterStatus.value) {
      result = result.filter((item) => item.status === filterStatus.value)
    }

    return result
  })

  const fetchPayroll = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await payrollApi.getPayroll(
        selectedMonth.value.toString(),
        selectedYear.value.toString()
      )
      if (response.success) {
        payrolls.value = response.data
      }
    } catch (err: any) {
      console.error("Error fetching payroll:", err)
      error.value = "Gagal mengambil data payroll"
    } finally {
      loading.value = false
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      paid: "Sudah Dibayar",
      pending: "Pending",
      draft: "Draft",
    }
    return labels[status] || status
  }

  return {
    selectedMonth,
    selectedYear,
    searchQuery,
    filterStatus,
    filteredPayrolls,
    loading,
    error,
    fetchPayroll,
    formatCurrency,
    getStatusLabel,
  }
}

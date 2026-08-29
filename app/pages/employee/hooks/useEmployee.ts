import { employeeApi } from '../api/employee.api'
import type { Employee } from '~/types'

export const useEmployee = () => {
  const searchQuery = ref("")
  const filterDepartment = ref("")
  const page = ref(1)
  const limit = ref(15)
  const totalItems = ref(0)
  const totalPages = ref(1)
  const pendingVerification = ref(false)

  const employees = ref<Employee[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const filteredEmployees = computed(() => employees.value)

  const fetchEmployees = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await employeeApi.getEmployees(
        page.value,
        limit.value,
        searchQuery.value,
        filterDepartment.value,
        pendingVerification.value
      )
      if (response.success && response.data) {
        employees.value = response.data.employees
        if (response.data.pagination) {
          totalItems.value = response.data.pagination.totalItems
          totalPages.value = response.data.pagination.totalPages
        }
      }
    } catch (err: any) {
      console.error("Error fetching employees:", err)
      error.value = "Gagal mengambil data karyawan"
    } finally {
      loading.value = false
    }
  }

  // { immediate: false } — jangan fire saat init, biar onMounted yang handle initial fetch
  // Sehingga tidak terjadi double request saat komponen pertama kali mount
  watch([filterDepartment, pendingVerification], () => {
    page.value = 1
    fetchEmployees()
  }, { immediate: false })

  watch(page, () => {
    fetchEmployees()
  }, { immediate: false })

  // Search query dengan debounce — reset ke halaman 1 dulu
  let debounceTimeout: ReturnType<typeof setTimeout> | null = null
  watch(searchQuery, (newVal, oldVal) => {
    if (newVal === oldVal) return
    if (debounceTimeout) clearTimeout(debounceTimeout)
    debounceTimeout = setTimeout(() => {
      page.value = 1
      fetchEmployees()
    }, 400)
  }, { immediate: false })

  const resetFilters = () => {
    searchQuery.value = ""
    filterDepartment.value = ""
    page.value = 1
    fetchEmployees()
  }

  return {
    searchQuery,
    filterDepartment,
    filteredEmployees,
    employees,
    page,
    limit,
    totalItems,
    totalPages,
    loading,
    error,
    pendingVerification,
    fetchEmployees,
    resetFilters
  }
}

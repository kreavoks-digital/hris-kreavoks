import { employeeApi } from '../api/employee.api'
import type { Employee } from '~/types'

export const useEmployee = () => {
  const searchQuery = ref("")
  const filterDepartment = ref("")
  const page = ref(1)
  const limit = ref(15)
  const totalItems = ref(0)
  const totalPages = ref(1)

  const employees = ref<Employee[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const filteredEmployees = computed(() => employees.value)

  const fetchEmployees = async () => {
    loading.value = true
    error.value = null
    try {
      // Delay untuk testing skeleton
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const response = await employeeApi.getEmployees(
        page.value,
        limit.value,
        searchQuery.value,
        filterDepartment.value
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

  // Refetch when page or department filters change
  watch([page, filterDepartment], () => {
    fetchEmployees()
  })

  // Watch search query with debounce
  let debounceTimeout: any
  watch(searchQuery, () => {
    clearTimeout(debounceTimeout)
    debounceTimeout = setTimeout(() => {
      page.value = 1 // reset to first page
      fetchEmployees()
    }, 300)
  })

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
    page,
    limit,
    totalItems,
    totalPages,
    loading,
    error,
    fetchEmployees,
    resetFilters
  }
}

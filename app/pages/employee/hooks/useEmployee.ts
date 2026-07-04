import { employeeApi } from '../api/employee.api'
import type { Employee } from '~/types'

export const useEmployee = () => {
  const searchQuery = ref("")
  const filterDepartment = ref("")
  const employees = ref<Employee[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const filteredEmployees = computed(() => {
    let result = employees.value

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter((emp) => 
        emp.name.toLowerCase().includes(query) ||
        emp.npk?.toLowerCase().includes(query) || false
      )
    }

    if (filterDepartment.value) {
      result = result.filter((emp) => emp.department === filterDepartment.value)
    }

    return result
  })

  const fetchEmployees = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await employeeApi.getEmployees()
      if (response.success) {
        employees.value = response.data
      }
    } catch (err: any) {
      console.error("Error fetching employees:", err)
      error.value = "Gagal mengambil data karyawan"
    } finally {
      loading.value = false
    }
  }

  return {
    searchQuery,
    filterDepartment,
    filteredEmployees,
    loading,
    error,
    fetchEmployees,
  }
}

import { rbacApi } from '../api/rbac.api'
import { toast } from 'vue-sonner'

export const useRbac = () => {
  const users = ref<any[]>([])
  const permissions = ref<any[]>([])
  const loading = ref(false)
  const isAssigning = ref(false)

  // Modals state
  const isAssignModalOpen = ref(false)
  const selectedUser = ref<any>(null)
  const selectedPermissionIds = ref<number[]>([])

  const searchQuery = ref("")
  const page = ref(1)
  const limit = ref(15)
  const totalItems = ref(0)
  const totalPages = ref(1)

  const fetchData = async () => {
    loading.value = true
    try {


      const [usersRes, permRes] = await Promise.all([
        rbacApi.getUsers(page.value, limit.value, searchQuery.value),
        rbacApi.getPermissions()
      ])
      
      if (usersRes.success) {
        users.value = usersRes.data || []
        if (usersRes.pagination) {
          totalItems.value = usersRes.pagination.totalItems
          totalPages.value = usersRes.pagination.totalPages
        }
      }
      if (permRes.success) {
        permissions.value = permRes.data
      }
    } catch (error) {
      console.error('Failed to fetch RBAC data', error)
      toast.error('Gagal memuat data RBAC')
    } finally {
      loading.value = false
    }
  }

  const openAssignModal = (user: any) => {
    selectedUser.value = user
    selectedPermissionIds.value = user.permissions?.map((p: any) => p.id) || []
    isAssignModalOpen.value = true
  }

  const closeAssignModal = () => {
    isAssignModalOpen.value = false
    selectedUser.value = null
    selectedPermissionIds.value = []
  }

  const savePermissions = async () => {
    if (!selectedUser.value) return
    isAssigning.value = true
    
    try {
      const res = await rbacApi.assignPermissions(selectedUser.value.id, selectedPermissionIds.value)
      if (res.success) {
        toast.success('Hak akses berhasil diperbarui')
        await fetchData()
        closeAssignModal()
      }
    } catch (error) {
      console.error('Failed to update permissions', error)
      toast.error('Gagal memperbarui hak akses')
    } finally {
      isAssigning.value = false
    }
  }

  watch(page, () => {
    fetchData()
  })

  let debounceTimeout: any
  watch(searchQuery, () => {
    clearTimeout(debounceTimeout)
    debounceTimeout = setTimeout(() => {
      page.value = 1
      fetchData()
    }, 300)
  })

  return {
    users,
    permissions,
    loading,
    isAssigning,
    isAssignModalOpen,
    selectedUser,
    selectedPermissionIds,
    searchQuery,
    page,
    limit,
    totalItems,
    totalPages,
    fetchData,
    openAssignModal,
    closeAssignModal,
    savePermissions
  }
}

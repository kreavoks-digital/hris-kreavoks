import { rbacApi } from '../api/rbac.api'
import type { RoleItem, PermissionItem, RbacUserItem } from '../types'
import { toast } from 'vue-sonner'

export const useRbac = () => {
  const activeTab = ref<'roles' | 'permissions' | 'users'>('roles')

  // Data states
  const roles = ref<RoleItem[]>([])
  const permissions = ref<PermissionItem[]>([])
  const users = ref<RbacUserItem[]>([])

  // Loading states
  const loading = ref(false)
  const loadingRoles = ref(false)
  const loadingPermissions = ref(false)
  const loadingUsers = ref(false)

  // Modals & Action States
  const isRoleModalOpen = ref(false)
  const selectedRoleForEdit = ref<RoleItem | null>(null)
  const isSavingRole = ref(false)

  const isPermissionModalOpen = ref(false)
  const selectedPermissionForEdit = ref<PermissionItem | null>(null)
  const isSavingPermission = ref(false)

  const isManageRolePermissionsOpen = ref(false)
  const selectedRoleForPermissions = ref<RoleItem | null>(null)
  const selectedRolePermissionIds = ref<number[]>([])
  const isSavingRolePermissions = ref(false)

  const isUserRoleModalOpen = ref(false)
  const selectedUserForRole = ref<RbacUserItem | null>(null)
  const selectedUserRoleId = ref<number | null>(null)
  const isSavingUserRole = ref(false)

  const isAssignModalOpen = ref(false)
  const selectedUser = ref<RbacUserItem | null>(null)
  const selectedPermissionIds = ref<number[]>([])
  const isAssigning = ref(false)

  // Users Table Pagination & Search
  const searchQuery = ref("")
  const page = ref(1)
  const limit = ref(15)
  const totalItems = ref(0)
  const totalPages = ref(1)

  // ─── Fetch Methods ──────────────────────────────────────────────────────────

  const fetchRoles = async () => {
    loadingRoles.value = true
    try {
      const res = await rbacApi.getRoles()
      if (res.success) {
        roles.value = res.data || []
      }
    } catch (error: any) {
      console.error('Failed to fetch roles:', error)
      toast.error('Gagal memuat daftar role')
    } finally {
      loadingRoles.value = false
    }
  }

  const fetchPermissions = async () => {
    loadingPermissions.value = true
    try {
      const res = await rbacApi.getPermissions()
      if (res.success) {
        permissions.value = res.data || []
      }
    } catch (error: any) {
      console.error('Failed to fetch permissions:', error)
      toast.error('Gagal memuat daftar permission')
    } finally {
      loadingPermissions.value = false
    }
  }

  const fetchUsers = async () => {
    loadingUsers.value = true
    try {
      const res = await rbacApi.getUsers(page.value, limit.value, searchQuery.value)
      if (res.success) {
        users.value = res.data || []
        if (res.pagination) {
          totalItems.value = res.pagination.totalItems
          totalPages.value = res.pagination.totalPages
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch users:', error)
      toast.error('Gagal memuat daftar user')
    } finally {
      loadingUsers.value = false
    }
  }

  const fetchAllData = async () => {
    loading.value = true
    try {
      await Promise.all([
        fetchRoles(),
        fetchPermissions(),
        fetchUsers()
      ])
    } finally {
      loading.value = false
    }
  }

  // ─── Computed Stats & Groupings ─────────────────────────────────────────────

  const stats = computed(() => {
    const adminCount = users.value.filter(
      (u) => u.role === 'ADMIN' || u.customRole?.name === 'ADMIN'
    ).length

    return {
      totalRoles: roles.value.length,
      totalPermissions: permissions.value.length,
      totalUsers: totalItems.value,
      totalAdmins: adminCount,
    }
  })

  const groupedPermissions = computed(() => {
    const groups: Record<string, PermissionItem[]> = {}
    for (const p of permissions.value) {
      const mod = p.module || 'SYSTEM'
      const list = groups[mod] || []
      list.push(p)
      groups[mod] = list
    }
    return groups
  })

  // ─── Roles Operations ───────────────────────────────────────────────────────

  const openCreateRoleModal = () => {
    selectedRoleForEdit.value = null
    isRoleModalOpen.value = true
  }

  const openEditRoleModal = (role: RoleItem) => {
    selectedRoleForEdit.value = { ...role }
    isRoleModalOpen.value = true
  }

  const closeRoleModal = () => {
    isRoleModalOpen.value = false
    selectedRoleForEdit.value = null
  }

  const saveRole = async (formData: {
    name: string;
    displayName: string;
    description: string;
    app: string;
    permissionIds?: number[];
  }) => {
    isSavingRole.value = true
    try {
      if (selectedRoleForEdit.value?.id) {
        const res = await rbacApi.updateRole(selectedRoleForEdit.value.id, formData)
        if (res.success) {
          toast.success('Role berhasil diperbarui')
          await fetchRoles()
          closeRoleModal()
        }
      } else {
        const res = await rbacApi.createRole(formData)
        if (res.success) {
          toast.success('Role baru berhasil dibuat')
          await fetchRoles()
          closeRoleModal()
        }
      }
    } catch (error: any) {
      console.error('Failed to save role:', error)
      toast.error(error?.data?.message || 'Gagal menyimpan role')
    } finally {
      isSavingRole.value = false
    }
  }

  const deleteRole = async (role: RoleItem) => {
    if (role.isSystem) {
      toast.error('Role bawaan sistem tidak dapat dihapus')
      return
    }

    try {
      const res = await rbacApi.deleteRole(role.id)
      if (res.success) {
        toast.success(`Role '${role.displayName}' berhasil dihapus`)
        await fetchRoles()
      }
    } catch (error: any) {
      console.error('Failed to delete role:', error)
      toast.error(error?.data?.message || 'Gagal menghapus role')
    }
  }

  // ─── Manage Role Permissions ────────────────────────────────────────────────

  const openManageRolePermissions = (role: RoleItem) => {
    selectedRoleForPermissions.value = role
    selectedRolePermissionIds.value = role.permissions?.map((p) => p.id) || []
    isManageRolePermissionsOpen.value = true
  }

  const closeManageRolePermissions = () => {
    isManageRolePermissionsOpen.value = false
    selectedRoleForPermissions.value = null
    selectedRolePermissionIds.value = []
  }

  const saveRolePermissions = async () => {
    if (!selectedRoleForPermissions.value) return
    isSavingRolePermissions.value = true

    try {
      const res = await rbacApi.assignRolePermissions(
        selectedRoleForPermissions.value.id,
        selectedRolePermissionIds.value
      )
      if (res.success) {
        toast.success(`Hak akses role '${selectedRoleForPermissions.value.displayName}' berhasil diperbarui`)
        await fetchRoles()
        closeManageRolePermissions()
      }
    } catch (error: any) {
      console.error('Failed to update role permissions:', error)
      toast.error('Gagal memperbarui hak akses role')
    } finally {
      isSavingRolePermissions.value = false
    }
  }

  // ─── Permissions Operations ─────────────────────────────────────────────────

  const openCreatePermissionModal = () => {
    selectedPermissionForEdit.value = null
    isPermissionModalOpen.value = true
  }

  const openEditPermissionModal = (permission: PermissionItem) => {
    selectedPermissionForEdit.value = { ...permission }
    isPermissionModalOpen.value = true
  }

  const closePermissionModal = () => {
    isPermissionModalOpen.value = false
    selectedPermissionForEdit.value = null
  }

  const savePermission = async (formData: {
    name: string;
    description: string;
    module: string;
    app: string;
  }) => {
    isSavingPermission.value = true
    try {
      if (selectedPermissionForEdit.value?.id) {
        const res = await rbacApi.updatePermission(selectedPermissionForEdit.value.id, {
          description: formData.description,
          module: formData.module,
          app: formData.app,
        })
        if (res.success) {
          toast.success('Permission berhasil diperbarui')
          await Promise.all([fetchPermissions(), fetchRoles()])
          closePermissionModal()
        }
      } else {
        const res = await rbacApi.createPermission(formData)
        if (res.success) {
          toast.success('Permission baru berhasil dibuat')
          await Promise.all([fetchPermissions(), fetchRoles()])
          closePermissionModal()
        }
      }
    } catch (error: any) {
      console.error('Failed to save permission:', error)
      toast.error(error?.data?.message || 'Gagal menyimpan permission')
    } finally {
      isSavingPermission.value = false
    }
  }

  const deletePermission = async (permission: PermissionItem) => {
    try {
      const res = await rbacApi.deletePermission(permission.id)
      if (res.success) {
        toast.success(`Permission '${permission.name}' berhasil dihapus`)
        await Promise.all([fetchPermissions(), fetchRoles()])
      }
    } catch (error: any) {
      console.error('Failed to delete permission:', error)
      toast.error(error?.data?.message || 'Gagal menghapus permission')
    }
  }

  // ─── User Role Management ───────────────────────────────────────────────────

  const openUserRoleModal = (user: RbacUserItem) => {
    selectedUserForRole.value = user
    // Cocokkan ID role dari customRoleId atau cari by name
    const foundRole = roles.value.find(
      (r) => r.id === user.customRoleId || r.name === user.role
    )
    selectedUserRoleId.value = foundRole ? foundRole.id : null
    isUserRoleModalOpen.value = true
  }

  const closeUserRoleModal = () => {
    isUserRoleModalOpen.value = false
    selectedUserForRole.value = null
    selectedUserRoleId.value = null
  }

  const saveUserRole = async () => {
    if (!selectedUserForRole.value || !selectedUserRoleId.value) return
    isSavingUserRole.value = true

    try {
      const res = await rbacApi.assignUserRole(
        selectedUserForRole.value.id,
        selectedUserRoleId.value
      )
      if (res.success) {
        toast.success(`Role user '${selectedUserForRole.value.fullName || selectedUserForRole.value.email}' berhasil diubah`)
        await fetchUsers()
        closeUserRoleModal()
      }
    } catch (error: any) {
      console.error('Failed to assign user role:', error)
      toast.error('Gagal memperbarui role user')
    } finally {
      isSavingUserRole.value = false
    }
  }

  // ─── Direct User Permissions Modal (Legacy / Override) ──────────────────────

  const openAssignModal = (user: RbacUserItem) => {
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
      const res = await rbacApi.assignPermissions(
        selectedUser.value.id,
        selectedPermissionIds.value
      )
      if (res.success) {
        toast.success('Permission langsung berhasil diperbarui')
        await fetchUsers()
        closeAssignModal()
      }
    } catch (error: any) {
      console.error('Failed to update direct permissions:', error)
      toast.error('Gagal memperbarui permission user')
    } finally {
      isAssigning.value = false
    }
  }

  const triggerForgotPassword = async (email: string) => {
    try {
      toast.info('Mengirim email reset password...')
      const res = await rbacApi.sendForgotPasswordEmail(email)
      if (res.success) {
        toast.success(`Email reset password berhasil dikirim ke ${email}`)
      }
    } catch (error: any) {
      console.error('Failed to send forgot password email:', error)
      toast.error(error?.data?.message || 'Gagal mengirim email reset password')
    }
  }

  // ─── Watchers ───────────────────────────────────────────────────────────────

  watch(page, () => {
    fetchUsers()
  })

  let debounceTimeout: any
  watch(searchQuery, () => {
    clearTimeout(debounceTimeout)
    debounceTimeout = setTimeout(() => {
      page.value = 1
      fetchUsers()
    }, 300)
  })

  return {
    activeTab,
    roles,
    permissions,
    users,
    loading,
    loadingRoles,
    loadingPermissions,
    loadingUsers,
    stats,
    groupedPermissions,

    // Modals
    isRoleModalOpen,
    selectedRoleForEdit,
    isSavingRole,
    isPermissionModalOpen,
    selectedPermissionForEdit,
    isSavingPermission,
    isManageRolePermissionsOpen,
    selectedRoleForPermissions,
    selectedRolePermissionIds,
    isSavingRolePermissions,
    isUserRoleModalOpen,
    selectedUserForRole,
    selectedUserRoleId,
    isSavingUserRole,
    isAssignModalOpen,
    selectedUser,
    selectedPermissionIds,
    isAssigning,

    // Pagination
    searchQuery,
    page,
    limit,
    totalItems,
    totalPages,

    // Methods
    fetchRoles,
    fetchPermissions,
    fetchUsers,
    fetchAllData,
    openCreateRoleModal,
    openEditRoleModal,
    closeRoleModal,
    saveRole,
    deleteRole,
    openManageRolePermissions,
    closeManageRolePermissions,
    saveRolePermissions,
    openCreatePermissionModal,
    openEditPermissionModal,
    closePermissionModal,
    savePermission,
    deletePermission,
    openUserRoleModal,
    closeUserRoleModal,
    saveUserRole,
    openAssignModal,
    closeAssignModal,
    savePermissions,
    triggerForgotPassword,
  }
}

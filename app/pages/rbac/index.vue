<template>
  <div class="space-y-6">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h2 class="text-2xl font-semibold text-foreground">
          Role & Permission
        </h2>
        <p class="text-sm text-muted-foreground mt-0.5">
          Kelola role, permission, dan akses user di seluruh sistem Kreavoks.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <Button
          @click="fetchAllData"
          variant="outline"
          :disabled="loading"
          class="gap-2 text-sm text-foreground hover:bg-muted"
        >
          <RefreshCw :class="{ 'animate-spin': loading }" class="h-4 w-4" />
          Refresh
        </Button>
      </div>
    </div>

    <!-- Stats Overview Cards -->
    <RbacStatsCards :stats="stats" />

    <!-- KreaUI Tabs Navigation (from @kreavoks/kreaui) -->
    <div class="space-y-4">
      <Tabs
        v-model="activeTab"
        :items="tabItems"
        variant="pills"
        size="md"
      />

      <!-- Tab Content Area -->
      <div class="pt-1">
        <!-- Tab 1: Roles -->
        <RolesTab
          v-if="activeTab === 'roles'"
          :roles="roles"
          :loading="loadingRoles"
          :is-viewer-mode="isViewerMode"
          @create-role="openCreateRoleModal"
          @edit-role="openEditRoleModal"
          @manage-permissions="openManageRolePermissions"
          @delete-role="deleteRole"
        />

        <!-- Tab 2: Permissions -->
        <PermissionsTab
          v-else-if="activeTab === 'permissions'"
          :grouped-permissions="groupedPermissions"
          :loading="loadingPermissions"
          :is-viewer-mode="isViewerMode"
          @create-permission="openCreatePermissionModal"
          @edit-permission="openEditPermissionModal"
          @delete-permission="deletePermission"
        />

        <!-- Tab 3: Users Management -->
        <UserManagementTab
          v-else-if="activeTab === 'users'"
          :users="users"
          :loading="loadingUsers"
          v-model:search-query="searchQuery"
          v-model:page="page"
          :limit="limit"
          :total-items="totalItems"
          :total-pages="totalPages"
          :is-viewer-mode="isViewerMode"
          @refresh="fetchUsers"
          @manage-role="openUserRoleModal"
          @manage-direct-permissions="openAssignModal"
          @reset-password="triggerForgotPassword"
        />
      </div>
    </div>

    <!-- Modal: Tambah/Edit Role -->
    <RoleDialog
      v-model:open="isRoleModalOpen"
      :role="selectedRoleForEdit"
      :loading="isSavingRole"
      @save="saveRole"
    />

    <!-- Modal: Tambah/Edit Permission -->
    <PermissionDialog
      v-model:open="isPermissionModalOpen"
      :permission="selectedPermissionForEdit"
      :loading="isSavingPermission"
      @save="savePermission"
    />

    <!-- Modal: Atur Hak Akses Role -->
    <ManageRolePermissionsDialog
      v-model:open="isManageRolePermissionsOpen"
      :role="selectedRoleForPermissions"
      :grouped-permissions="groupedPermissions"
      v-model:selected-permission-ids="selectedRolePermissionIds"
      :loading="isSavingRolePermissions"
      @save="saveRolePermissions"
    />

    <!-- Modal: Ubah Role User -->
    <UserRoleDialog
      v-model:open="isUserRoleModalOpen"
      :user="selectedUserForRole"
      :roles="roles"
      v-model:selected-role-id="selectedUserRoleId"
      :loading="isSavingUserRole"
      @save="saveUserRole"
    />

    <!-- Modal: Atur Custom Permissions User -->
    <UserDirectPermissionsDialog
      v-model:open="isAssignModalOpen"
      :user="selectedUser"
      :permissions="permissions"
      v-model:selected-permission-ids="selectedPermissionIds"
      :loading="isAssigning"
      @save="savePermissions"
    />
  </div>
</template>

<script setup lang="ts">
import { RefreshCw, ShieldCheck, KeyRound, Users } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Tabs } from '@kreavoks/kreaui'

// Subcomponents
import RbacStatsCards from './components/RbacStatsCards.vue'
import RolesTab from './components/RolesTab.vue'
import PermissionsTab from './components/PermissionsTab.vue'
import UserManagementTab from './components/UserManagementTab.vue'
import RoleDialog from './components/RoleDialog.vue'
import PermissionDialog from './components/PermissionDialog.vue'
import ManageRolePermissionsDialog from './components/ManageRolePermissionsDialog.vue'
import UserRoleDialog from './components/UserRoleDialog.vue'
import UserDirectPermissionsDialog from './components/UserDirectPermissionsDialog.vue'

// Logic hook
import { useRbac } from './hooks/useRbac'

const { isViewerMode } = useViewerMode()

definePageMeta({
  layout: "default",
  middleware: ["auth", function (to, from) {
    const { user } = useAuth();
    const rawPermissions = user.value?.permissions ?? []
    const permissions: string[] = rawPermissions.map((p: any) => typeof p === 'string' ? p : p?.name).filter(Boolean)

    const canAccess = user.value?.role === 'ADMIN' || 
                      permissions.includes('manage_roles') || 
                      permissions.includes('view_all_features');

    if (!canAccess) {
      return navigateTo('/dashboard');
    }
  }],
})

const {
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
  fetchUsers,
  fetchAllData,
  openCreateRoleModal,
  openEditRoleModal,
  saveRole,
  deleteRole,
  openManageRolePermissions,
  saveRolePermissions,
  openCreatePermissionModal,
  openEditPermissionModal,
  savePermission,
  deletePermission,
  openUserRoleModal,
  saveUserRole,
  openAssignModal,
  savePermissions,
  triggerForgotPassword,
} = useRbac()

// KreaUI Tabs Items
const tabItems = computed(() => [
  { id: 'roles', label: `Role (${roles.value.length})`, icon: ShieldCheck },
  { id: 'permissions', label: `Permission (${permissions.value.length})`, icon: KeyRound },
  { id: 'users', label: `User (${totalItems.value})`, icon: Users },
])

// RBAC Page - updated
onMounted(() => {
  fetchAllData()
})
</script>

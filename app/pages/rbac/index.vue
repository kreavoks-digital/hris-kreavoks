<template>
  <div class="space-y-6 animate-in fade-in duration-500">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h2 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          RBAC Management
        </h2>
        <p class="text-slate-500 dark:text-slate-400 mt-1">
          Manage roles and permissions for all system users.
        </p>
      </div>
      <Button @click="fetchData" variant="outline" :disabled="loading" class="gap-2">
        <RefreshCw :class="{'animate-spin': loading}" class="h-4 w-4" />
        Refresh
      </Button>
    </div>

    <!-- Users Table Card -->
    <Card class="border-slate-200 dark:border-slate-800 shadow-sm">
      <CardHeader>
        <CardTitle>Daftar Akses Pengguna</CardTitle>
        <CardDescription>
          Berikut adalah daftar pengguna beserta izin spesifik yang mereka miliki.
        </CardDescription>
      </CardHeader>
      <CardContent class="p-0">
        <div class="relative overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow class="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead class="font-semibold">Nama Karyawan</TableHead>
                <TableHead class="font-semibold">Role Utama</TableHead>
                <TableHead class="font-semibold">Permissions</TableHead>
                <TableHead class="font-semibold text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-if="loading && users.length === 0">
                <TableCell colspan="4" class="h-24 text-center">
                  <div class="flex items-center justify-center gap-2 text-slate-500">
                    <Loader2 class="h-4 w-4 animate-spin" />
                    Memuat data RBAC...
                  </div>
                </TableCell>
              </TableRow>
              <TableRow v-else-if="users.length === 0">
                <TableCell colspan="4" class="h-24 text-center text-slate-500">
                  Tidak ada data pengguna ditemukan
                </TableCell>
              </TableRow>
              <template v-else>
                <TableRow v-for="user in users" :key="user.id" class="hover:bg-slate-50/50">
                  <TableCell>
                    <div class="flex flex-col">
                      <span class="font-medium text-slate-900 dark:text-slate-100">{{ user.fullName }}</span>
                      <span class="text-xs text-slate-500">{{ user.email }}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge :variant="user.role === 'ADMIN' ? 'default' : 'secondary'">
                      {{ user.role }}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div class="flex flex-wrap gap-1">
                      <Badge 
                        v-for="p in user.permissions" 
                        :key="p.id" 
                        variant="outline" 
                        class="text-xs bg-slate-50 text-slate-600 border-slate-200"
                      >
                        {{ p.name }}
                      </Badge>
                      <span v-if="!user.permissions || user.permissions.length === 0" class="text-xs text-slate-400 italic">
                        Tidak ada izin khusus
                      </span>
                    </div>
                  </TableCell>
                  <TableCell class="text-right">
                    <Button variant="ghost" size="sm" class="h-8 rounded-lg gap-1 text-kv-primary hover:text-kv-primary hover:bg-kv-primary/10" @click="openAssignModal(user)">
                      <ShieldCheck class="h-4 w-4" />
                      Kelola
                    </Button>
                  </TableCell>
                </TableRow>
              </template>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <!-- Assign Permission Modal -->
    <Dialog :open="isAssignModalOpen" @update:open="closeAssignModal">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Atur Hak Akses</DialogTitle>
          <DialogDescription>
            Pilih wewenang untuk <strong>{{ selectedUser?.fullName }}</strong>.
          </DialogDescription>
        </DialogHeader>
        
        <div class="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
          <div v-for="permission in permissions" :key="permission.id" class="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
            <Checkbox 
              :id="'perm-' + permission.id" 
              :checked="selectedPermissionIds.includes(permission.id)"
              @update:checked="(checked: boolean) => togglePermission(permission.id, checked)"
            />
            <div class="space-y-1 leading-none">
              <label
                :for="'perm-' + permission.id"
                class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-slate-900"
              >
                {{ permission.name }}
              </label>
              <p class="text-[13px] text-slate-500">
                {{ permission.description }}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="closeAssignModal" :disabled="isAssigning">
            Batal
          </Button>
          <Button @click="savePermissions" :disabled="isAssigning" class="bg-kv-primary hover:bg-kv-primary/90">
            <Loader2 v-if="isAssigning" class="mr-2 h-4 w-4 animate-spin" />
            Simpan Perubahan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { 
  ShieldCheck, 
  Loader2,
  RefreshCw
} from 'lucide-vue-next'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Checkbox } from '~/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'

import { useRbac } from './hooks/useRbac'

definePageMeta({
  layout: "default",
  middleware: ["auth", function (to, from) {
    const { user } = useAuth();
    if (user.value?.role !== 'ADMIN' && !user.value?.permissions?.includes('manage_roles')) {
      return navigateTo('/dashboard');
    }
  }],
})

const {
  users,
  permissions,
  loading,
  isAssigning,
  isAssignModalOpen,
  selectedUser,
  selectedPermissionIds,
  fetchData,
  openAssignModal,
  closeAssignModal,
  savePermissions
} = useRbac()

const togglePermission = (id: number, checked: boolean) => {
  if (checked) {
    if (!selectedPermissionIds.value.includes(id)) {
      selectedPermissionIds.value.push(id)
    }
  } else {
    selectedPermissionIds.value = selectedPermissionIds.value.filter(pid => pid !== id)
  }
}

onMounted(() => {
  fetchData()
})
</script>

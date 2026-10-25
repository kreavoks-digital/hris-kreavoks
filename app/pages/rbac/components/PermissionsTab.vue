<script setup lang="ts">
import { Plus, KeyRound, Pencil, Trash2, FolderLock } from 'lucide-vue-next'
import type { PermissionItem } from '../types'
import { Card, CardContent } from '~/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import TableSkeleton from '~/components/ui/skeleton/TableSkeleton.vue'

defineProps<{
  groupedPermissions: Record<string, PermissionItem[]>
  loading: boolean
  isViewerMode?: boolean
}>()

const emit = defineEmits<{
  (e: 'create-permission'): void
  (e: 'edit-permission', permission: PermissionItem): void
  (e: 'delete-permission', permission: PermissionItem): void
}>()

const getModuleLabel = (moduleKey: string): string => {
  const map: Record<string, string> = {
    USERS: 'Users & Employee',
    ROLES: 'RBAC & Access Control',
    ATTENDANCE: 'Attendance & Logbook',
    LETTERS: 'Letters & Certificate',
    ELEARNING: 'Kreavoks LMS',
    SYSTEM: 'System Settings',
  }
  return map[moduleKey] || moduleKey
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h3 class="text-lg font-semibold text-foreground">Daftar Permission</h3>
        <p class="text-sm text-muted-foreground mt-0.5">
          Daftar permission granular berdasarkan modul fitur.
        </p>
      </div>
      <Button
        v-if="!isViewerMode"
        @click="emit('create-permission')"
        class="bg-kv-primary hover:bg-kv-primary/90 text-white border-none gap-2 text-sm font-medium"
      >
        <Plus class="h-4 w-4" />
        Tambah Permission
      </Button>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="space-y-4">
      <Card v-for="i in 3" :key="i" class="rounded-3xl border-border bg-card p-6">
        <TableSkeleton :rows="3" :columns="4" />
      </Card>
    </div>

    <!-- Empty State -->
    <Card
      v-else-if="Object.keys(groupedPermissions).length === 0"
      class="rounded-3xl border-border bg-card"
    >
      <CardContent class="py-16 text-center text-muted-foreground text-sm">
        Belum ada permission.
      </CardContent>
    </Card>

    <!-- Grouped Tables by Module -->
    <div v-else class="space-y-6">
      <div
        v-for="(perms, moduleName) in groupedPermissions"
        :key="moduleName"
        class="space-y-3"
      >
        <!-- Module Header Title -->
        <div class="flex items-center justify-between px-1">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-2xl bg-muted flex items-center justify-center text-foreground shrink-0">
              <FolderLock class="w-4 h-4 text-kv-primary" />
            </div>
            <div>
              <h4 class="text-base font-semibold text-foreground">
                {{ getModuleLabel(moduleName as string) }}
              </h4>
              <p class="text-xs text-muted-foreground">
                {{ perms.length }} permission
              </p>
            </div>
          </div>
        </div>

        <!-- Table Card -->
        <Card class="rounded-3xl border-border bg-card overflow-hidden">
          <CardContent class="p-0">
            <div class="relative overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow class="border-border">
                    <TableHead class="text-muted-foreground font-semibold text-sm">Permission Code</TableHead>
                    <TableHead class="text-muted-foreground font-semibold text-sm">App</TableHead>
                    <TableHead class="text-muted-foreground font-semibold text-sm">Deskripsi</TableHead>
                    <TableHead class="text-muted-foreground font-semibold text-sm">Digunakan</TableHead>
                    <TableHead class="text-muted-foreground font-semibold text-sm text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow
                    v-for="p in perms"
                    :key="p.id"
                    class="border-border hover:bg-muted/40 transition-colors"
                  >
                    <!-- Kode Izin -->
                    <TableCell>
                      <div class="flex items-center gap-2">
                        <KeyRound class="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span class="text-sm font-medium text-foreground">
                          {{ p.name }}
                        </span>
                      </div>
                    </TableCell>

                    <!-- Aplikasi -->
                    <TableCell>
                      <Badge
                        variant="outline"
                        class="rounded-xl text-xs border-border text-foreground font-normal"
                      >
                        {{ p.app || 'HRIS' }}
                      </Badge>
                    </TableCell>

                    <!-- Deskripsi -->
                    <TableCell class="max-w-md">
                      <p class="text-sm text-muted-foreground">
                        {{ p.description || '-' }}
                      </p>
                    </TableCell>

                    <!-- Digunakan Di -->
                    <TableCell>
                      <span class="text-sm text-muted-foreground">
                        {{ p._count?.roles || 0 }} role • {{ p._count?.users || 0 }} user
                      </span>
                    </TableCell>

                    <!-- Aksi -->
                    <TableCell class="text-right">
                      <div v-if="!isViewerMode" class="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          @click="emit('edit-permission', p)"
                          class="h-8 w-8 text-muted-foreground hover:text-foreground"
                          title="Edit permission"
                        >
                          <Pencil class="h-3.5 w-3.5" />
                          <span class="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          @click="emit('delete-permission', p)"
                          class="h-8 w-8 text-destructive hover:bg-destructive/10"
                          title="Hapus permission"
                        >
                          <Trash2 class="h-3.5 w-3.5" />
                          <span class="sr-only">Hapus</span>
                        </Button>
                      </div>
                      <span v-else class="text-sm text-muted-foreground italic">
                        View only
                      </span>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

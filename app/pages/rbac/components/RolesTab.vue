<script setup lang="ts">
import { Plus, Pencil, Trash2, Sliders, User } from 'lucide-vue-next'
import type { RoleItem } from '../types'
import { Card, CardContent } from '~/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import TableSkeleton from '~/components/ui/skeleton/TableSkeleton.vue'
import { getRoleMascot } from '../utils/mascot'

defineProps<{
  roles: RoleItem[]
  loading: boolean
  isViewerMode?: boolean
}>()

const emit = defineEmits<{
  (e: 'create-role'): void
  (e: 'edit-role', role: RoleItem): void
  (e: 'manage-permissions', role: RoleItem): void
  (e: 'delete-role', role: RoleItem): void
}>()
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h3 class="text-lg font-semibold text-foreground">Daftar Role</h3>
        <p class="text-sm text-muted-foreground mt-0.5">
          Role dan paket permission yang tersedia di ekosistem Kreavoks.
        </p>
      </div>
      <Button
        v-if="!isViewerMode"
        @click="emit('create-role')"
        class="bg-kv-primary hover:bg-kv-primary/90 text-white border-none gap-2 text-sm font-medium"
      >
        <Plus class="h-4 w-4" />
        Tambah Role
      </Button>
    </div>

    <!-- Table Card -->
    <Card class="rounded-3xl border-border bg-card overflow-hidden">
      <CardContent class="p-0">
        <div class="relative overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow class="border-border">
                <TableHead class="text-muted-foreground font-semibold text-sm">Role</TableHead>
                <TableHead class="text-muted-foreground font-semibold text-sm">App</TableHead>
                <TableHead class="text-muted-foreground font-semibold text-sm">Deskripsi</TableHead>
                <TableHead class="text-muted-foreground font-semibold text-sm">Permissions</TableHead>
                <TableHead class="text-muted-foreground font-semibold text-sm">User</TableHead>
                <TableHead class="text-muted-foreground font-semibold text-sm text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableSkeleton v-if="loading" :rows="4" :columns="6" />

              <TableRow v-else-if="roles.length === 0">
                <TableCell colspan="6" class="h-32 text-center text-muted-foreground text-sm">
                  Belum ada role.
                </TableCell>
              </TableRow>

              <template v-else>
                <TableRow
                  v-for="role in roles"
                  :key="role.id"
                  class="border-border hover:bg-muted/40 transition-colors"
                >
                  <!-- Role Name & Mascot -->
                  <TableCell>
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-2xl bg-muted/70 flex items-center justify-center shrink-0 overflow-hidden">
                        <img
                          :src="getRoleMascot(role.name)"
                          :alt="role.displayName"
                          class="w-7 h-7 object-contain"
                        />
                      </div>
                      <div class="flex flex-col">
                        <div class="flex items-center gap-1.5">
                          <span class="font-medium text-foreground text-sm">
                            {{ role.displayName }}
                          </span>
                          <Badge
                            v-if="role.isSystem"
                            variant="secondary"
                            class="rounded-lg text-xs py-0 px-1.5 font-normal"
                          >
                            Default
                          </Badge>
                        </div>
                        <span class="text-xs text-muted-foreground mt-0.5">
                          {{ role.name }}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <!-- App Scope -->
                  <TableCell>
                    <Badge
                      variant="outline"
                      class="rounded-xl text-xs border-border text-foreground font-normal"
                    >
                      {{ role.app || 'HRIS' }}
                    </Badge>
                  </TableCell>

                  <!-- Deskripsi -->
                  <TableCell class="max-w-xs">
                    <p class="text-sm text-muted-foreground line-clamp-2">
                      {{ role.description || '-' }}
                    </p>
                  </TableCell>

                  <!-- Permissions Terkait -->
                  <TableCell class="max-w-md">
                    <div v-if="role.permissions && role.permissions.length > 0" class="flex flex-wrap gap-1.5">
                      <Badge
                        v-for="p in role.permissions.slice(0, 3)"
                        :key="p.id"
                        variant="secondary"
                        class="rounded-xl text-xs bg-muted text-foreground border-border font-normal"
                      >
                        {{ p.name }}
                      </Badge>
                      <Badge
                        v-if="role.permissions.length > 3"
                        variant="outline"
                        class="rounded-xl text-xs border-border text-muted-foreground font-normal"
                      >
                        +{{ role.permissions.length - 3 }} lainnya
                      </Badge>
                    </div>
                    <span v-else class="text-sm text-muted-foreground italic">
                      Tanpa permission khusus
                    </span>
                  </TableCell>

                  <!-- Jumlah User -->
                  <TableCell>
                    <div class="flex items-center gap-2">
                      <div class="flex -space-x-1.5 items-center overflow-hidden py-0.5">
                        <div
                          v-for="i in Math.min(Math.max(role.usersCount || 0, 1), 4)"
                          :key="i"
                          class="w-6 h-6 rounded-full bg-muted border-2 border-card flex items-center justify-center text-muted-foreground shrink-0"
                        >
                          <User class="w-3 h-3" />
                        </div>
                      </div>
                      <span class="text-xs font-medium text-muted-foreground">
                        {{ role.usersCount || 0 }}
                      </span>
                    </div>
                  </TableCell>

                  <!-- Aksi -->
                  <TableCell class="text-right">
                    <div v-if="!isViewerMode" class="flex items-center justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        @click="emit('manage-permissions', role)"
                        class="h-8 gap-1.5 text-xs font-medium"
                      >
                        <Sliders class="h-3.5 w-3.5 text-kv-primary" />
                        Manage Permissions
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        @click="emit('edit-role', role)"
                        class="h-8 w-8 text-muted-foreground hover:text-foreground"
                        title="Edit role"
                      >
                        <Pencil class="h-3.5 w-3.5" />
                        <span class="sr-only">Edit</span>
                      </Button>
                      <Button
                        v-if="!role.isSystem"
                        variant="ghost"
                        size="icon"
                        @click="emit('delete-role', role)"
                        class="h-8 w-8 text-destructive hover:bg-destructive/10"
                        title="Hapus role"
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
              </template>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

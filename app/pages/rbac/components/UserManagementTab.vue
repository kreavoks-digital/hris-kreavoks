<script setup lang="ts">
import { Search, RefreshCw, Key, ShieldCheck, UserCheck, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import type { RbacUserItem } from '../types'
import { Card, CardContent } from '~/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Badge } from '~/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import TableSkeleton from '~/components/ui/skeleton/TableSkeleton.vue'
import { getRoleMascot } from '../utils/mascot'

const props = defineProps<{
  users: RbacUserItem[]
  loading: boolean
  searchQuery: string
  page: number
  limit: number
  totalItems: number
  totalPages: number
  isViewerMode?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:searchQuery', val: string): void
  (e: 'update:page', val: number): void
  (e: 'refresh'): void
  (e: 'manage-role', user: RbacUserItem): void
  (e: 'manage-direct-permissions', user: RbacUserItem): void
  (e: 'reset-password', email: string): void
}>()

const searchValue = computed({
  get: () => props.searchQuery,
  set: (val: string) => emit('update:searchQuery', val)
})

const getRoleBadgeVariant = (roleName: string) => {
  const norm = (roleName || '').toUpperCase()
  if (norm.includes('ADMIN')) return 'default'
  if (norm.includes('MENTOR')) return 'secondary'
  return 'outline'
}
</script>

<template>
  <div class="space-y-4">
    <!-- Header with Search & Refresh -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h3 class="text-lg font-semibold text-foreground">User Access</h3>
        <p class="text-sm text-muted-foreground mt-0.5">
          Role dan hak akses khusus setiap user.
        </p>
      </div>

      <div class="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
        <div class="relative w-full sm:w-72">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            v-model="searchValue"
            placeholder="Cari user (nama, email, NPK)..."
            class="pl-9 bg-card border-border rounded-2xl w-full text-sm"
          />
        </div>
        <Button
          @click="emit('refresh')"
          variant="outline"
          :disabled="loading"
          class="gap-2 text-sm text-foreground hover:bg-muted"
        >
          <RefreshCw :class="{ 'animate-spin': loading }" class="h-4 w-4" />
          Refresh
        </Button>
      </div>
    </div>

    <!-- Table Card -->
    <Card class="rounded-3xl border-border bg-card overflow-hidden">
      <CardContent class="p-0">
        <div class="relative overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow class="border-border">
                <TableHead class="text-muted-foreground font-semibold text-sm">User</TableHead>
                <TableHead class="text-muted-foreground font-semibold text-sm">Role</TableHead>
                <TableHead class="text-muted-foreground font-semibold text-sm">Permissions</TableHead>
                <TableHead class="text-muted-foreground font-semibold text-sm text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableSkeleton v-if="loading" :rows="5" :columns="4" />

              <TableRow v-else-if="users.length === 0">
                <TableCell colspan="4" class="h-32 text-center text-muted-foreground text-sm">
                  User tidak ditemukan.
                </TableCell>
              </TableRow>

              <template v-else>
                <TableRow
                  v-for="user in users"
                  :key="user.id"
                  class="border-border hover:bg-muted/40 transition-colors"
                >
                  <!-- Nama User -->
                  <TableCell>
                    <div class="flex items-center gap-3">
                      <Avatar class="h-9 w-9 rounded-full border border-border">
                        <AvatarImage :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fullName || user.email}`" />
                        <AvatarFallback>{{ user.fullName ? user.fullName.charAt(0) : 'U' }}</AvatarFallback>
                      </Avatar>
                      <div class="flex flex-col">
                        <span class="font-medium text-foreground text-sm">
                          {{ user.fullName || 'User' }}
                        </span>
                        <div class="flex items-center gap-2 mt-0.5">
                          <span class="text-xs text-muted-foreground">{{ user.email }}</span>
                          <span v-if="user.npk" class="text-xs text-muted-foreground">
                            • {{ user.npk }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <!-- Role User (with Mascot) -->
                  <TableCell>
                    <div class="flex items-center gap-2">
                      <div class="w-7 h-7 rounded-full bg-muted/60 flex items-center justify-center shrink-0 overflow-hidden">
                        <img
                          :src="getRoleMascot(user.customRole?.name || user.role)"
                          :alt="user.customRole?.displayName || user.role"
                          class="w-5 h-5 object-contain"
                        />
                      </div>
                      <div class="flex flex-col">
                        <Badge
                          :variant="getRoleBadgeVariant(user.customRole?.name || user.role)"
                          class="rounded-xl text-xs py-0.5 px-2 font-normal"
                          :class="
                            user.role === 'ADMIN' || user.customRole?.name === 'ADMIN'
                              ? 'bg-kv-primary text-white border-transparent'
                              : ''
                          "
                        >
                          {{ user.customRole?.displayName || user.customRole?.name || user.role }}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>

                  <!-- Permissions Terpasang -->
                  <TableCell class="max-w-md">
                    <div class="flex flex-wrap gap-1.5">
                      <!-- Badge Default Role Summary -->
                      <Badge
                        v-if="user.role === 'ADMIN' || user.customRole?.name === 'ADMIN'"
                        variant="outline"
                        class="rounded-xl text-xs bg-muted text-foreground border-border font-normal"
                      >
                        Full System Access
                      </Badge>
                      <Badge
                        v-else-if="user.role === 'MENTOR' || user.customRole?.name === 'MENTOR'"
                        variant="outline"
                        class="rounded-xl text-xs bg-muted text-foreground border-border font-normal"
                      >
                        Review Logbook & LMS
                      </Badge>
                      <Badge
                        v-else
                        variant="outline"
                        class="rounded-xl text-xs bg-muted text-foreground border-border font-normal"
                      >
                        Presensi & Logbook
                      </Badge>

                      <!-- Extra Assigned Direct Permissions -->
                      <Badge
                        v-for="p in user.permissions"
                        :key="p.id"
                        variant="outline"
                        class="rounded-xl text-xs bg-muted text-foreground border-border font-normal"
                      >
                        {{ p.name }}
                      </Badge>
                    </div>
                  </TableCell>

                  <!-- Aksi -->
                  <TableCell class="text-right">
                    <div v-if="!isViewerMode" class="flex items-center justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        @click="emit('manage-role', user)"
                        class="h-8 gap-1.5 text-xs font-medium"
                        title="Ubah role user"
                      >
                        <UserCheck class="h-3.5 w-3.5 text-kv-primary" />
                        Ubah Role
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        @click="emit('manage-direct-permissions', user)"
                        class="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                        title="Atur custom permission"
                      >
                        <ShieldCheck class="h-3.5 w-3.5" />
                        Custom Izin
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        @click="emit('reset-password', user.email)"
                        class="h-8 w-8 text-muted-foreground hover:text-foreground"
                        title="Reset password"
                      >
                        <Key class="h-3.5 w-3.5" />
                        <span class="sr-only">Reset Password</span>
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

        <!-- Pagination Section -->
        <div class="flex items-center justify-between px-6 py-4 border-t border-border">
          <div>
            <p class="text-sm text-muted-foreground">
              Menampilkan
              <span class="font-medium text-foreground">
                {{ totalItems === 0 ? 0 : (page - 1) * limit + 1 }}
              </span>
              sampai
              <span class="font-medium text-foreground">
                {{ Math.min(page * limit, totalItems) }}
              </span>
              dari
              <span class="font-medium text-foreground">{{ totalItems }}</span>
              user
            </p>
          </div>
          <div>
            <nav class="inline-flex items-center gap-1.5" aria-label="Pagination">
              <Button
                variant="outline"
                size="icon"
                :disabled="page === 1"
                @click="emit('update:page', page - 1)"
                class="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft class="h-4 w-4" />
              </Button>

              <template v-for="p in totalPages" :key="p">
                <Button
                  v-if="p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)"
                  variant="outline"
                  size="sm"
                  @click="emit('update:page', p)"
                  class="h-8 w-8 text-sm font-medium"
                  :class="
                    page === p
                      ? 'bg-kv-primary text-white border-transparent hover:bg-kv-primary/90'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  "
                >
                  {{ p }}
                </Button>
                <span
                  v-else-if="(p === 2 && page > 3) || (p === totalPages - 1 && page < totalPages - 2)"
                  class="inline-flex items-center px-1 text-sm text-muted-foreground"
                >
                  ...
                </span>
              </template>

              <Button
                variant="outline"
                size="icon"
                :disabled="page === totalPages || totalPages === 0"
                @click="emit('update:page', page + 1)"
                class="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <ChevronRight class="h-4 w-4" />
              </Button>
            </nav>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

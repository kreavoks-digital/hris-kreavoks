<script setup lang="ts">
import { Loader2, Search, FolderLock } from 'lucide-vue-next'
import type { RoleItem, PermissionItem } from '../types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Badge } from '~/components/ui/badge'
import { Checkbox } from '~/components/ui/checkbox'

const props = defineProps<{
  open: boolean
  role: RoleItem | null
  groupedPermissions: Record<string, PermissionItem[]>
  selectedPermissionIds: number[]
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void
  (e: 'update:selectedPermissionIds', val: number[]): void
  (e: 'save'): void
}>()

const localSearch = ref('')

const currentIds = computed({
  get: () => props.selectedPermissionIds,
  set: (val: number[]) => emit('update:selectedPermissionIds', val),
})

const togglePermission = (id: number) => {
  if (currentIds.value.includes(id)) {
    currentIds.value = currentIds.value.filter((pid) => pid !== id)
  } else {
    currentIds.value = [...currentIds.value, id]
  }
}

const toggleModule = (perms: PermissionItem[]) => {
  const permIds = perms.map((p) => p.id)
  const allSelected = permIds.every((id) => currentIds.value.includes(id))

  if (allSelected) {
    currentIds.value = currentIds.value.filter((id) => !permIds.includes(id))
  } else {
    const newIds = new Set([...currentIds.value, ...permIds])
    currentIds.value = Array.from(newIds)
  }
}

const isModuleAllSelected = (perms: PermissionItem[]): boolean => {
  if (perms.length === 0) return false
  return perms.every((p) => currentIds.value.includes(p.id))
}

const filteredGroupedPermissions = computed(() => {
  if (!localSearch.value.trim()) return props.groupedPermissions

  const q = localSearch.value.trim().toLowerCase()
  const result: Record<string, PermissionItem[]> = {}

  for (const [mod, perms] of Object.entries(props.groupedPermissions)) {
    const matched = perms.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
    )
    if (matched.length > 0) {
      result[mod] = matched
    }
  }

  return result
})

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
  <Dialog :open="open" @update:open="(val) => emit('update:open', val)">
    <DialogContent class="sm:max-w-[700px] max-h-[85vh] flex flex-col rounded-3xl border-border bg-card p-6">
      <DialogHeader>
        <div class="flex items-center gap-2">
          <DialogTitle class="text-foreground text-lg font-semibold">
            Manage Permissions: {{ role?.displayName }}
          </DialogTitle>
          <Badge variant="outline" class="rounded-xl text-xs border-border text-muted-foreground font-normal">
            {{ role?.name }}
          </Badge>
        </div>
        <DialogDescription class="text-muted-foreground text-sm">
          Pilih permission yang aktif untuk role ini.
        </DialogDescription>
      </DialogHeader>

      <!-- Search & Overview -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            v-model="localSearch"
            placeholder="Filter permissions..."
            class="pl-9 rounded-2xl border-border bg-background text-sm w-full"
          />
        </div>
        <div class="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
          <span class="font-medium text-foreground">{{ currentIds.length }}</span> terpilih
        </div>
      </div>

      <!-- Permission Modules List (Scrollable) -->
      <div class="flex-1 overflow-y-auto space-y-4 pr-1 py-3 max-h-[48vh]">
        <div
          v-for="(perms, moduleName) in filteredGroupedPermissions"
          :key="moduleName"
          class="rounded-2xl border border-border bg-background p-4 space-y-3"
        >
          <!-- Module Title & Toggle -->
          <div class="flex items-center justify-between border-b border-border pb-2.5">
            <div class="flex items-center gap-2">
              <FolderLock class="w-4 h-4 text-kv-primary" />
              <span class="font-medium text-foreground text-sm">
                {{ getModuleLabel(moduleName as string) }}
              </span>
              <span class="text-xs text-muted-foreground">
                ({{ perms.filter((p) => currentIds.includes(p.id)).length }}/{{ perms.length }})
              </span>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              @click="toggleModule(perms)"
              class="h-7 text-xs text-muted-foreground hover:text-foreground"
            >
              {{ isModuleAllSelected(perms) ? 'Deselect All' : 'Select All' }}
            </Button>
          </div>

          <!-- Permissions Checkboxes Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div
              v-for="p in perms"
              :key="p.id"
              @click="togglePermission(p.id)"
              class="flex items-start gap-3 p-2.5 rounded-2xl border border-border/60 hover:border-kv-primary/50 hover:bg-muted/30 cursor-pointer transition-colors"
              :class="currentIds.includes(p.id) ? 'bg-kv-primary/5 border-kv-primary/30' : ''"
            >
              <Checkbox
                :id="'perm-' + p.id"
                :model-value="currentIds.includes(p.id)"
                :checked="currentIds.includes(p.id)"
                @update:model-value="togglePermission(p.id)"
                @click.stop
                class="rounded-md mt-0.5"
              />
              <div class="flex flex-col min-w-0 select-none">
                <span class="font-medium text-sm text-foreground truncate">
                  {{ p.name }}
                </span>
                <span class="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                  {{ p.description || '-' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="Object.keys(filteredGroupedPermissions).length === 0"
          class="text-center py-8 text-sm text-muted-foreground"
        >
          Tidak ada permission yang cocok.
        </div>
      </div>

      <DialogFooter class="pt-3 border-t border-border">
        <Button
          type="button"
          variant="outline"
          @click="emit('update:open', false)"
          :disabled="loading"
        >
          Batal
        </Button>
        <Button
          type="button"
          @click="emit('save')"
          :disabled="loading"
          class="bg-kv-primary hover:bg-kv-primary/90 text-white border-none"
        >
          <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
          Simpan Permissions
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

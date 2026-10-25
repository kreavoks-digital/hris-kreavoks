<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'
import type { RbacUserItem, PermissionItem } from '../types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'

const props = defineProps<{
  open: boolean
  user: RbacUserItem | null
  permissions: PermissionItem[]
  selectedPermissionIds: number[]
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void
  (e: 'update:selectedPermissionIds', val: number[]): void
  (e: 'save'): void
}>()

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
</script>

<template>
  <Dialog :open="open" @update:open="(val) => emit('update:open', val)">
    <DialogContent class="sm:max-w-[480px] rounded-3xl border-border bg-card p-6">
      <DialogHeader>
        <DialogTitle class="text-foreground text-lg font-semibold">
          Custom Permission: {{ user?.fullName || user?.email }}
        </DialogTitle>
        <DialogDescription class="text-muted-foreground text-sm">
          Pilih tambahan permission khusus di luar role utama untuk user ini.
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-2.5 py-3 max-h-[50vh] overflow-y-auto pr-1">
        <div
          v-for="permission in permissions"
          :key="permission.id"
          @click="togglePermission(permission.id)"
          class="flex items-start gap-3 p-3 rounded-2xl border border-border cursor-pointer hover:bg-muted/40 transition-colors"
          :class="currentIds.includes(permission.id) ? 'bg-kv-primary/5 border-kv-primary/30' : ''"
        >
          <Checkbox
            :id="'direct-perm-' + permission.id"
            :model-value="currentIds.includes(permission.id)"
            :checked="currentIds.includes(permission.id)"
            @update:model-value="togglePermission(permission.id)"
            @click.stop
            class="rounded-md mt-0.5"
          />
          <div class="space-y-1 select-none min-w-0">
            <span class="text-sm font-medium text-foreground block">
              {{ permission.name }}
            </span>
            <p class="text-xs text-muted-foreground">
              {{ permission.description || '-' }}
            </p>
          </div>
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
          Simpan Custom Izin
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

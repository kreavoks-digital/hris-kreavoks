<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'
import type { PermissionItem } from '../types'
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
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'

const props = defineProps<{
  open: boolean
  permission: PermissionItem | null
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void
  (e: 'save', formData: {
    name: string
    description: string
    module: string
    app: string
  }): void
}>()

const form = ref({
  name: '',
  description: '',
  module: 'SYSTEM',
  app: 'HRIS',
})

watch(
  () => props.permission,
  (newPerm) => {
    if (newPerm) {
      form.value = {
        name: newPerm.name || '',
        description: newPerm.description || '',
        module: newPerm.module || 'SYSTEM',
        app: newPerm.app || 'HRIS',
      }
    } else {
      form.value = {
        name: '',
        description: '',
        module: 'SYSTEM',
        app: 'HRIS',
      }
    }
  },
  { immediate: true }
)

const handleSubmit = () => {
  if (!form.value.name.trim()) return
  emit('save', {
    name: form.value.name.trim().toLowerCase(),
    description: form.value.description.trim(),
    module: form.value.module,
    app: form.value.app,
  })
}
</script>

<template>
  <Dialog :open="open" @update:open="(val) => emit('update:open', val)">
    <DialogContent class="sm:max-w-[480px] rounded-3xl border-border bg-card">
      <DialogHeader>
        <DialogTitle class="text-foreground text-lg font-semibold">
          {{ permission ? 'Edit Permission' : 'Tambah Permission' }}
        </DialogTitle>
        <DialogDescription class="text-muted-foreground text-sm">
          {{
            permission
              ? 'Ubah konfigurasi permission.'
              : 'Daftarkan permission baru untuk fitur aplikasi.'
          }}
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4 py-2">
        <!-- Kode Izin -->
        <div class="space-y-2">
          <Label for="perm-name" class="text-sm font-medium text-foreground">
            Permission Code
          </Label>
          <Input
            id="perm-name"
            v-model="form.name"
            :disabled="Boolean(permission)"
            placeholder="Contoh: hris:letters:export, lms:courses:publish"
            class="rounded-2xl border-border bg-background text-sm"
            required
          />
          <p v-if="permission" class="text-xs text-muted-foreground">
            Permission code tidak dapat diubah setelah dibuat.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Modul Kategori -->
          <div class="space-y-2">
            <Label for="perm-module" class="text-sm font-medium text-foreground">
              Module
            </Label>
            <select
              id="perm-module"
              v-model="form.module"
              class="w-full h-10 px-3 rounded-2xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="USERS">Users & Employee</option>
              <option value="ROLES">RBAC & Roles</option>
              <option value="ATTENDANCE">Attendance & Logbook</option>
              <option value="LETTERS">Letters & Certificate</option>
              <option value="ELEARNING">Kreavoks LMS</option>
              <option value="SYSTEM">System Settings</option>
            </select>
          </div>

          <!-- Aplikasi -->
          <div class="space-y-2">
            <Label for="perm-app" class="text-sm font-medium text-foreground">
              Target App
            </Label>
            <select
              id="perm-app"
              v-model="form.app"
              class="w-full h-10 px-3 rounded-2xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="HRIS">HRIS</option>
              <option value="LMS">Kreavoks LMS</option>
              <option value="GLOBAL">Global</option>
            </select>
          </div>
        </div>

        <!-- Deskripsi Izin -->
        <div class="space-y-2">
          <Label for="perm-desc" class="text-sm font-medium text-foreground">
            Deskripsi
          </Label>
          <Textarea
            id="perm-desc"
            v-model="form.description"
            rows="3"
            placeholder="Keterangan singkat fungsi permission ini..."
            class="rounded-2xl border-border bg-background text-sm"
          />
        </div>

        <DialogFooter class="pt-4">
          <Button
            type="button"
            variant="outline"
            @click="emit('update:open', false)"
            :disabled="loading"
          >
            Batal
          </Button>
          <Button
            type="submit"
            :disabled="loading"
            class="bg-kv-primary hover:bg-kv-primary/90 text-white border-none"
          >
            <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
            {{ permission ? 'Simpan' : 'Tambah Permission' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

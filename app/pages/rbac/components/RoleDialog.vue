<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'
import type { RoleItem } from '../types'
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
  role: RoleItem | null
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void
  (e: 'save', formData: {
    name: string
    displayName: string
    description: string
    app: string
  }): void
}>()

const form = ref({
  name: '',
  displayName: '',
  description: '',
  app: 'HRIS',
})

watch(
  () => props.role,
  (newRole) => {
    if (newRole) {
      form.value = {
        name: newRole.name || '',
        displayName: newRole.displayName || '',
        description: newRole.description || '',
        app: newRole.app || 'HRIS',
      }
    } else {
      form.value = {
        name: '',
        displayName: '',
        description: '',
        app: 'HRIS',
      }
    }
  },
  { immediate: true }
)

const handleDisplayNameInput = () => {
  if (!props.role) {
    form.value.name = form.value.displayName
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '_')
      .replace(/_+/g, '_')
  }
}

const handleSubmit = () => {
  if (!form.value.displayName.trim() || !form.value.name.trim()) return
  emit('save', {
    name: form.value.name.trim(),
    displayName: form.value.displayName.trim(),
    description: form.value.description.trim(),
    app: form.value.app,
  })
}
</script>

<template>
  <Dialog :open="open" @update:open="(val) => emit('update:open', val)">
    <DialogContent class="sm:max-w-[480px] rounded-3xl border-border bg-card">
      <DialogHeader>
        <DialogTitle class="text-foreground text-lg font-semibold">
          {{ role ? 'Edit Role' : 'Tambah Role' }}
        </DialogTitle>
        <DialogDescription class="text-muted-foreground text-sm">
          {{
            role
              ? 'Ubah informasi dan konfigurasi role.'
              : 'Tentukan nama role dan cakupan aplikasinya.'
          }}
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4 py-2">
        <!-- Display Name -->
        <div class="space-y-2">
          <Label for="role-display-name" class="text-sm font-medium text-foreground">
            Nama Role
          </Label>
          <Input
            id="role-display-name"
            v-model="form.displayName"
            @input="handleDisplayNameInput"
            placeholder="Contoh: HR Specialist, Lead Mentor"
            class="rounded-2xl border-border bg-background text-sm"
            required
          />
        </div>

        <!-- Role Code -->
        <div class="space-y-2">
          <Label for="role-name" class="text-sm font-medium text-foreground">
            Role Code (ID)
          </Label>
          <Input
            id="role-name"
            v-model="form.name"
            :disabled="Boolean(role?.isSystem)"
            placeholder="Contoh: HR_SPECIALIST, LEAD_MENTOR"
            class="rounded-2xl border-border bg-background text-sm"
            required
          />
          <p v-if="role?.isSystem" class="text-xs text-muted-foreground">
            Role code sistem tidak dapat diubah.
          </p>
        </div>

        <!-- App Scope -->
        <div class="space-y-2">
          <Label for="role-app" class="text-sm font-medium text-foreground">
            Target App
          </Label>
          <select
            id="role-app"
            v-model="form.app"
            class="w-full h-10 px-3 rounded-2xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="HRIS">HRIS</option>
            <option value="LMS">Kreavoks LMS</option>
            <option value="GLOBAL">Global (Semua App via SSO)</option>
          </select>
        </div>

        <!-- Deskripsi -->
        <div class="space-y-2">
          <Label for="role-description" class="text-sm font-medium text-foreground">
            Deskripsi
          </Label>
          <Textarea
            id="role-description"
            v-model="form.description"
            rows="3"
            placeholder="Keterangan singkat role ini..."
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
            {{ role ? 'Simpan' : 'Tambah Role' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

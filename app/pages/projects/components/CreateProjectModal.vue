<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[540px] p-6 rounded-3xl bg-popover border border-border shadow-none">
      <DialogHeader>
        <DialogTitle class="text-xl font-semibold text-foreground">
          Buat Proyek Baru
        </DialogTitle>
        <p class="text-sm text-slate-400 mt-1">
          Tambahkan proyek klien atau inisiatif baru ke dalam ekosistem tim.
        </p>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4 py-3">
        <!-- Project Name -->
        <div class="space-y-1.5">
          <label class="text-sm font-medium text-foreground">Nama Proyek *</label>
          <Input
            v-model="form.name"
            placeholder="Contoh: Redesign Website PT Kemenpora"
            required
            class="rounded-3xl h-11 border-border bg-background px-4 text-sm"
          />
        </div>

        <!-- Client Name & Category -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="space-y-1.5">
            <label class="text-sm font-medium text-foreground">Klien / Entitas *</label>
            <Input
              v-model="form.clientName"
              placeholder="Contoh: Kemenpora RI"
              required
              class="rounded-3xl h-11 border-border bg-background px-4 text-sm"
            />
          </div>

          <div class="space-y-1.5">
            <label class="text-sm font-medium text-foreground">Kategori *</label>
            <Select v-model="form.category">
              <SelectTrigger class="rounded-3xl h-11 border-border bg-background px-4 text-sm">
                <SelectValue placeholder="Pilih Kategori" />
              </SelectTrigger>
              <SelectContent class="rounded-2xl border-border bg-popover z-50 shadow-none">
                <SelectItem value="WEB">Web Development</SelectItem>
                <SelectItem value="MOBILE">Mobile SuperApp</SelectItem>
                <SelectItem value="BRANDING">Branding & Design</SelectItem>
                <SelectItem value="MARKETING">Digital Marketing</SelectItem>
                <SelectItem value="INTERNAL">Internal HRIS & Ops</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <!-- Dates: Start & Due -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="space-y-1.5">
            <label class="text-sm font-medium text-foreground">Tanggal Mulai *</label>
            <Input
              type="date"
              v-model="form.startDate"
              required
              class="rounded-3xl h-11 border-border bg-background px-4 text-sm"
            />
          </div>

          <div class="space-y-1.5">
            <label class="text-sm font-medium text-foreground">Target Deadline *</label>
            <Input
              type="date"
              v-model="form.dueDate"
              required
              class="rounded-3xl h-11 border-border bg-background px-4 text-sm"
            />
          </div>
        </div>

        <!-- Project Lead -->
        <div class="space-y-1.5">
          <label class="text-sm font-medium text-foreground">Project Lead *</label>
          <Select v-model="form.leadId">
            <SelectTrigger class="rounded-3xl h-11 border-border bg-background px-4 text-sm">
              <SelectValue placeholder="Pilih Lead Proyek" />
            </SelectTrigger>
            <SelectContent class="rounded-2xl border-border bg-popover z-50 shadow-none">
              <SelectItem v-for="member in members" :key="member.id" :value="member.id">
                {{ member.name }} ({{ member.position }})
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Description -->
        <div class="space-y-1.5">
          <label class="text-sm font-medium text-foreground">Deskripsi Singkat (Opsional)</label>
          <Textarea
            v-model="form.description"
            rows="3"
            placeholder="Ruang lingkup proyek, milestone utama, atau catatan brief..."
            class="rounded-3xl border-border bg-background p-4 text-sm resize-none"
          />
        </div>

        <!-- Footer Actions via KreaUI Button -->
        <DialogFooter class="pt-3 border-t border-border/60 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            label="Batal"
            @click="$emit('update:open', false)"
          />
          <Button
            type="submit"
            variant="primary"
            size="sm"
            label="Buat Proyek"
            :disabled="!isValid"
          />
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Button } from '@kreavoks/kreaui'
import type { ProjectMember, CreateProjectPayload } from '../types'

const props = defineProps<{
  open: boolean
  members: ProjectMember[]
}>()

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void
  (e: 'created', payload: CreateProjectPayload): void
}>()

const form = ref<CreateProjectPayload>({
  name: '',
  clientName: '',
  description: '',
  category: 'WEB',
  startDate: new Date().toISOString().split('T')[0],
  dueDate: '',
  leadId: props.members[0]?.id || '',
  memberIds: [],
  health: 'ON_TRACK'
})

watch(() => props.members, (newMembers) => {
  if (newMembers.length > 0 && !form.value.leadId) {
    form.value.leadId = newMembers[0].id
  }
}, { immediate: true })

const isValid = computed(() => {
  return form.value.name.trim() !== '' &&
    form.value.clientName.trim() !== '' &&
    form.value.dueDate !== '' &&
    form.value.leadId !== ''
})

const handleSubmit = () => {
  if (!isValid.value) return

  form.value.memberIds = [form.value.leadId]
  emit('created', { ...form.value })
  emit('update:open', false)

  form.value = {
    name: '',
    clientName: '',
    description: '',
    category: 'WEB',
    startDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    leadId: props.members[0]?.id || '',
    memberIds: [],
    health: 'ON_TRACK'
  }
}
</script>


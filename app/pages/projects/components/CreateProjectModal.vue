<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="w-[calc(100%-1.5rem)] sm:max-w-[560px] max-h-[92dvh] p-0 rounded-2xl sm:rounded-3xl bg-popover border border-border flex flex-col overflow-hidden shadow-2xl">
      <!-- Header with Icon Badge (Rata Kiri) -->
      <DialogHeader class="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-border/50 shrink-0 !text-left items-start">
        <div class="flex items-center gap-3 text-left w-full">
          <div class="w-10 h-10 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <FolderPlus class="w-5 h-5" />
          </div>
          <div class="text-left flex-1 min-w-0">
            <DialogTitle class="text-base sm:text-lg font-bold text-foreground text-left">
              Buat Proyek Baru
            </DialogTitle>
            <p class="text-xs text-muted-foreground mt-0.5 text-left">
              Tambahkan ruang kerja proyek klien atau inisiatif tim baru.
            </p>
          </div>
        </div>
      </DialogHeader>

      <!-- Scrollable Form Body -->
      <form @submit.prevent="handleSubmit" class="flex flex-col flex-1 overflow-hidden">
        <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <!-- Project Name -->
          <div class="space-y-1.5">
            <label class="text-xs sm:text-sm font-medium text-foreground flex items-center gap-1">
              Nama Proyek <span class="text-rose-500 font-semibold">*</span>
            </label>
            <Input
              v-model="form.name"
              placeholder="Contoh: Redesign Website PT Kemenpora"
              required
              class="rounded-xl sm:rounded-2xl h-11 border-border bg-background px-3.5 text-sm transition-all focus:border-primary"
            />
          </div>

          <!-- Client Name & Category Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div class="space-y-1.5">
              <label class="text-xs sm:text-sm font-medium text-foreground flex items-center gap-1">
                Klien / Entitas <span class="text-rose-500 font-semibold">*</span>
              </label>
              <Input
                v-model="form.clientName"
                placeholder="Contoh: Kemenpora RI"
                required
                class="rounded-xl sm:rounded-2xl h-11 border-border bg-background px-3.5 text-sm transition-all focus:border-primary"
              />
            </div>

            <div class="space-y-1.5">
              <label class="text-xs sm:text-sm font-medium text-foreground flex items-center gap-1">
                Kategori <span class="text-rose-500 font-semibold">*</span>
              </label>
              <Select v-model="form.category">
                <SelectTrigger class="rounded-xl sm:rounded-2xl h-11 border-border bg-background px-3.5 text-sm transition-all focus:border-primary">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent class="rounded-xl border-border bg-popover z-50 shadow-lg">
                  <SelectItem value="WEB">Web Development</SelectItem>
                  <SelectItem value="MOBILE">Mobile SuperApp</SelectItem>
                  <SelectItem value="BRANDING">Branding & Design</SelectItem>
                  <SelectItem value="MARKETING">Digital Marketing</SelectItem>
                  <SelectItem value="INTERNAL">Internal HRIS & Ops</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <!-- Dates: Start & Due Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div class="space-y-1.5">
              <label class="text-xs sm:text-sm font-medium text-foreground flex items-center gap-1">
                Tanggal Mulai <span class="text-rose-500 font-semibold">*</span>
              </label>
              <Input
                type="date"
                v-model="form.startDate"
                required
                class="rounded-xl sm:rounded-2xl h-11 border-border bg-background px-3.5 text-sm transition-all focus:border-primary w-full"
              />
            </div>

            <div class="space-y-1.5">
              <label class="text-xs sm:text-sm font-medium text-foreground flex items-center gap-1">
                Target Deadline <span class="text-rose-500 font-semibold">*</span>
              </label>
              <Input
                type="date"
                v-model="form.dueDate"
                required
                class="rounded-xl sm:rounded-2xl h-11 border-border bg-background px-3.5 text-sm transition-all focus:border-primary w-full"
              />
            </div>
          </div>

          <!-- Project Lead -->
          <div class="space-y-1.5">
            <label class="text-xs sm:text-sm font-medium text-foreground flex items-center gap-1">
              Project Lead <span class="text-rose-500 font-semibold">*</span>
            </label>
            <Select v-model="form.leadId">
              <SelectTrigger class="rounded-xl sm:rounded-2xl h-11 border-border bg-background px-3.5 text-sm transition-all focus:border-primary">
                <SelectValue placeholder="Pilih Lead Proyek" />
              </SelectTrigger>
              <SelectContent class="rounded-xl border-border bg-popover z-50 shadow-lg max-h-56">
                <SelectItem v-for="member in members" :key="member.id" :value="member.id">
                  {{ member.name }} ({{ member.position }})
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Description -->
          <div class="space-y-1.5">
            <label class="text-xs sm:text-sm font-medium text-foreground flex items-center gap-1">
              Deskripsi Singkat <span class="text-[11px] text-muted-foreground font-normal">(Opsional)</span>
            </label>
            <Textarea
              v-model="form.description"
              rows="3"
              placeholder="Ruang lingkup proyek, milestone utama, atau catatan brief..."
              class="rounded-xl sm:rounded-2xl border-border bg-background p-3.5 text-sm resize-none transition-all focus:border-primary"
            />
          </div>
        </div>

        <!-- Footer Actions: Kiri Kanan Flex -->
        <DialogFooter class="p-4 sm:p-5 pt-3 sm:pt-3 border-t border-border/50 bg-muted/15 !flex-row flex-row items-center justify-between sm:justify-end gap-3 shrink-0">
          <Button
            type="button"
            variant="ghost"
            class="flex-1 sm:flex-none sm:min-w-[100px] h-11 sm:h-10 rounded-xl sm:rounded-2xl text-sm"
            label="Batal"
            @click="$emit('update:open', false)"
          />
          <Button
            type="submit"
            variant="primary"
            class="flex-1 sm:flex-none sm:min-w-[130px] h-11 sm:h-10 rounded-xl sm:rounded-2xl text-sm font-medium shadow-sm"
            label="Buat Proyek"
            :disabled="!isValid"
          />
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { FolderPlus } from 'lucide-vue-next'
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

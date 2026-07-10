<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[500px] border-border rounded-3xl overflow-hidden p-0">
      <DialogHeader class="p-6 pb-0">
        <DialogTitle class="text-xl">Edit Logbook Harian</DialogTitle>
      </DialogHeader>
      <div class="px-6 py-4 grid gap-4">
        <div class="space-y-2">
          <Label for="deskripsi">Aktivitas</Label>
          <Textarea id="deskripsi" v-model="localData.deskripsi" placeholder="Masukkan aktivitas harian" class="min-h-[100px] resize-none" />
        </div>
        <div class="space-y-2">
          <Label for="kendala">Kendala</Label>
          <Textarea id="kendala" v-model="localData.kendala" placeholder="Tidak Ada" class="min-h-[100px] resize-none" />
        </div>
        <div class="space-y-2">
          <Label for="documentLink">Link Bukti Google Drive</Label>
          <Input id="documentLink" type="url" v-model="localData.documentLink" placeholder="https://drive.google.com/..." class="bg-background border-border" />
        </div>
      </div>
      <DialogFooter class="p-6 pt-2 bg-muted/30">
        <Button variant="outline" @click="$emit('update:open', false)">Batal</Button>
        <Button @click="handleSave">Simpan Perubahan</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { Label } from '~/components/ui/label'

const props = defineProps<{
  open: boolean
  data: {
    id: string
    deskripsi: string
    kendala: string
    documentLink: string
  }
}>()

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void
  (e: 'save', data: { id: string; activity: string; obstacle: string; documentLink: string }): void
}>()

const localData = ref({
  deskripsi: '',
  kendala: '',
  documentLink: ''
})

watch(() => props.data, (newVal) => {
  localData.value = {
    deskripsi: newVal.deskripsi || '',
    kendala: newVal.kendala || '',
    documentLink: newVal.documentLink || ''
  }
}, { immediate: true, deep: true })

const handleSave = () => {
  if (!props.data.id || !localData.value.deskripsi.trim()) return
  emit('save', {
    id: props.data.id,
    activity: localData.value.deskripsi,
    obstacle: localData.value.kendala,
    documentLink: localData.value.documentLink
  })
}
</script>

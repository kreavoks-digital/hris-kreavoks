<template>
  <div class="bg-card p-6 rounded-3xl border border-border space-y-4">
    <!-- Section Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold text-foreground">Logbook</h2>
      
      <!-- Filters & Actions -->
      <div class="flex items-center gap-3">
        <Select v-model="filterMonth">
          <SelectTrigger class="w-[140px] bg-background border-border">
            <SelectValue placeholder="Pilih Bulan" />
          </SelectTrigger>
          <SelectContent class="bg-popover border-border">
            <SelectItem value="0">Semua Bulan</SelectItem>
            <SelectItem v-for="m in months" :key="m.value" :value="m.value.toString()">
              {{ m.label }}
            </SelectItem>
          </SelectContent>
        </Select>

        <Select v-model="filterYear">
          <SelectTrigger class="w-[110px] bg-background border-border">
            <SelectValue placeholder="Pilih Tahun" />
          </SelectTrigger>
          <SelectContent class="bg-popover border-border">
            <SelectItem v-for="y in years" :key="y" :value="y.toString()">
              {{ y }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <Table>
        <TableHeader class="bg-muted/50">
          <TableRow class="border-b border-border hover:bg-transparent">
            <TableHead class="font-semibold text-muted-foreground rounded-l-2xl">Posisi</TableHead>
            <TableHead class="font-semibold text-muted-foreground">Tanggal</TableHead>
            <TableHead class="font-semibold text-muted-foreground">Deskripsi Kegiatan</TableHead>
            <TableHead class="font-semibold text-muted-foreground">Kendala</TableHead>
            <TableHead class="font-semibold text-muted-foreground rounded-r-2xl text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody class="divide-y divide-border">
          <TableRow v-for="logbook in logbooks" :key="logbook.id" class="hover:bg-accent/50 transition-colors border-none">
            <TableCell class="text-foreground/80 py-2">{{ logbook.divisi }}</TableCell>
            <TableCell class="text-foreground/80 py-2 whitespace-nowrap">{{ logbook.tanggal }}</TableCell>
            <TableCell class="text-foreground/80 py-2">{{ logbook.deskripsi }}</TableCell>
            <TableCell class="text-foreground/80 py-2">{{ logbook.kendala }}</TableCell>
            <TableCell class="text-right py-2">
              <Button variant="ghost" size="icon" class="rounded-full h-8 w-8" @click="openEditDialog(logbook)">
                <Pencil class="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- Edit Logbook Dialog -->
    <Dialog v-model:open="showEditDialog">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Logbook</DialogTitle>
        </DialogHeader>
        <div class="grid gap-4 py-4">
          <div class="space-y-2">
            <Label for="deskripsi">Deskripsi Kegiatan</Label>
            <Textarea id="deskripsi" v-model="editingData.deskripsi" placeholder="Masukkan deskripsi kegiatan" class="min-h-[100px] resize-none" />
          </div>
          <div class="space-y-2">
            <Label for="kendala">Kendala</Label>
            <Textarea id="kendala" v-model="editingData.kendala" placeholder="Tidak Ada" class="min-h-[100px] resize-none" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showEditDialog = false">Batal</Button>
          <Button @click="handleSave">Simpan Perubahan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, MoreVertical, Pencil } from 'lucide-vue-next'
import type { LogbookEntry } from '../types'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { Label } from '~/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '~/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'

const props = defineProps<{
  logbooks: LogbookEntry[]
}>()

const emit = defineEmits(['update-logbook'])

const showEditDialog = ref(false)

const editingData = ref({
  id: '',
  deskripsi: '',
  kendala: ''
})

const openEditDialog = (logbook: LogbookEntry) => {
  editingData.value = {
    id: logbook.id,
    deskripsi: logbook.deskripsi,
    kendala: logbook.kendala
  }
  showEditDialog.value = true
}

const handleSave = () => {
  if (!editingData.value.id || !editingData.value.deskripsi.trim()) return
  
  emit('update-logbook', editingData.value.id, {
    activity: editingData.value.deskripsi,
    obstacle: editingData.value.kendala
  })
  
  showEditDialog.value = false
}

const monthModel = defineModel<number>('month')
const yearModel = defineModel<number>('year')

const filterMonth = computed({
  get: () => monthModel.value?.toString() ?? '',
  set: (val: string) => monthModel.value = parseInt(val, 10)
})

const filterYear = computed({
  get: () => yearModel.value?.toString() ?? '',
  set: (val: string) => yearModel.value = parseInt(val, 10)
})

const months = [
  { value: 1, label: 'Januari' },
  { value: 2, label: 'Februari' },
  { value: 3, label: 'Maret' },
  { value: 4, label: 'April' },
  { value: 5, label: 'Mei' },
  { value: 6, label: 'Juni' },
  { value: 7, label: 'Juli' },
  { value: 8, label: 'Agustus' },
  { value: 9, label: 'September' },
  { value: 10, label: 'Oktober' },
  { value: 11, label: 'November' },
  { value: 12, label: 'Desember' }
]

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)
</script>

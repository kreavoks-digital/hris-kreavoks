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
    <div class="overflow-x-auto min-h-[250px] flex flex-col">
      <Table v-if="logbooks && logbooks.length > 0">
        <TableHeader class="bg-muted/50">
          <TableRow class="border-b border-border hover:bg-transparent">
            <TableHead class="font-semibold text-muted-foreground rounded-l-2xl w-[15%]">Posisi</TableHead>
            <TableHead class="font-semibold text-muted-foreground w-[15%]">Tanggal</TableHead>
            <TableHead class="font-semibold text-muted-foreground w-[30%]">Deskripsi Kegiatan</TableHead>
            <TableHead class="font-semibold text-muted-foreground w-[15%]">Kendala</TableHead>
            <TableHead class="font-semibold text-muted-foreground w-[15%]">Bukti</TableHead>
            <TableHead class="font-semibold text-muted-foreground rounded-r-2xl text-right w-[10%]">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody class="divide-y divide-border">
          <TableRow v-for="logbook in logbooks" :key="logbook.id" class="hover:bg-accent/50 transition-colors border-none">
            <TableCell class="text-foreground/80 py-2">{{ logbook.divisi }}</TableCell>
            <TableCell class="text-foreground/80 py-2 whitespace-nowrap">{{ logbook.tanggal }}</TableCell>
            <TableCell class="text-foreground/80 py-2">{{ logbook.deskripsi }}</TableCell>
            <TableCell class="text-foreground/80 py-2">{{ logbook.kendala }}</TableCell>
            <TableCell class="text-foreground/80 py-2">
              <a v-if="logbook.documentLink" :href="logbook.documentLink" target="_blank" class="text-blue-500 hover:text-blue-600 hover:underline flex items-center gap-1.5 transition-colors">
                <LinkIcon class="w-3.5 h-3.5" /> Buka Link
              </a>
              <span v-else class="text-muted-foreground/60 italic text-xs">Tidak ada</span>
            </TableCell>
            <TableCell class="text-right py-2">
              <Button variant="ghost" size="icon" class="rounded-full h-8 w-8" @click="openEditDialog(logbook)">
                <Pencil class="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      
      <!-- Empty State -->
      <div v-else class="flex-1 flex flex-col items-center justify-center py-12 text-center bg-muted/30 dark:bg-muted/10 rounded-2xl border border-dashed border-border mt-2 animate-in fade-in duration-500">
        <div class="w-20 h-20 mb-3 text-muted-foreground/30 dark:text-muted-foreground/20">
          <FileText class="w-full h-full stroke-[1.5]" />
        </div>
        <p class="text-foreground font-medium text-lg">Belum ada logbook</p>
        <p class="text-sm text-muted-foreground mt-1 max-w-sm">Logbook harian Anda akan otomatis dibuat saat Anda melakukan <span class="font-semibold text-kv-primary">Clock Out</span>.</p>
      </div>
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
          <div class="space-y-2">
            <Label for="documentLink">Link Bukti Google Drive</Label>
            <Input id="documentLink" type="url" v-model="editingData.documentLink" placeholder="https://drive.google.com/..." class="bg-background border-border" />
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
import { inject, ref, computed } from 'vue'
import { Plus, MoreVertical, Pencil, FileText, Link as LinkIcon } from 'lucide-vue-next'
import type { LogbookEntry } from '../types'
import { DashboardContextKey } from '../context/dashboardContext'
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

const context = inject(DashboardContextKey)
if (!context) throw new Error('Dashboard context not provided')

const {
  filteredLogbooks: logbooks,
  logbookFilterMonth: monthModel,
  logbookFilterYear: yearModel,
  updateLogbook
} = context

const showEditDialog = ref(false)

const editingData = ref({
  id: '',
  deskripsi: '',
  kendala: '',
  documentLink: ''
})

const openEditDialog = (logbook: LogbookEntry) => {
  editingData.value = {
    id: logbook.id,
    deskripsi: logbook.deskripsi,
    kendala: logbook.kendala,
    documentLink: logbook.documentLink || ''
  }
  showEditDialog.value = true
}

const handleSave = () => {
  if (!editingData.value.id || !editingData.value.deskripsi.trim()) return
  
  updateLogbook(editingData.value.id, {
    activity: editingData.value.deskripsi,
    obstacle: editingData.value.kendala,
    documentLink: editingData.value.documentLink
  })
  
  showEditDialog.value = false
}

const filterMonth = computed({
  get: () => monthModel.value?.toString() ?? '',
  set: (val: string) => monthModel.value = parseInt(val, 10)
})

const filterYear = computed({
  get: () => yearModel.value?.toString() ?? '',
  set: (val: string) => yearModel.value = parseInt(val, 10)
})

const months = MONTHS
const years = getCurrentYears()
</script>

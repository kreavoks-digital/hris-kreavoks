<template>
  <div class="bg-white dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/60 backdrop-blur-md space-y-4">
    <!-- Section Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-50">Logbook</h2>
      
      <!-- Filters -->
      <div class="flex items-center gap-3">
        <Select v-model="filterMonth">
          <SelectTrigger class="w-[140px] bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
            <SelectValue placeholder="Pilih Bulan" />
          </SelectTrigger>
          <SelectContent class="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <SelectItem v-for="m in months" :key="m.value" :value="m.value.toString()">
              {{ m.label }}
            </SelectItem>
          </SelectContent>
        </Select>

        <Select v-model="filterYear">
          <SelectTrigger class="w-[110px] bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
            <SelectValue placeholder="Pilih Tahun" />
          </SelectTrigger>
          <SelectContent class="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
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
        <TableHeader class="bg-slate-50/70 dark:bg-slate-950/40">
          <TableRow class="border-b border-slate-100 dark:border-slate-800 hover:bg-transparent">
            <TableHead class="font-semibold text-slate-700 dark:text-slate-300 rounded-l-2xl">Posisi</TableHead>
            <TableHead class="font-semibold text-slate-700 dark:text-slate-300">Tanggal</TableHead>
            <TableHead class="font-semibold text-slate-700 dark:text-slate-300">Deskripsi Kegiatan</TableHead>
            <TableHead class="font-semibold text-slate-700 dark:text-slate-300">Kendala</TableHead>
            <TableHead class="font-semibold text-slate-700 dark:text-slate-300 rounded-r-2xl text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody class="divide-y divide-slate-50 dark:divide-slate-800/30">
          <TableRow v-for="logbook in logbooks" :key="logbook.id" class="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors border-none">
            <TableCell class="text-slate-600 dark:text-slate-300 py-2">{{ logbook.divisi }}</TableCell>
            <TableCell class="text-slate-600 dark:text-slate-300 py-2 whitespace-nowrap">{{ logbook.tanggal }}</TableCell>
            <TableCell class="text-slate-600 dark:text-slate-300 py-2">{{ logbook.deskripsi }}</TableCell>
            <TableCell class="text-slate-600 dark:text-slate-300 py-2">{{ logbook.kendala }}</TableCell>
            <TableCell class="text-right py-2">
              <Button variant="ghost" size="icon" class="rounded-full h-8 w-8">
                <MoreVertical class="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus, MoreVertical } from 'lucide-vue-next'
import type { LogbookEntry } from '../types'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
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

const emit = defineEmits(['add-logbook'])

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

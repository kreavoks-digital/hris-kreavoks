<template>
  <div class="bg-white dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/60 backdrop-blur-md space-y-4">
    <!-- Section Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-50">Logbook</h2>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <Table>
        <TableHeader class="bg-slate-50/70 dark:bg-slate-950/40">
          <TableRow class="border-b border-slate-100 dark:border-slate-800 hover:bg-transparent">
            <TableHead class="font-semibold text-slate-700 dark:text-slate-300 rounded-l-2xl">Divisi</TableHead>
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

const props = defineProps<{
  logbooks: LogbookEntry[]
}>()

const emit = defineEmits(['add-logbook'])
</script>

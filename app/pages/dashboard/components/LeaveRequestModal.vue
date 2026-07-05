<template>
  <Dialog v-model:open="isIzinModalOpen">
    <DialogTrigger as-child>
      <Button 
        variant="link" 
        class="text-xs font-bold text-kv-primary block mx-auto py-1 h-auto hover:underline"
        :disabled="attendanceState === 'clocked_out'"
      >
        Ajukan Izin
      </Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-4xl p-0 overflow-hidden border-border bg-card">
      <DialogHeader class="px-6 py-4 border-b border-border bg-muted/20">
        <DialogTitle class="text-xl font-bold text-foreground">Form Pengajuan Izin / Cuti</DialogTitle>
        <DialogDescription class="text-muted-foreground text-sm">
          Silakan lengkapi form di bawah ini. Semua field wajib diisi kecuali dinyatakan opsional.
        </DialogDescription>
      </DialogHeader>
      <div class="grid grid-cols-1 md:grid-cols-12 gap-0">
        <!-- Kiri: Info Dasar -->
        <div class="md:col-span-7 p-6 space-y-5">
          <div class="space-y-2">
            <Label class="text-foreground">Tipe Pengajuan</Label>
            <Select v-model="leaveForm.type">
              <SelectTrigger class="bg-background border-border">
                <SelectValue placeholder="Pilih tipe izin atau cuti" />
              </SelectTrigger>
              <SelectContent class="border-border">
                <SelectItem value="sakit">Sakit</SelectItem>
                <SelectItem value="izin">Izin Pribadi</SelectItem>
                <SelectItem value="cuti">Cuti Tahunan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-3">
            <div class="flex items-center space-x-2 mb-2">
              <Checkbox 
                id="oneDay" 
                v-model:checked="leaveForm.isOneDay" 
              />
              <label for="oneDay" class="text-sm font-medium leading-none cursor-pointer text-foreground">
                Pengajuan hanya untuk 1 hari
              </label>
            </div>
            <div class="grid grid-cols-2 gap-4" v-if="!leaveForm.isOneDay">
              <div class="space-y-2">
                <Label class="text-foreground">Tanggal Mulai</Label>
                <Popover>
                  <PopoverTrigger as-child>
                    <Button
                      variant="outline"
                      :class="cn('w-full justify-start text-left font-normal border-border bg-background text-foreground', !leaveForm.startDate && 'text-muted-foreground')"
                    >
                      <CalendarIcon class="mr-2 h-4 w-4 text-muted-foreground" />
                      {{ leaveForm.startDate ? format(new Date(leaveForm.startDate), 'dd MMMM yyyy', { locale: idLocale }) : 'Pilih Tanggal' }}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent class="w-auto p-0 rounded-2xl shadow-sm border-border bg-popover" align="start">
                    <Calendar v-model="startDateObj" initial-focus />
                  </PopoverContent>
                </Popover>
              </div>
              <div class="space-y-2">
                <Label class="text-foreground">Tanggal Selesai</Label>
                <Popover>
                  <PopoverTrigger as-child>
                    <Button
                      variant="outline"
                      :class="cn('w-full justify-start text-left font-normal border-border bg-background text-foreground', !leaveForm.endDate && 'text-muted-foreground')"
                    >
                      <CalendarIcon class="mr-2 h-4 w-4 text-muted-foreground" />
                      {{ leaveForm.endDate ? format(new Date(leaveForm.endDate), 'dd MMMM yyyy', { locale: idLocale }) : 'Pilih Tanggal' }}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent class="w-auto p-0 rounded-2xl shadow-sm border-border bg-popover" align="start">
                    <Calendar v-model="endDateObj" initial-focus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div class="space-y-2" v-if="leaveForm.isOneDay">
              <Label class="text-foreground">Tanggal Izin</Label>
              <Popover>
                <PopoverTrigger as-child>
                  <Button
                    variant="outline"
                    :class="cn('w-full justify-start text-left font-normal border-border bg-background text-foreground', !leaveForm.startDate && 'text-muted-foreground')"
                  >
                    <CalendarIcon class="mr-2 h-4 w-4 text-muted-foreground" />
                    {{ leaveForm.startDate ? format(new Date(leaveForm.startDate), 'dd MMMM yyyy', { locale: idLocale }) : 'Pilih Tanggal' }}
                  </Button>
                </PopoverTrigger>
                <PopoverContent class="w-auto p-0 rounded-2xl shadow-sm border-border bg-popover" align="start">
                  <Calendar v-model="startDateObj" initial-focus />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div class="space-y-2">
            <Label class="text-foreground">Keterangan / Alasan</Label>
            <textarea 
              v-model="leaveForm.reason"
              placeholder="Jelaskan alasan pengajuan secara detail..." 
              class="flex min-h-[120px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            ></textarea>
          </div>
        </div>
        
        <!-- Kanan: Bukti -->
        <div class="md:col-span-5 p-6 bg-muted/10 border-l border-border flex flex-col">
          <div class="flex flex-col items-center text-center space-y-4 mb-6 mt-4">
            <div class="w-16 h-16 bg-blue-100 dark:bg-blue-500/20 rounded-full flex items-center justify-center mb-2">
              <LinkIcon class="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 class="font-semibold text-foreground text-lg">Bukti Izin (Opsional)</h3>
            <p class="text-sm text-muted-foreground leading-relaxed px-2">
              Harap upload foto bukti (surat dokter/acara) ke <b class="text-foreground">Google Drive</b> Anda, pastikan akses link di set ke <i>Viewer/Anyone with link</i>, lalu tempel link tersebut di bawah.
            </p>
          </div>
          <div class="space-y-2 mt-auto">
            <Label class="text-foreground">Link Google Drive</Label>
            <Input v-model="leaveForm.proofLink" type="url" placeholder="https://drive.google.com/file/d/..." class="bg-background border-border" />
            <p class="text-[11px] text-muted-foreground mt-1.5 leading-tight">
              *Diprioritaskan untuk diisi karena akan diverifikasi dan disetujui oleh HRD.
            </p>
          </div>
        </div>
      </div>
      <DialogFooter class="px-6 py-4 border-t border-border bg-muted/20 sm:justify-end gap-2">
        <DialogClose as-child>
          <Button variant="outline" type="button" class="border-border bg-background">Batal</Button>
        </DialogClose>
        <DialogClose as-child>
          <Button type="button" class="bg-kv-primary text-white hover:bg-kv-primary/90" @click="submitIzin">Kirim Pengajuan</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, watch, inject } from 'vue'
import { Link as LinkIcon, Calendar as CalendarIcon } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Label } from '~/components/ui/label'
import { Input } from '~/components/ui/input'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose
} from '~/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { Calendar } from '~/components/ui/calendar'
import { Checkbox } from '~/components/ui/checkbox'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { parseDate } from '@internationalized/date'
import { DashboardContextKey } from '../context/dashboardContext'

const context = inject(DashboardContextKey)
if (!context) throw new Error('Dashboard context not provided')

const {
  isIzinModalOpen,
  leaveForm,
  submitIzin,
  attendanceState
} = context

watch(() => leaveForm.value.startDate, (newVal) => {
  if (leaveForm.value.isOneDay && newVal) {
    leaveForm.value.endDate = newVal;
  }
})

watch(() => leaveForm.value.isOneDay, (newVal) => {
  if (newVal) {
    leaveForm.value.endDate = leaveForm.value.startDate;
  }
})

const startDateObj = computed({
  get: () => leaveForm.value.startDate ? parseDate(leaveForm.value.startDate) : undefined,
  set: (val: any) => {
    leaveForm.value.startDate = val ? val.toString() : ""
  }
})

const endDateObj = computed({
  get: () => leaveForm.value.endDate ? parseDate(leaveForm.value.endDate) : undefined,
  set: (val: any) => {
    leaveForm.value.endDate = val ? val.toString() : ""
  }
})
</script>

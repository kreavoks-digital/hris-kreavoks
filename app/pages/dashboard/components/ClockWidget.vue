<template>
  <Card 
    class="p-6 rounded-3xl border flex flex-col justify-between text-center shadow-none relative overflow-hidden transition-colors duration-1000"
    :class="[
      attendanceState === 'clocked_out' ? 'bg-emerald-500/10 border-emerald-500/30' :
      isNightTime ? 'bg-red-500/10 border-red-500/30 animate-pulse' : 'bg-card border-border'
    ]"
  >
    <!-- Mascot Image Top Right -->
    <img :src="mascotSrc" alt="Mascot" class="absolute top-4 right-4 w-12 h-12 md:w-16 md:h-16 object-contain pointer-events-none drop-shadow-sm opacity-90 z-0" />

    <div class="relative z-10 pr-16">
      <div class="text-sm font-semibold text-foreground text-left">Absensi</div>
      <hr class="border-t border-border mt-3" />
    </div>
    <div class="space-y-4 my-auto relative z-10">
      <!-- Big clock duration -->
      <div>
        <h2 class="text-2xl font-bold text-foreground tabular-nums">
          {{ attendanceState === 'clocked_out' ? clockRangeText : currentTime }}
        </h2>
        <p class="text-xs text-muted-foreground mt-2" v-html="statusText"></p>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="space-y-3 mt-6">
      <div class="grid grid-cols-2 gap-3">
        <Dialog v-model:open="showClockOutModal">
          <DialogTrigger as-child>
            <Button 
              :variant="attendanceState === 'clocked_in' ? 'default' : 'outline'"
              :disabled="attendanceState !== 'clocked_in'"
              class="px-4 text-sm font-semibold transition-all duration-300"
              :class="attendanceState === 'clocked_in' ? 'bg-kv-primary text-white hover:bg-kv-primary/95' : ''"
            >
              Clock Out
            </Button>
          </DialogTrigger>
          <DialogContent class="sm:max-w-2xl p-0 overflow-hidden border-border bg-card">
            <form @submit.prevent="submitClockOut">
              <DialogHeader class="px-6 py-5 border-b border-border bg-muted/20">
                <DialogTitle class="text-xl font-bold text-foreground">Clock Out & Laporan Harian</DialogTitle>
                <DialogDescription class="text-muted-foreground text-sm">
                  Lengkapi laporan harian Anda sebelum menyelesaikan jam kerja. Waktu saat ini: <span class="font-semibold text-foreground">{{ currentTime }} WIB</span>.
                </DialogDescription>
              </DialogHeader>
              
              <div class="px-6 py-6 space-y-6 max-h-[70vh] overflow-y-auto">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <Label class="text-sm font-semibold text-foreground">Aktivitas Hari Ini <span class="text-rose-500">*</span></Label>
                    <Textarea 
                      v-model="clockOutLogbook.activity"
                      placeholder="Deskripsikan pekerjaan yang telah diselesaikan..." 
                      :error="formErrors.activity && clockOutLogbook.activity.length > 0 ? formErrors.activity : undefined"
                    />
                  </div>

                  <div class="space-y-2">
                    <Label class="text-sm font-semibold text-foreground">Rencana Besok <span class="text-rose-500">*</span></Label>
                    <Textarea 
                      v-model="clockOutLogbook.planTomorrow"
                      placeholder="Deskripsikan target pekerjaan selanjutnya..." 
                      :error="formErrors.planTomorrow && clockOutLogbook.planTomorrow.length > 0 ? formErrors.planTomorrow : undefined"
                    />
                  </div>
                </div>

                <div class="space-y-2">
                  <Label class="text-sm font-semibold text-foreground">Kendala (Opsional)</Label>
                  <Textarea 
                    v-model="clockOutLogbook.obstacle"
                    placeholder="Tuliskan jika ada kendala operasional..." 
                  />
                </div>

                <div class="space-y-2">
                  <Label class="text-sm font-semibold text-foreground">
                    Link Dokumentasi Drive <span class="text-rose-500">*</span>
                  </Label>
                  <p class="text-xs text-muted-foreground">Pastikan hak akses tautan disetel sebagai Viewer.</p>
                  <Input 
                    type="url" 
                    v-model="clockOutLogbook.documentLink" 
                    placeholder="https://drive.google.com/..." 
                    :error="formErrors.documentLink && clockOutLogbook.documentLink.length > 0 ? formErrors.documentLink : undefined"
                  />
                </div>
              </div>

              <DialogFooter class="px-6 py-4 border-t border-border bg-muted/20 sm:justify-end gap-2">
                <Button variant="outline" type="button" class="border-border rounded-xl font-semibold bg-background" @click="showClockOutModal = false">Batal</Button>
                <Button :disabled="!isClockOutFormValid" type="submit" class="bg-kv-primary rounded-xl font-semibold text-white hover:bg-kv-primary/90">
                  Kirim & Clock Out
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <AlertDialog>
          <AlertDialogTrigger as-child>
            <Button 
              :variant="attendanceState === 'not_clocked_in' ? 'default' : 'outline'"
              :disabled="attendanceState !== 'not_clocked_in'"
              class="px-4 text-sm font-semibold transition-all duration-300"
              :class="attendanceState === 'not_clocked_in' ? 'bg-kv-primary text-white hover:bg-kv-primary/95' : ''"
            >
              Clock In
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Konfirmasi Absen Masuk</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin melakukan Clock In pada pukul {{ currentTime }} WIB?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel as-child>
                <Button variant="outline">Batal</Button>
              </AlertDialogCancel>
              <AlertDialogAction as-child>
                <Button @click="$emit('clock-in')" class="bg-kv-primary text-white hover:bg-kv-primary/90">Ya, Clock In</Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      
      <Dialog>
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
                <Select>
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
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label class="text-foreground">Tanggal Mulai</Label>
                  <Input type="date" class="bg-background border-border" />
                </div>
                <div class="space-y-2">
                  <Label class="text-foreground">Tanggal Selesai</Label>
                  <Input type="date" class="bg-background border-border" />
                </div>
              </div>
              <div class="space-y-2">
                <Label class="text-foreground">Keterangan / Alasan</Label>
                <textarea 
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
                <Input type="url" placeholder="https://drive.google.com/file/d/..." class="bg-background border-border" />
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
    </div>
  </Card>
</template>

<script setup lang="ts">
import { z } from 'zod'
import { Link as LinkIcon } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { Button } from '~/components/ui/button'
import { Card } from '~/components/ui/card'
import { Label } from '~/components/ui/label'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose
} from '~/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

import mascotSettle from '~/assets/maskot/settle.svg'
import mascotAfternoon from '~/assets/maskot/afternoon.svg'
import mascotNight from '~/assets/maskot/night.svg'
import mascotAlready from '~/assets/maskot/already.svg'

const props = defineProps<{
  attendanceState: 'not_clocked_in' | 'clocked_in' | 'clocked_out'
  currentTime: string
  clockRangeText: string
  statusText: string
}>()

const hourNow = computed(() => parseInt(props.currentTime.split(':')[0] || '0', 10))

const isNightTime = computed(() => {
  return hourNow.value >= 22 && props.attendanceState !== 'clocked_out'
})

const mascotSrc = computed(() => {
  if (props.attendanceState === 'clocked_out') return mascotAlready
  if (hourNow.value >= 22) return mascotNight
  if (hourNow.value >= 17) return mascotAfternoon
  return mascotSettle
})

const emit = defineEmits(['clock-in', 'clock-out'])

const showClockOutModal = ref(false)
const clockOutLogbook = ref({
  activity: '',
  planTomorrow: '',
  obstacle: '',
  documentLink: ''
})

const logbookSchema = z.object({
  activity: z.string().trim().min(5, "Aktivitas harus diisi minimal 5 karakter"),
  planTomorrow: z.string().trim().min(5, "Rencana harus diisi minimal 5 karakter"),
  obstacle: z.string().optional(),
  documentLink: z.string().url("Link dokumentasi harus berupa URL yang valid (misal: https://drive...)")
})

const isClockOutFormValid = computed(() => {
  return logbookSchema.safeParse(clockOutLogbook.value).success
})

const formErrors = computed(() => {
  const result = logbookSchema.safeParse(clockOutLogbook.value)
  if (result.success) return {}
  
  const errors: Record<string, string> = {}
  result.error.issues.forEach(issue => {
    if (issue.path[0]) {
      errors[issue.path[0] as string] = issue.message
    }
  })
  return errors
})

const submitClockOut = () => {
  emit('clock-out', { ...clockOutLogbook.value })
  showClockOutModal.value = false
  clockOutLogbook.value = { activity: '', planTomorrow: '', obstacle: '', documentLink: '' }
}

const submitIzin = () => {
  toast.success('Pengajuan Berhasil', {
    description: 'Pengajuan izin/cuti Anda telah terkirim dan menunggu persetujuan HRD.'
  })
}
</script>

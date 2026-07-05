<template>
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
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { Button } from '~/components/ui/button'
import { Label } from '~/components/ui/label'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from '~/components/ui/dialog'
import { DashboardContextKey } from '../context/dashboardContext'

const context = inject(DashboardContextKey)
if (!context) throw new Error('Dashboard context not provided')

const {
  showClockOutModal,
  clockOutLogbook,
  isClockOutFormValid,
  formErrors,
  attendanceState,
  currentTime,
  handleClockOut
} = context

const submitClockOut = () => {
  handleClockOut()
}
</script>

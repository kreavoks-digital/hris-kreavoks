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
        <ClockOutModal />

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
                <Button variant="outline" :disabled="isSubmitting">Batal</Button>
              </AlertDialogCancel>
              <AlertDialogAction as-child>
                <Button @click="handleClockIn" :disabled="isSubmitting" class="bg-kv-primary text-white hover:bg-kv-primary/90">
                  <template v-if="isSubmitting">Memproses...</template>
                  <template v-else>Ya, Clock In</template>
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      
      <LeaveRequestModal />
    </div>
  </Card>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import { Button } from '~/components/ui/button'
import { Card } from '~/components/ui/card'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { DashboardContextKey } from '../context/dashboardContext'
import ClockOutModal from './ClockOutModal.vue'
import LeaveRequestModal from './LeaveRequestModal.vue'

import mascotSettle from '~/assets/maskot/settle.svg'
import mascotAfternoon from '~/assets/maskot/afternoon.svg'
import mascotNight from '~/assets/maskot/night.svg'
import mascotAlready from '~/assets/maskot/already.svg'

const context = inject(DashboardContextKey)
if (!context) throw new Error('Dashboard context not provided')

const {
  attendanceState,
  currentTime,
  clockRangeText,
  attendanceStatus: statusText,
  handleClockIn,
  isSubmitting
} = context

const hourNow = computed(() => parseInt(currentTime.value.split(':')[0] || '0', 10))

const isNightTime = computed(() => {
  return hourNow.value >= 22 && attendanceState.value !== 'clocked_out'
})

const mascotSrc = computed(() => {
  if (attendanceState.value === 'clocked_out') return mascotAlready
  if (hourNow.value >= 22) return mascotNight
  if (hourNow.value >= 17) return mascotAfternoon
  return mascotSettle
})
</script>

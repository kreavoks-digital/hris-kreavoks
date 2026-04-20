<template>
  <div class="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <!-- Header -->
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="icon" @click="navigateTo('/cuti')" class="rounded-full">
        <ChevronLeft class="h-5 w-5" />
      </Button>
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-slate-900">Ajukan Cuti</h1>
        <p class="text-slate-500 mt-1 text-sm">Lengkapi formulir di bawah untuk mengajukan cuti.</p>
      </div>
    </div>

    <Card class="border-none shadow-xl overflow-hidden">
      <CardHeader class="border-b bg-slate-50/50 pb-6">
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <FileEdit class="h-5 w-5" />
          </div>
          <div>
            <CardTitle class="text-lg">Formulir Pengajuan</CardTitle>
            <CardDescription>Sisa jatah cuti tahunan: <span class="font-bold text-blue-600">{{ leaveBalance.annual }} Hari</span></CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent class="p-8">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div class="grid gap-6 md:grid-cols-2">
            <!-- Leave Type -->
            <div class="space-y-2 md:col-span-2">
              <Label for="leaveType">Jenis Cuti</Label>
              <Select v-model="form.type" required>
                <SelectTrigger id="leaveType" class="h-11">
                  <SelectValue placeholder="Pilih jenis cuti" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="annual">Cuti Tahunan</SelectItem>
                  <SelectItem value="sick">Cuti Sakit</SelectItem>
                  <SelectItem value="emergency">Cuti Darurat</SelectItem>
                  <SelectItem value="other">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- Start Date -->
            <div class="space-y-2">
              <Label for="startDate">Tanggal Mulai</Label>
              <div class="relative">
                <input 
                  id="startDate"
                  type="date" 
                  v-model="form.startDate"
                  required
                  class="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            <!-- End Date -->
            <div class="space-y-2">
              <Label for="endDate">Tanggal Selesai</Label>
              <div class="relative">
                <input 
                  id="endDate"
                  type="date" 
                  v-model="form.endDate"
                  required
                  class="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  :min="form.startDate"
                />
              </div>
            </div>

            <!-- Reason -->
            <div class="space-y-2 md:col-span-2">
              <Label for="reason">Alasan / Keperluan</Label>
              <textarea
                id="reason"
                v-model="form.reason"
                class="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                placeholder="Tuliskan alasan pengajuan cuti secara detail..."
                required
              ></textarea>
            </div>
          </div>

          <div class="pt-4 flex flex-col-reverse sm:flex-row gap-3">
            <Button type="button" variant="outline" class="flex-1 h-11" @click="navigateTo('/cuti')">
              Batal
            </Button>
            <Button type="submit" class="flex-1 h-11 shadow-lg shadow-primary/20" :disabled="loading">
              <template v-if="loading">
                <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                Mengajukan...
              </template>
              <template v-else>
                Kirim Pengajuan
              </template>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>

    <!-- Info Section -->
    <div class="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 text-blue-800 text-sm">
      <Info class="h-5 w-5 shrink-0 mt-0.5" />
      <p>
        Pengajuan cuti Anda akan ditinjau oleh atasan dan departemen HR. Anda akan menerima notifikasi setelah pengajuan disetujui atau ditolak.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  ChevronLeft, 
  FileEdit, 
  Loader2, 
  Info 
} from 'lucide-vue-next'
import { ref } from 'vue'
import { cutiApi } from './api/cuti.api'
import { Button } from '~/components/ui/button'
import { Label } from '~/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: "default",
  middleware: "auth",
});

const loading = ref(false)
const leaveBalance = ref({
  annual: 12,
  used: 3
})

const form = ref({
  type: 'annual',
  startDate: '',
  endDate: '',
  reason: ''
})

const fetchBalance = async () => {
  try {
    const response = await cutiApi.getLeaves()
    if (response.success) {
      leaveBalance.value = response.data.balance
    }
  } catch (err) {
    console.error('Error fetching balance:', err)
  }
}

const handleSubmit = async () => {
  loading.value = true
  try {
    const response = await cutiApi.createLeave(form.value)
    if (response.success) {
      toast.success('Pengajuan cuti berhasil dikirim')
      navigateTo('/cuti')
    } else {
      toast.error(response.message || 'Gagal mengirim pengajuan')
    }
  } catch (err) {
    console.error('Error submitting leave:', err)
    toast.error('Terjadi kesalahan sistem')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchBalance()
})
</script>

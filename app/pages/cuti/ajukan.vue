<template>
  <div class="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <!-- Header -->
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="icon" @click="navigateTo('/cuti')" class="">
        <ChevronLeft class="h-5 w-5" />
      </Button>
      <div>
        <h1 class="text-3xl font-semibold text-kv-black">Ajukan Cuti</h1>
        <p class="text-sm text-slate-500 mt-1">Lengkapi formulir di bawah untuk mengajukan cuti.</p>
      </div>
    </div>

    <Card class="border border-slate-100 overflow-hidden rounded-3xl">
      <CardHeader class="pb-6 p-8">
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-3xl bg-kv-primary flex items-center justify-center text-white">
            <FileEdit class="h-5 w-5" />
          </div>
          <div>
            <CardTitle class="text-lg font-semibold text-kv-black">Formulir Pengajuan</CardTitle>
            <CardDescription class="text-sm">Sisa jatah cuti tahunan: <span class="font-semibold text-kv-primary">{{ leaveBalance.annual }} Hari</span></CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent class="p-8">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div class="grid gap-6 md:grid-cols-2">
            <!-- Leave Type -->
            <div class="space-y-2 md:col-span-2">
              <Label for="leaveType" class="text-kv-black font-medium">Jenis Cuti</Label>
              <Select v-model="form.type" required>
                <SelectTrigger id="leaveType" class="h-11 rounded-3xl border-slate-200">
                  <SelectValue placeholder="Pilih jenis cuti" />
                </SelectTrigger>
                <SelectContent class="rounded-3xl border-slate-100">
                  <SelectItem value="annual">Cuti Tahunan</SelectItem>
                  <SelectItem value="sick">Cuti Sakit</SelectItem>
                  <SelectItem value="emergency">Cuti Darurat</SelectItem>
                  <SelectItem value="other">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- Start Date -->
            <div class="space-y-2">
              <Label for="startDate" class="text-kv-black font-medium">Tanggal Mulai</Label>
              <div class="relative">
                <Input 
                  id="startDate"
                  type="date" 
                  v-model="form.startDate"
                  required
                  class="border-slate-200"
                />
              </div>
            </div>

            <!-- End Date -->
            <div class="space-y-2">
              <Label for="endDate" class="text-kv-black font-medium">Tanggal Selesai</Label>
              <div class="relative">
                <Input 
                  id="endDate"
                  type="date" 
                  v-model="form.endDate"
                  required
                  class="border-slate-200"
                  :min="form.startDate"
                />
              </div>
            </div>

            <!-- Reason -->
            <div class="space-y-2 md:col-span-2">
              <Label for="reason" class="text-kv-black font-medium">Alasan / Keperluan</Label>
              <textarea
                id="reason"
                v-model="form.reason"
                class="flex min-h-[120px] w-full rounded-3xl border border-slate-200 bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                placeholder="Tuliskan alasan pengajuan cuti secara detail..."
                required
              ></textarea>
            </div>
          </div>

          <div class="pt-4 flex flex-col-reverse sm:flex-row gap-3">
            <Button type="button" variant="outline" class="flex-1 border-slate-200 text-slate-600" @click="navigateTo('/cuti')">
              Batal
            </Button>
            <Button type="submit" class="flex-1 bg-kv-primary hover:bg-kv-primary/90" :disabled="loading">
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
    <div class="bg-blue-50/50 border border-blue-100 rounded-3xl p-6 flex gap-4 text-blue-800 text-sm">
      <Info class="h-5 w-5 shrink-0 mt-0.5 text-blue-600" />
      <p class="leading-relaxed">
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
import { Input } from '~/components/ui/input'
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

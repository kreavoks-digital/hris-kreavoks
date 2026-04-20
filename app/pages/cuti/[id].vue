<template>
  <div class="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <Button variant="ghost" size="icon" @click="navigateTo('/cuti')" class="rounded-full text-slate-500">
          <ChevronLeft class="h-5 w-5" />
        </Button>
        <div>
          <h1 class="text-3xl font-bold tracking-tight text-slate-900 leading-tight">Detail Pengajuan</h1>
          <p class="text-slate-500 text-sm">Informasi lengkap status pengajuan cuti Anda.</p>
        </div>
      </div>
      <Badge 
        v-if="leave"
        :variant="getStatusVariant(leave.status)"
        class="capitalize text-xs font-black px-4 py-1.5 rounded-full shadow-sm"
      >
        {{ getStatusLabel(leave.status) }}
      </Badge>
    </div>

    <!-- Main Content -->
    <div v-if="loading" class="flex flex-col items-center justify-center h-64 space-y-4">
      <Loader2 class="h-8 w-8 animate-spin text-blue-600" />
      <p class="text-sm text-slate-500 animate-pulse">Memuat detail pengajuan...</p>
    </div>

    <div v-else-if="leave" class="grid gap-6">
      <!-- Leave Info Card -->
      <Card class="border-none shadow-xl overflow-hidden">
        <CardHeader class="border-b bg-slate-50/50">
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <Calendar class="h-5 w-5" />
            </div>
            <CardTitle class="text-lg">Informasi Cuti</CardTitle>
          </div>
        </CardHeader>
        <CardContent class="p-8">
          <div class="grid gap-8 md:grid-cols-2">
            <!-- Left Column -->
            <div class="space-y-6">
              <div class="space-y-1">
                <Label class="text-xs uppercase tracking-widest text-slate-400 font-bold">Jenis Cuti</Label>
                <p class="text-lg font-bold text-slate-900">{{ getLeaveTypeLabel(leave.type) }}</p>
              </div>
              
              <div class="space-y-1">
                <Label class="text-xs uppercase tracking-widest text-slate-400 font-bold">Periode Cuti</Label>
                <div class="flex items-center gap-3 mt-1">
                  <div class="bg-slate-100 px-3 py-2 rounded-lg text-sm font-semibold text-slate-600">
                    {{ formatDate(leave.startDate) }}
                  </div>
                  <ArrowRight class="h-4 w-4 text-slate-300" />
                  <div class="bg-slate-100 px-3 py-2 rounded-lg text-sm font-semibold text-slate-600">
                    {{ formatDate(leave.endDate) }}
                  </div>
                </div>
              </div>

              <div class="space-y-1">
                <Label class="text-xs uppercase tracking-widest text-slate-400 font-bold">Total Durasi</Label>
                <p class="text-lg font-bold text-slate-900">{{ leave.duration }} Hari Kerja</p>
              </div>
            </div>

            <!-- Right Column -->
            <div class="space-y-6">
              <div class="space-y-1">
                <Label class="text-xs uppercase tracking-widest text-slate-400 font-bold">Tanggal Pengajuan</Label>
                <p class="text-base font-semibold text-slate-700">{{ formatDate(leave.createdAt) }}</p>
              </div>

              <div class="space-y-1">
                <Label class="text-xs uppercase tracking-widest text-slate-400 font-bold">Alasan / Keterangan</Label>
                <div class="bg-slate-50 p-4 rounded-xl border border-slate-100 min-h-[100px] text-sm text-slate-600 leading-relaxed shadow-inner">
                  {{ leave.reason || 'Tidak ada alasan yang diberikan.' }}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Action Buttons -->
      <div v-if="leave.status === 'pending'" class="flex gap-4">
        <Button variant="outline" class="flex-1 h-12 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-bold" @click="handleCancel">
          <XCircle class="h-4 w-4 mr-2" />
          Batalkan Pengajuan
        </Button>
      </div>

      <!-- Footer Info -->
      <div class="text-center">
        <p class="text-xs text-slate-400 italic">ID Pengajuan: {{ leave.id }}</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="text-center py-20">
      <div class="h-20 w-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertTriangle class="h-10 w-10" />
      </div>
      <h2 class="text-xl font-bold text-slate-900">Data Tidak Ditemukan</h2>
      <p class="text-slate-500 mt-2">Maaf, kami tidak dapat menemukan detail pengajuan yang Anda cari.</p>
      <Button variant="outline" class="mt-6" @click="navigateTo('/cuti')">
        Kembali ke Riwayat
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  ChevronLeft, 
  Calendar, 
  ArrowRight, 
  XCircle, 
  Loader2, 
  AlertTriangle 
} from 'lucide-vue-next'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { cutiApi } from '../api/cuti.api'
import type { LeaveRecord } from '~/types'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Label } from '~/components/ui/label'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: "default",
  middleware: "auth",
});

const route = useRoute()
const leaveId = route.params.id as string
const leave = ref<LeaveRecord | null>(null)
const loading = ref(true)

const fetchDetail = async () => {
  loading.value = true
  try {
    const response = await cutiApi.getLeaveById(leaveId)
    if (response.success) {
      leave.value = response.data.leave
    } else {
      toast.error('Gagal mengambil detail cuti')
    }
  } catch (err) {
    console.error('Error fetching detail:', err)
    toast.error('Terjadi kesalahan sistem')
  } finally {
    loading.value = false
  }
}

const handleCancel = async () => {
  if (!leave.value) return
  
  if (confirm('Yakin ingin membatalkan pengajuan cuti ini?')) {
    try {
      const response = await cutiApi.cancelLeave(leaveId)
      if (response.success) {
        toast.success('Pengajuan berhasil dibatalkan')
        navigateTo('/cuti')
      } else {
        toast.error(response.message || 'Gagal membatalkan pengajuan')
      }
    } catch (err) {
      console.error('Error canceling leave:', err)
      toast.error('Terjadi kesalahan sistem')
    }
  }
}

const getLeaveTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    annual: "Cuti Tahunan",
    sick: "Cuti Sakit",
    emergency: "Cuti Darurat",
  }
  return labels[type] || type
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: "Pending Approval",
    approved: "Telah Disetujui",
    rejected: "Pengajuan Ditolak",
  }
  return labels[status] || status
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'pending': return 'secondary'
    case 'approved': return 'default'
    case 'rejected': return 'destructive'
    default: return 'outline'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

onMounted(() => {
  fetchDetail()
})
</script>

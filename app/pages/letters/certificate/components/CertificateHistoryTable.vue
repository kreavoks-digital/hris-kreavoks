<template>
  <Card class="border border-border bg-card rounded-3xl overflow-hidden">
    <CardHeader class="bg-muted/40 border-b border-border py-4 px-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-2.5">
          <History class="h-4 w-4 text-kv-primary" />
          <div>
            <CardTitle class="text-sm font-bold text-foreground">Riwayat Sertifikat Diterbitkan</CardTitle>
            <p class="text-xs text-muted-foreground mt-0.5">Daftar sertifikat yang tercatat di database beserta status pengiriman email.</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <!-- Search Bar -->
          <div class="relative w-full sm:w-64">
            <Search class="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              v-model="searchQuery"
              placeholder="Cari nama, no. seri, posisi..."
              class="h-9 pl-9 text-xs rounded-2xl bg-background border-border"
            />
          </div>

          <!-- Refresh Button -->
          <Button
            size="sm"
            variant="outline"
            class="h-9 gap-1.5 text-xs font-semibold rounded-2xl border-border shrink-0"
            @click="fetchCertificates"
            :disabled="isLoading"
          >
            <RotateCw :class="['h-3.5 w-3.5', isLoading ? 'animate-spin' : '']" />
            Refresh
          </Button>
        </div>
      </div>
    </CardHeader>

    <CardContent class="p-0">
      <!-- Loading State -->
      <div v-if="isLoading" class="p-12 flex flex-col items-center justify-center gap-3 text-center">
        <Loader2 class="h-6 w-6 text-kv-primary animate-spin" />
        <p class="text-xs font-medium text-muted-foreground">Memuat data sertifikat...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredCertificates.length === 0" class="p-12 text-center space-y-2">
        <FileText class="h-8 w-8 text-muted-foreground mx-auto opacity-50" />
        <p class="text-xs font-semibold text-foreground">Belum Ada Sertifikat</p>
        <p class="text-xs text-muted-foreground">Sertifikat yang diunduh atau disimpan akan otomatis tercatat di tabel ini.</p>
      </div>

      <!-- Data Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="border-b border-border bg-muted/20 text-muted-foreground font-semibold">
              <th class="py-2.5 px-3 whitespace-nowrap font-semibold">No. Seri Sertifikat</th>
              <th class="py-2.5 px-3 font-semibold">Penerima &amp; Posisi</th>
              <th class="py-2.5 px-3 whitespace-nowrap font-semibold text-center">Predikat / Nilai</th>
              <th class="py-2.5 px-3 whitespace-nowrap font-semibold">Tgl Selesai &amp; Dibuat</th>
              <th class="py-2.5 px-3 whitespace-nowrap font-semibold">Status Email</th>
              <th class="py-2.5 px-3 whitespace-nowrap font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr
              v-for="cert in filteredCertificates"
              :key="cert.id"
              class="hover:bg-muted/30 transition-colors group"
            >
              <!-- 1. Nomor Seri (Murni Font Sans / Plus Jakarta Sans) -->
              <td class="py-2.5 px-3 whitespace-nowrap">
                <div class="flex items-center gap-1.5 font-sans">
                  <span class="font-sans font-bold text-xs text-foreground bg-muted/60 border border-border rounded-lg px-2 py-0.5 select-all">
                    {{ cert.serialNumber }}
                  </span>
                  <button
                    type="button"
                    title="Salin Nomor Seri"
                    class="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-foreground"
                    @click="copySerial(cert.serialNumber)"
                  >
                    <Copy class="h-3 w-3" />
                  </button>
                </div>
              </td>

              <!-- 2. Penerima & Posisi -->
              <td class="py-2.5 px-3">
                <div class="font-bold text-foreground text-xs">
                  {{ cert.recipientName }}
                </div>
                <div class="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <span>{{ cert.position || 'Intern' }}</span>
                  <span v-if="cert.user?.email">&bull; {{ cert.user.email }}</span>
                </div>
              </td>

              <!-- 3. Nilai & Predikat -->
              <td class="py-2.5 px-3 text-center whitespace-nowrap">
                <div class="inline-flex items-center gap-1.5">
                  <span
                    class="font-bold text-xs px-2 py-0.5 rounded-lg border-none"
                    :class="getGradeBadgeClass(cert.finalGrade)"
                  >
                    Grade {{ cert.finalGrade || 'A' }}
                  </span>
                  <span class="text-xs text-muted-foreground font-medium">
                    ({{ cert.attendanceScore ?? 0 }}%)
                  </span>
                </div>
              </td>

              <!-- 4. Tanggal Selesai & Dibuat -->
              <td class="py-2.5 px-3 whitespace-nowrap">
                <div class="font-medium text-foreground">
                  Selesai: {{ formatDate(cert.dateOfCompletion) }}
                </div>
                <div class="text-xs text-muted-foreground mt-0.5">
                  Dibuat: {{ formatDate(cert.createdAt, true) }}
                </div>
              </td>

              <!-- 5. Status Pengiriman Email -->
              <td class="py-2.5 px-3 whitespace-nowrap">
                <div v-if="cert.emailSentAt" class="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 class="h-3.5 w-3.5 shrink-0" />
                  <span>{{ formatDate(cert.emailSentAt, true) }}</span>
                </div>
                <div v-else class="flex items-center gap-1.5 text-muted-foreground">
                  <Clock class="h-3.5 w-3.5 shrink-0 opacity-60" />
                  <span>Belum Dikirim</span>
                </div>
              </td>

              <!-- 6. Aksi -->
              <td class="py-2.5 px-3 text-right whitespace-nowrap">
                <div class="inline-flex items-center justify-end gap-1">
                  <!-- Kirim Email Button -->
                  <Button
                    size="sm"
                    variant="outline"
                    class="h-7 text-xs px-2.5 gap-1 font-semibold rounded-xl border-border"
                    :disabled="sendingId === cert.id"
                    @click="openSendEmailDialog(cert)"
                  >
                    <Mail v-if="sendingId !== cert.id" class="h-3 w-3 text-kv-primary" />
                    <Loader2 v-else class="h-3 w-3 animate-spin" />
                    {{ cert.emailSentAt ? 'Kirim Ulang' : 'Kirim Email' }}
                  </Button>

                  <!-- Muat ke Studio Button -->
                  <Button
                    size="sm"
                    variant="ghost"
                    class="h-7 text-xs px-2 gap-1 font-semibold text-muted-foreground hover:text-foreground rounded-xl"
                    title="Tampilkan di Studio Preview"
                    @click="$emit('load-certificate', cert)"
                  >
                    <ExternalLink class="h-3 w-3" />
                    Edit
                  </Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </CardContent>

    <!-- Dialog Kirim Email Sertifikat -->
    <Dialog :open="isEmailDialogOpen" @update:open="isEmailDialogOpen = $event">
      <DialogContent class="rounded-3xl max-w-md">
        <DialogHeader>
          <div class="flex items-center gap-2">
            <Mail class="h-4 w-4 text-kv-primary" />
            <DialogTitle class="text-sm font-bold text-foreground">Kirim Sertifikat via Email</DialogTitle>
          </div>
          <DialogDescription class="text-xs text-muted-foreground">
            Kirimkan pemberitahuan resmi dan rincian verifikasi sertifikat langsung ke inbox email karyawan magang.
          </DialogDescription>
        </DialogHeader>

        <div v-if="targetCert" class="space-y-4 py-2">
          <div class="bg-muted/40 p-3 rounded-2xl border border-border space-y-1 text-xs">
            <div class="flex justify-between">
              <span class="text-muted-foreground">Penerima:</span>
              <strong class="text-foreground">{{ targetCert.recipientName }}</strong>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">No. Sertifikat:</span>
              <span class="font-mono text-kv-primary font-bold">{{ targetCert.serialNumber }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Predikat:</span>
              <span class="font-bold text-foreground">{{ targetCert.finalGrade || 'A' }}</span>
            </div>
          </div>

          <div class="space-y-1.5">
            <Label class="text-xs font-semibold text-foreground">Alamat Email Tujuan</Label>
            <Input
              v-model="targetEmail"
              type="email"
              placeholder="nama@gmail.com"
              class="rounded-2xl h-10 border-border bg-background text-xs font-medium"
            />
          </div>
        </div>

        <DialogFooter class="flex items-center justify-end gap-2 pt-2">
          <Button
            size="sm"
            variant="ghost"
            class="rounded-2xl"
            @click="isEmailDialogOpen = false"
          >
            Batal
          </Button>
          <Button
            size="sm"
            variant="default"
            class="rounded-2xl gap-2 font-bold"
            :disabled="!targetEmail || isSendingEmail"
            @click="submitSendEmail"
          >
            <Send v-if="!isSendingEmail" class="h-3.5 w-3.5" />
            <Loader2 v-else class="h-3.5 w-3.5 animate-spin" />
            {{ isSendingEmail ? 'Mengirim...' : 'Kirim Sekarang' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </Card>
</template>

<script setup lang="ts">
import { 
  History, 
  Search, 
  RotateCw, 
  FileText, 
  Copy, 
  CheckCircle2, 
  Clock, 
  Mail, 
  ExternalLink, 
  Send,
  Loader2 
} from 'lucide-vue-next'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { toast } from 'vue-sonner'
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Badge } from '~/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { certificateApi } from '../api'

const emit = defineEmits<{
  (e: 'load-certificate', cert: any): void
}>()

const certificates = ref<any[]>([])
const isLoading = ref(false)
const searchQuery = ref('')

const isEmailDialogOpen = ref(false)
const targetCert = ref<any | null>(null)
const targetEmail = ref('')
const isSendingEmail = ref(false)
const sendingId = ref<number | null>(null)

const fetchCertificates = async () => {
  isLoading.value = true
  try {
    const data = await certificateApi.getCertificates()
    certificates.value = data || []
  } catch (err) {
    console.error('Error fetching certificates:', err)
  } finally {
    isLoading.value = false
  }
}

const filteredCertificates = computed(() => {
  if (!searchQuery.value.trim()) return certificates.value
  const q = searchQuery.value.toLowerCase()
  return certificates.value.filter(c => 
    c.recipientName?.toLowerCase().includes(q) ||
    c.serialNumber?.toLowerCase().includes(q) ||
    c.position?.toLowerCase().includes(q) ||
    c.user?.email?.toLowerCase().includes(q)
  )
})

const formatDate = (dateStr?: string | Date, withTime = false) => {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return '-'
    const pattern = withTime ? 'dd MMM yyyy, HH:mm' : 'dd MMMM yyyy'
    return format(d, pattern, { locale: idLocale })
  } catch {
    return '-'
  }
}

const getGradeBadgeClass = (grade?: string) => {
  switch (grade) {
    case 'A':
      return 'bg-emerald-500 text-white'
    case 'AB':
      return 'bg-blue-600 text-white'
    case 'B':
      return 'bg-sky-500 text-white'
    case 'BC':
      return 'bg-amber-500 text-white'
    case 'C':
      return 'bg-orange-500 text-white'
    case 'D':
      return 'bg-rose-500 text-white'
    default:
      return 'bg-kv-primary text-white'
  }
}

const copySerial = (serial: string) => {
  navigator.clipboard.writeText(serial)
  toast.success('Nomor seri berhasil disalin!', { description: serial })
}

const openSendEmailDialog = (cert: any) => {
  targetCert.value = cert
  targetEmail.value = cert.user?.email || cert.emailSentTo || ''
  isEmailDialogOpen.value = true
}

const submitSendEmail = async () => {
  if (!targetCert.value || !targetEmail.value) return
  isSendingEmail.value = true
  sendingId.value = targetCert.value.id
  const toastId = toast.loading(`Mengirim sertifikat ke ${targetEmail.value}...`)

  try {
    const res = await certificateApi.sendCertificateEmail(targetCert.value.id, targetEmail.value)
    if (res.success) {
      toast.success('Email Sertifikat Berhasil Dikirim!', {
        id: toastId,
        description: `Terkirim ke ${targetEmail.value}`
      })
      isEmailDialogOpen.value = false
      // Update local state
      targetCert.value.emailSentAt = new Date().toISOString()
      targetCert.value.emailSentTo = targetEmail.value
      await fetchCertificates()
    } else {
      toast.error('Gagal Mengirim Email', {
        id: toastId,
        description: res.message
      })
    }
  } catch (error: any) {
    toast.error('Terjadi kesalahan saat mengirim email', {
      id: toastId,
      description: error?.message
    })
  } finally {
    isSendingEmail.value = false
    sendingId.value = null
  }
}

defineExpose({
  fetchCertificates
})

onMounted(() => {
  fetchCertificates()
})
</script>

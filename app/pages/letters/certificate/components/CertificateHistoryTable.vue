<template>
  <Card class="border border-border bg-card rounded-3xl overflow-hidden">
    <CardHeader class="bg-muted/40 border-b border-border py-4 px-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-2.5">
          <History class="h-4 w-4 text-kv-primary" />
          <div>
            <CardTitle class="text-sm font-bold text-foreground">Riwayat &amp; Manajemen Sertifikat</CardTitle>
            <p class="text-xs text-muted-foreground mt-0.5">Kelola, tambahkan manual, edit nomor surat/sertifikat, atau kirim via email.</p>
          </div>
        </div>

        <div class="flex items-center gap-2.5 flex-wrap">
          <!-- Search Bar -->
          <div class="relative w-full sm:w-56">
            <Search class="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              v-model="searchQuery"
              placeholder="Cari nama, no. seri..."
              class="h-9 pl-9 text-xs rounded-2xl bg-background border-border"
            />
          </div>

          <!-- Tambah Manual Button -->
          <Button
            size="sm"
            variant="default"
            class="h-9 gap-1.5 text-xs font-bold rounded-2xl shrink-0"
            @click="openAddModal"
          >
            <Plus class="h-3.5 w-3.5" />
            Tambah Manual
          </Button>

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
      <div v-else-if="filteredCertificates.length === 0" class="p-12 text-center space-y-3">
        <FileText class="h-8 w-8 text-muted-foreground mx-auto opacity-50" />
        <p class="text-xs font-semibold text-foreground">Belum Ada Sertifikat Tercatat</p>
        <p class="text-xs text-muted-foreground max-w-sm mx-auto">
          Sertifikat yang diunduh dari studio akan otomatis tercatat, atau Anda dapat menambahkan sertifikat manual/lama dengan tombol di atas.
        </p>
        <Button size="sm" variant="outline" class="rounded-2xl text-xs gap-1.5 font-bold" @click="openAddModal">
          <Plus class="h-3.5 w-3.5" />
          Tambah Sertifikat Baru
        </Button>
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
              <!-- 1. Nomor Seri (Font Sans) -->
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

              <!-- 6. Aksi Ringkas dengan More Actions Menu -->
              <td class="py-2.5 px-3 text-right whitespace-nowrap">
                <div class="inline-flex items-center justify-end gap-1.5">
                  <!-- Kirim Email Button -->
                  <Button
                    size="sm"
                    variant="outline"
                    class="h-7 text-xs px-2.5 gap-1 font-semibold rounded-xl border-border"
                    :disabled="sendingId === cert.id"
                    @click="openSendEmailDialog(cert)"
                    title="Kirim ke Email Penerima"
                  >
                    <Mail v-if="sendingId !== cert.id" class="h-3 w-3 text-kv-primary" />
                    <Loader2 v-else class="h-3 w-3 animate-spin" />
                    {{ cert.emailSentAt ? 'Kirim Ulang' : 'Kirim Email' }}
                  </Button>

                  <!-- More Actions Dropdown Menu -->
                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <Button
                        size="icon"
                        variant="ghost"
                        class="h-7 w-7 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
                        title="Opsi Lainnya"
                      >
                        <MoreHorizontal class="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" class="w-48 rounded-2xl p-1.5 shadow-md">
                      <DropdownMenuItem
                        class="cursor-pointer gap-2 text-xs py-2 rounded-xl"
                        @click="$emit('load-certificate', cert)"
                      >
                        <ExternalLink class="h-3.5 w-3.5 text-muted-foreground" />
                        <span>Buka di Studio</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        class="cursor-pointer gap-2 text-xs py-2 rounded-xl"
                        @click="openEditModal(cert)"
                      >
                        <Pencil class="h-3.5 w-3.5 text-muted-foreground" />
                        <span>Edit Data Sertifikat</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        class="cursor-pointer gap-2 text-xs py-2 rounded-xl"
                        @click="copySerial(cert.serialNumber)"
                      >
                        <Copy class="h-3.5 w-3.5 text-muted-foreground" />
                        <span>Salin No. Seri</span>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator class="my-1" />

                      <DropdownMenuItem
                        class="cursor-pointer gap-2 text-xs py-2 rounded-xl text-rose-500 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/30"
                        @click="confirmDeleteCert(cert)"
                      >
                        <Trash2 class="h-3.5 w-3.5" />
                        <span>Hapus Sertifikat</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </CardContent>

    <!-- ─── MODAL DIALOG: TAMBAH / EDIT DATA SERTIFIKAT ─── -->
    <Dialog :open="isFormModalOpen" @update:open="isFormModalOpen = $event">
      <DialogContent class="rounded-3xl max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div class="flex items-center gap-2">
            <FileBadge class="h-4 w-4 text-kv-primary" />
            <DialogTitle class="text-sm font-bold text-foreground">
              {{ isEditing ? 'Edit Data Sertifikat & Nomor Surat' : 'Tambah Sertifikat Manual' }}
            </DialogTitle>
          </div>
          <DialogDescription class="text-xs text-muted-foreground">
            {{ isEditing ? 'Sesuaikan nomor surat, nama penerima, atau nilai sertifikat yang telah tersimpan.' : 'Catat riwayat sertifikat yang dibuat manual atau arsip lama ke sistem.' }}
          </DialogDescription>
        </DialogHeader>

        <form @submit.prevent="submitCertForm" class="space-y-4 py-2 text-xs">
          <!-- Nomor Seri dengan Tombol Auto-Generate -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <Label class="text-xs font-semibold text-foreground">Nomor Seri / Nomor Surat</Label>
              <button
                type="button"
                class="text-[11px] font-semibold text-kv-primary hover:underline flex items-center gap-1"
                @click="autoGenerateModalSerial"
              >
                <Sparkles class="h-3 w-3" />
                Generate Otomatis
              </button>
            </div>
            <Input
              v-model="modalForm.serialNumber"
              placeholder="Contoh: KWS-INTRN-300826-001"
              required
              class="rounded-2xl h-10 border-border bg-background text-xs font-bold"
            />
          </div>

          <!-- Auto-fill dari Karyawan Magang (Jika Baru) -->
          <div v-if="!isEditing && interns.length > 0" class="space-y-1.5">
            <Label class="text-xs font-semibold text-muted-foreground">Pilih Dari Karyawan Magang (Opsional)</Label>
            <Select @update:model-value="onSelectInternInModal">
              <SelectTrigger class="rounded-2xl h-10 border-border bg-background text-xs">
                <SelectValue placeholder="Pilih intern untuk isi otomatis data..." />
              </SelectTrigger>
              <SelectContent class="rounded-2xl">
                <SelectItem v-for="intern in interns" :key="intern.id" :value="String(intern.id)">
                  {{ intern.name }} ({{ intern.department || 'Intern' }})
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <!-- Nama Penerima -->
            <div class="space-y-1.5">
              <Label class="text-xs font-semibold text-foreground">Nama Penerima</Label>
              <Input
                v-model="modalForm.recipientName"
                placeholder="Nama Lengkap"
                required
                class="rounded-2xl h-10 border-border bg-background text-xs font-medium"
              />
            </div>

            <!-- Posisi / Role -->
            <div class="space-y-1.5">
              <Label class="text-xs font-semibold text-foreground">Posisi / Role</Label>
              <Input
                v-model="modalForm.position"
                placeholder="Frontend Developer Intern"
                class="rounded-2xl h-10 border-border bg-background text-xs font-medium"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <!-- Tanggal Selesai -->
            <div class="space-y-1.5">
              <Label class="text-xs font-semibold text-foreground">Tanggal Selesai</Label>
              <Input
                v-model="modalForm.dateOfCompletion"
                type="date"
                class="rounded-2xl h-10 border-border bg-background text-xs font-medium"
              />
            </div>

            <!-- Durasi (Bulan) -->
            <div class="space-y-1.5">
              <Label class="text-xs font-semibold text-foreground">Durasi (Bulan)</Label>
              <Input
                v-model="modalForm.durationMonths"
                type="number"
                min="1"
                placeholder="6"
                class="rounded-2xl h-10 border-border bg-background text-xs font-medium"
              />
            </div>

            <!-- Grade / Predikat -->
            <div class="space-y-1.5">
              <Label class="text-xs font-semibold text-foreground">Predikat Akhir (Grade)</Label>
              <Select v-model="modalForm.finalGrade">
                <SelectTrigger class="rounded-2xl h-10 border-border bg-background text-xs font-bold">
                  <SelectValue placeholder="Grade" />
                </SelectTrigger>
                <SelectContent class="rounded-2xl">
                  <SelectItem value="A">Grade A (Istimewa)</SelectItem>
                  <SelectItem value="AB">Grade AB (Amat Baik)</SelectItem>
                  <SelectItem value="B">Grade B (Baik)</SelectItem>
                  <SelectItem value="BC">Grade BC (Cukup Baik)</SelectItem>
                  <SelectItem value="C">Grade C (Cukup)</SelectItem>
                  <SelectItem value="D">Grade D (Kurang)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <!-- Komponen Nilai Angka (0 - 100) -->
          <div class="border border-border rounded-2xl p-3 bg-muted/30 space-y-2">
            <Label class="text-xs font-bold text-foreground">Rincian Komponen Nilai (0 - 100)</Label>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <span class="text-[11px] text-muted-foreground">Presensi</span>
                <Input
                  v-model.number="modalForm.attendanceScore"
                  type="number"
                  min="0"
                  max="100"
                  class="rounded-xl h-8 text-xs font-bold bg-background"
                />
              </div>
              <div>
                <span class="text-[11px] text-muted-foreground">Kinerja</span>
                <Input
                  v-model.number="modalForm.workPerformanceScore"
                  type="number"
                  min="0"
                  max="100"
                  class="rounded-xl h-8 text-xs font-bold bg-background"
                />
              </div>
              <div>
                <span class="text-[11px] text-muted-foreground">Kerjasama</span>
                <Input
                  v-model.number="modalForm.teamWorkScore"
                  type="number"
                  min="0"
                  max="100"
                  class="rounded-xl h-8 text-xs font-bold bg-background"
                />
              </div>
              <div>
                <span class="text-[11px] text-muted-foreground">Komunikasi</span>
                <Input
                  v-model.number="modalForm.communicationScore"
                  type="number"
                  min="0"
                  max="100"
                  class="rounded-xl h-8 text-xs font-bold bg-background"
                />
              </div>
            </div>
          </div>

          <DialogFooter class="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              class="rounded-2xl"
              @click="isFormModalOpen = false"
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              variant="default"
              class="rounded-2xl gap-2 font-bold"
              :disabled="isSubmittingForm"
            >
              <Loader2 v-if="isSubmittingForm" class="h-3.5 w-3.5 animate-spin" />
              {{ isEditing ? 'Simpan Perubahan' : 'Catat Sertifikat' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- ─── DIALOG KIRIM EMAIL SERTIFIKAT ─── -->
    <Dialog :open="isEmailDialogOpen" @update:open="isEmailDialogOpen = $event">
      <DialogContent class="rounded-3xl max-w-md">
        <DialogHeader>
          <div class="flex items-center gap-2">
            <Mail class="h-4 w-4 text-kv-primary" />
            <DialogTitle class="text-sm font-bold text-foreground">Kirim Sertifikat via Email</DialogTitle>
          </div>
          <DialogDescription class="text-xs text-muted-foreground">
            Kirimkan pemberitahuan resmi dan rincian verifikasi sertifikat langsung ke inbox email karyawan.
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
              <span class="font-sans text-kv-primary font-bold">{{ targetCert.serialNumber }}</span>
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

    <!-- ─── DIALOG KONFIRMASI HAPUS SERTIFIKAT ─── -->
    <Dialog :open="isDeleteDialogOpen" @update:open="isDeleteDialogOpen = $event">
      <DialogContent class="rounded-3xl max-w-sm">
        <DialogHeader>
          <div class="flex items-center gap-2">
            <AlertTriangle class="h-4 w-4 text-rose-500" />
            <DialogTitle class="text-sm font-bold text-foreground">Hapus Riwayat Sertifikat?</DialogTitle>
          </div>
          <DialogDescription class="text-xs text-muted-foreground">
            Data sertifikat <strong class="text-foreground">{{ certToDelete?.serialNumber }}</strong> ({{ certToDelete?.recipientName }}) akan dihapus dari sistem. Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter class="flex items-center justify-end gap-2 pt-2">
          <Button
            size="sm"
            variant="ghost"
            class="rounded-2xl"
            @click="isDeleteDialogOpen = false"
          >
            Batal
          </Button>
          <Button
            size="sm"
            variant="destructive"
            class="rounded-2xl gap-2 font-bold"
            :disabled="isDeleting"
            @click="submitDeleteCert"
          >
            <Loader2 v-if="isDeleting" class="h-3.5 w-3.5 animate-spin" />
            {{ isDeleting ? 'Menghapus...' : 'Ya, Hapus' }}
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
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  FileBadge,
  Sparkles,
  MoreHorizontal,
  Loader2 
} from 'lucide-vue-next'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { toast } from 'vue-sonner'
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '~/components/ui/dropdown-menu'
import { certificateApi } from '../api'

const emit = defineEmits<{
  (e: 'load-certificate', cert: any): void
}>()

const certificates = ref<any[]>([])
const interns = ref<any[]>([])
const isLoading = ref(false)
const searchQuery = ref('')

// Form Modal State (Add / Edit)
const isFormModalOpen = ref(false)
const isEditing = ref(false)
const isSubmittingForm = ref(false)
const editingId = ref<number | null>(null)

const modalForm = ref({
  serialNumber: '',
  recipientName: '',
  position: '',
  durationMonths: '',
  dateOfCompletion: '',
  attendanceScore: 100,
  workPerformanceScore: 90,
  teamWorkScore: 90,
  communicationScore: 90,
  finalGrade: 'A',
  userId: undefined as number | undefined
})

// Email Dialog State
const isEmailDialogOpen = ref(false)
const targetCert = ref<any | null>(null)
const targetEmail = ref('')
const isSendingEmail = ref(false)
const sendingId = ref<number | null>(null)

// Delete Dialog State
const isDeleteDialogOpen = ref(false)
const certToDelete = ref<any | null>(null)
const isDeleting = ref(false)

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

const fetchInternList = async () => {
  const api = useApi()
  try {
    const res: any = await api('/users?role=INTERN&limit=100')
    const list = res?.data?.users || res?.users || res?.data || []
    interns.value = list.map((u: any) => ({
      id: u.id,
      name: u.profile?.fullName || u.email,
      department: u.profile?.department,
      position: u.profile?.position,
      institution: u.profile?.institution,
      startDate: u.profile?.startDate,
      endDate: u.profile?.endDate,
      email: u.email
    }))
  } catch {
    interns.value = []
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

// ─── MODAL ADD / EDIT METHODS ───
const openAddModal = async () => {
  isEditing.value = false
  editingId.value = null
  const nextSerial = await certificateApi.getNextSerial('INTERN')
  modalForm.value = {
    serialNumber: nextSerial || '',
    recipientName: '',
    position: '',
    durationMonths: '6',
    dateOfCompletion: format(new Date(), 'yyyy-MM-dd'),
    attendanceScore: 100,
    workPerformanceScore: 90,
    teamWorkScore: 90,
    communicationScore: 90,
    finalGrade: 'A',
    userId: undefined
  }
  isFormModalOpen.value = true
}

const openEditModal = (cert: any) => {
  isEditing.value = true
  editingId.value = cert.id
  let formattedDate = ''
  if (cert.dateOfCompletion) {
    try {
      formattedDate = format(new Date(cert.dateOfCompletion), 'yyyy-MM-dd')
    } catch {
      formattedDate = ''
    }
  }

  modalForm.value = {
    serialNumber: cert.serialNumber || '',
    recipientName: cert.recipientName || '',
    position: cert.position || '',
    durationMonths: cert.durationMonths || '6',
    dateOfCompletion: formattedDate,
    attendanceScore: cert.attendanceScore ?? 100,
    workPerformanceScore: cert.workPerformanceScore ?? 90,
    teamWorkScore: cert.teamWorkScore ?? 90,
    communicationScore: cert.communicationScore ?? 90,
    finalGrade: cert.finalGrade || 'A',
    userId: cert.userId || undefined
  }
  isFormModalOpen.value = true
}

const autoGenerateModalSerial = async () => {
  const nextSerial = await certificateApi.getNextSerial('INTERN', modalForm.value.userId)
  if (nextSerial) {
    modalForm.value.serialNumber = nextSerial
    toast.success('Nomor seri otomatis dibuat!', { description: nextSerial })
  }
}

const onSelectInternInModal = (idStr: any) => {
  const intern = interns.value.find(i => String(i.id) === String(idStr))
  if (!intern) return
  modalForm.value.userId = intern.id
  modalForm.value.recipientName = intern.name
  modalForm.value.position = intern.position || intern.department || ''
  if (intern.endDate) {
    try {
      modalForm.value.dateOfCompletion = format(new Date(intern.endDate), 'yyyy-MM-dd')
    } catch {
      modalForm.value.dateOfCompletion = format(new Date(), 'yyyy-MM-dd')
    }
  }
}

const submitCertForm = async () => {
  if (!modalForm.value.serialNumber || !modalForm.value.recipientName) {
    toast.error('Mohon lengkapi nomor seri dan nama penerima.')
    return
  }

  isSubmittingForm.value = true
  const toastId = toast.loading(isEditing.value ? 'Menyimpan perubahan...' : 'Mencatat sertifikat baru...')

  try {
    if (isEditing.value && editingId.value) {
      await certificateApi.updateCertificate(editingId.value, {
        ...modalForm.value,
        type: 'INTERN'
      })
      toast.success('Data Sertifikat Berhasil Diperbarui!', { id: toastId })
    } else {
      await certificateApi.saveCertificate({
        ...modalForm.value,
        type: 'INTERN'
      })
      toast.success('Sertifikat Manual Berhasil Dicatat!', { id: toastId })
    }
    isFormModalOpen.value = false
    await fetchCertificates()
  } catch (error: any) {
    toast.error(error?.data?.message || 'Gagal memproses data sertifikat', { id: toastId })
  } finally {
    isSubmittingForm.value = false
  }
}

// ─── EMAIL DIALOG METHODS ───
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

// ─── DELETE DIALOG METHODS ───
const confirmDeleteCert = (cert: any) => {
  certToDelete.value = cert
  isDeleteDialogOpen.value = true
}

const submitDeleteCert = async () => {
  if (!certToDelete.value) return
  isDeleting.value = true
  const toastId = toast.loading('Menghapus data sertifikat...')

  try {
    const success = await certificateApi.deleteCertificate(certToDelete.value.id)
    if (success) {
      toast.success('Sertifikat Berhasil Dihapus', { id: toastId })
      isDeleteDialogOpen.value = false
      certToDelete.value = null
      await fetchCertificates()
    } else {
      toast.error('Gagal Menghapus Sertifikat', { id: toastId })
    }
  } catch (err: any) {
    toast.error(err?.message || 'Terjadi kesalahan saat menghapus', { id: toastId })
  } finally {
    isDeleting.value = false
  }
}

defineExpose({
  fetchCertificates
})

onMounted(() => {
  fetchCertificates()
  fetchInternList()
})
</script>

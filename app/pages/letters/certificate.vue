<template>
  <div class="space-y-6 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-16">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2">
          <h1 class="text-2xl font-bold text-foreground tracking-tight">Certificate Generator</h1>
          <Badge variant="secondary" class="bg-kv-primary/10 text-kv-primary font-semibold border-none">
            E-Certificate Studio
          </Badge>
        </div>
        <p class="text-muted-foreground mt-1 text-sm">
          Buat, sesuaikan nilai, dan unduh sertifikat magang atau apresiasi secara instan dengan live preview.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <Button
          variant="outline"
          class="gap-2 border-border rounded-2xl h-10 hover:bg-muted"
          @click="handleDownloadImage"
          :disabled="isGenerating"
        >
          <ImageIcon class="h-4 w-4 text-muted-foreground" />
          Download PNG
        </Button>
        <Button
          class="gap-2 bg-kv-primary hover:bg-kv-primary/90 text-white rounded-2xl h-10 shadow-sm border-none"
          @click="handleDownloadPdf"
          :disabled="isGenerating"
        >
          <Download v-if="!isGenerating" class="h-4 w-4" />
          <Loader2 v-else class="h-4 w-4 animate-spin" />
          {{ isGenerating ? 'Menyiapkan Dokumen...' : 'Download PDF' }}
        </Button>
      </div>
    </div>

    <!-- Main Studio Split Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      <!-- LEFT PANEL: Editor & Auto-fill Controls (5 Columns) -->
      <div class="lg:col-span-5 space-y-6">
        
        <!-- 1. Auto-fill Selector Card -->
        <Card class="border border-border bg-card rounded-3xl overflow-hidden shadow-sm">
          <CardHeader class="bg-muted/40 border-b border-border py-4 px-6">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Sparkles class="h-4 w-4 text-kv-primary" />
                <CardTitle class="text-sm font-bold text-foreground">Auto-Fill dari Data Intern</CardTitle>
              </div>
              <Badge variant="outline" class="text-xs font-medium border-border">
                {{ interns.length }} Intern Tersedia
              </Badge>
            </div>
          </CardHeader>
          <CardContent class="p-6 space-y-4">
            <div class="space-y-2">
              <Label class="text-xs font-semibold text-foreground">Pilih Karyawan Magang</Label>
              <Select v-model="selectedInternId" @update:model-value="onSelectIntern">
                <SelectTrigger class="rounded-2xl h-11 border-border bg-background focus:ring-kv-primary">
                  <SelectValue placeholder="-- Pilih Intern untuk Auto-Fill --" />
                </SelectTrigger>
                <SelectContent class="rounded-2xl border-border bg-popover max-h-64">
                  <SelectItem v-for="intern in interns" :key="intern.id" :value="intern.id">
                    <div class="flex items-center gap-2 py-0.5">
                      <span class="font-medium text-foreground">{{ intern.name }}</span>
                      <span class="text-xs text-muted-foreground">({{ intern.position || intern.department }})</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div v-if="selectedIntern" class="p-3 bg-kv-primary/5 border border-kv-primary/20 rounded-2xl flex items-center justify-between text-xs">
              <div class="space-y-0.5">
                <p class="font-semibold text-foreground">{{ selectedIntern.name }}</p>
                <p class="text-muted-foreground">{{ selectedIntern.department }} &bull; {{ selectedIntern.institution || 'Kreavoks Intern' }}</p>
              </div>
              <Button size="sm" variant="ghost" class="h-7 text-xs text-kv-primary hover:bg-kv-primary/10" @click="resetFormToSample">
                Reset ke Default
              </Button>
            </div>
          </CardContent>
        </Card>

        <!-- 2. Form Customization Card -->
        <Card class="border border-border bg-card rounded-3xl overflow-hidden shadow-sm">
          <CardHeader class="bg-muted/40 border-b border-border py-4 px-6">
            <div class="flex items-center gap-2">
              <FileEdit class="h-4 w-4 text-kv-primary" />
              <CardTitle class="text-sm font-bold text-foreground">Detail Sertifikat</CardTitle>
            </div>
          </CardHeader>
          <CardContent class="p-6 space-y-5">
            
            <!-- Serial Number & Date -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <Label class="text-xs font-semibold text-foreground flex items-center justify-between">
                  Nomor Sertifikat
                  <button type="button" @click="regenerateSerial" class="text-[11px] text-kv-primary hover:underline font-normal">
                    Generate Baru
                  </button>
                </Label>
                <Input v-model="form.serialNumber" class="rounded-2xl h-10 border-border bg-background text-xs font-mono" placeholder="KWS-INTRN-011125-004" />
              </div>
              <div class="space-y-1.5">
                <Label class="text-xs font-semibold text-foreground">Date of Completion</Label>
                <Input v-model="form.dateOfCompletion" class="rounded-2xl h-10 border-border bg-background text-xs" placeholder="26 November 2025" />
              </div>
            </div>

            <!-- Recipient Name -->
            <div class="space-y-1.5">
              <Label class="text-xs font-semibold text-foreground">Nama Penerima (Calligraphy)</Label>
              <Input v-model="form.recipientName" class="rounded-2xl h-10 border-border bg-background text-sm font-medium" placeholder="Nama lengkap penerima" />
            </div>

            <!-- Position & Duration -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="sm:col-span-2 space-y-1.5">
                <Label class="text-xs font-semibold text-foreground">Posisi / Role Magang</Label>
                <Input v-model="form.position" class="rounded-2xl h-10 border-border bg-background text-xs" placeholder="UI/UX Designer" />
              </div>
              <div class="space-y-1.5">
                <Label class="text-xs font-semibold text-foreground">Durasi (Bulan)</Label>
                <Input v-model="form.durationMonths" type="number" min="1" max="24" class="rounded-2xl h-10 border-border bg-background text-xs" placeholder="3" />
              </div>
            </div>

            <!-- Custom Statement -->
            <div class="space-y-1.5">
              <Label class="text-xs font-semibold text-foreground flex items-center justify-between">
                Kalimat Ucapan / Statement
                <button type="button" @click="resetStatement" class="text-[11px] text-kv-primary hover:underline font-normal">
                  Reset Kalimat
                </button>
              </Label>
              <Textarea
                v-model="form.statementText"
                rows="3"
                class="rounded-2xl border-border bg-background text-xs leading-relaxed resize-none"
                placeholder="Successfully completed a 3-month internship as..."
              />
            </div>

            <hr class="border-border" />

            <!-- Scores Input Section -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <Label class="text-xs font-bold text-foreground uppercase tracking-wider">Komponen Nilai Magang</Label>
                <Badge variant="secondary" class="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold text-xs">
                  Predikat: {{ autoFinalGrade }}
                </Badge>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div class="space-y-1 bg-muted/30 p-2.5 rounded-2xl border border-border">
                  <Label class="text-[11px] font-medium text-muted-foreground block truncate">Attendance</Label>
                  <Input v-model.number="form.scores.attendance" type="number" min="0" max="100" class="h-8 text-center text-xs font-bold bg-background rounded-xl border-border" />
                </div>
                <div class="space-y-1 bg-muted/30 p-2.5 rounded-2xl border border-border">
                  <Label class="text-[11px] font-medium text-muted-foreground block truncate">Performance</Label>
                  <Input v-model.number="form.scores.workPerformance" type="number" min="0" max="100" class="h-8 text-center text-xs font-bold bg-background rounded-xl border-border" />
                </div>
                <div class="space-y-1 bg-muted/30 p-2.5 rounded-2xl border border-border">
                  <Label class="text-[11px] font-medium text-muted-foreground block truncate">Team Work</Label>
                  <Input v-model.number="form.scores.teamWork" type="number" min="0" max="100" class="h-8 text-center text-xs font-bold bg-background rounded-xl border-border" />
                </div>
                <div class="space-y-1 bg-muted/30 p-2.5 rounded-2xl border border-border">
                  <Label class="text-[11px] font-medium text-muted-foreground block truncate">Communication</Label>
                  <Input v-model.number="form.scores.communication" type="number" min="0" max="100" class="h-8 text-center text-xs font-bold bg-background rounded-xl border-border" />
                </div>
              </div>

              <div class="flex items-center gap-3 pt-1">
                <Label class="text-xs font-medium text-muted-foreground">Override Huruf Mutu Manual (Opsional):</Label>
                <Input v-model="form.customGrade" placeholder="Auto" class="w-20 h-8 text-center uppercase font-bold text-xs rounded-xl border-border bg-background" />
              </div>
            </div>

            <hr class="border-border" />

            <!-- Signatory Details -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <Label class="text-xs font-semibold text-foreground">Nama Penandatangan</Label>
                <Input v-model="form.signatoryName" class="rounded-2xl h-10 border-border bg-background text-xs" />
              </div>
              <div class="space-y-1.5">
                <Label class="text-xs font-semibold text-foreground">Jabatan Penandatangan</Label>
                <Input v-model="form.signatoryRole" class="rounded-2xl h-10 border-border bg-background text-xs" />
              </div>
            </div>

          </CardContent>
        </Card>

      </div>

      <!-- RIGHT PANEL: Live Certificate Preview & Zoom Controls (7 Columns) -->
      <div class="lg:col-span-7 space-y-4 sticky top-6">
        
        <!-- Preview Action Bar -->
        <div class="flex items-center justify-between bg-card border border-border rounded-2xl p-3 px-4 shadow-sm">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span class="text-xs font-bold text-foreground">Live WYSIWYG Preview</span>
            <span class="text-xs text-muted-foreground">(A4 Landscape &bull; 842 &times; 595 pt)</span>
          </div>

          <!-- Zoom Controls -->
          <div class="flex items-center gap-1.5 bg-muted p-1 rounded-xl">
            <button
              v-for="scale in [0.7, 0.85, 1.0]"
              :key="scale"
              @click="previewScale = scale"
              :class="[
                'px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all',
                previewScale === scale
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              ]"
            >
              {{ Math.round(scale * 100) }}%
            </button>
          </div>
        </div>

        <!-- Certificate Rendering Canvas Wrapper -->
        <div class="border border-border rounded-3xl bg-slate-900/5 dark:bg-slate-950/40 p-4 md:p-8 flex justify-center items-center overflow-x-auto shadow-inner min-h-[500px]">
          <div
            class="transition-transform duration-300 origin-top shadow-2xl rounded-sm"
            :style="{
              transform: `scale(${previewScale})`,
              transformOrigin: 'top center',
              marginBottom: `${(previewScale - 1) * 595.5}px`
            }"
          >
            <InternCertificatePreview
              id="live-intern-certificate"
              :serial-number="form.serialNumber"
              :recipient-name="form.recipientName"
              :date-of-completion="form.dateOfCompletion"
              :duration-months="form.durationMonths"
              :position="form.position"
              :statement-text="form.statementText"
              :signatory-name="form.signatoryName"
              :signatory-role="form.signatoryRole"
              :scores="form.scores"
              :final-grade="form.customGrade || autoFinalGrade"
            />
          </div>
        </div>

        <!-- Help Info Banner -->
        <div class="flex items-center gap-3 p-4 bg-muted/40 border border-border rounded-2xl text-xs text-muted-foreground">
          <Info class="h-4 w-4 text-kv-primary shrink-0" />
          <p>
            Hasil ekspor PDF menggunakan resolusi tinggi (High-DPI Vector/Canvas) yang siap langsung dicetak atau dikirimkan ke karyawan magang.
          </p>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  Sparkles, 
  FileEdit, 
  Download, 
  Image as ImageIcon, 
  Loader2, 
  Info 
} from 'lucide-vue-next'
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Badge } from '~/components/ui/badge'
import { Textarea } from '~/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { toast } from 'vue-sonner'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { employeeApi } from '~/pages/employee/api/employee.api'
import type { Employee } from '~/types'
import InternCertificatePreview from './components/InternCertificatePreview.vue'
import { generateCertificatePdf, generateCertificateImage } from '~/lib/pdf/generateCertificate'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'admin'],
  title: 'Certificate Generator'
})

// ─── State ────────────────────────────────────────────────────────────────────
const interns = ref<Employee[]>([])
const selectedInternId = ref<string>('')
const isGenerating = ref(false)
const previewScale = ref(0.85)

const form = ref({
  serialNumber: 'KWS-INTRN-011125-004',
  dateOfCompletion: '26 November 2025',
  recipientName: 'Wisnu Adi Pratama',
  position: 'UI/UX Designer',
  durationMonths: '3',
  statementText: '',
  signatoryName: 'Setiady Ibrahim Anwar',
  signatoryRole: 'Founder of Kreavoks digital agency',
  scores: {
    attendance: 95,
    workPerformance: 80,
    teamWork: 85,
    communication: 92
  },
  customGrade: ''
})

// ─── Computed ─────────────────────────────────────────────────────────────────
const selectedIntern = computed(() => {
  return interns.value.find(i => i.id === selectedInternId.value)
})

const autoFinalGrade = computed(() => {
  const avg = (form.value.scores.attendance + form.value.scores.workPerformance + form.value.scores.teamWork + form.value.scores.communication) / 4
  if (avg >= 85) return 'A'
  if (avg >= 78) return 'AB'
  if (avg >= 70) return 'B'
  if (avg >= 63) return 'BC'
  if (avg >= 55) return 'C'
  return 'D'
})

// ─── Helpers ──────────────────────────────────────────────────────────────────
const generateSerialString = () => {
  const dateStr = format(new Date(), 'ddMMyy')
  const randomNum = Math.floor(100 + Math.random() * 900)
  return `KWS-INTRN-${dateStr}-${randomNum}`
}

const regenerateSerial = () => {
  form.value.serialNumber = generateSerialString()
  toast.success('Nomor Seri Baru Dibuat', { description: form.value.serialNumber })
}

const resetStatement = () => {
  form.value.statementText = `Successfully completed a ${form.value.durationMonths || 3}-month internship as a ${form.value.position || 'UI/UX Designer'} at Kreavoks Digital Agency & Edutech. With following work and skill scores:`
}

const resetFormToSample = () => {
  selectedInternId.value = ''
  form.value = {
    serialNumber: generateSerialString(),
    dateOfCompletion: format(new Date(), 'dd MMMM yyyy', { locale: idLocale }),
    recipientName: 'Wisnu Adi Pratama',
    position: 'UI/UX Designer',
    durationMonths: '3',
    statementText: '',
    signatoryName: 'Setiady Ibrahim Anwar',
    signatoryRole: 'Founder of Kreavoks digital agency',
    scores: {
      attendance: 95,
      workPerformance: 80,
      teamWork: 85,
      communication: 92
    },
    customGrade: ''
  }
  resetStatement()
}

// ─── Auto-Fill Handler ────────────────────────────────────────────────────────
const onSelectIntern = (id: string) => {
  const intern = interns.value.find(i => i.id === id)
  if (!intern) return

  form.value.recipientName = intern.name
  form.value.position = intern.position || intern.department || 'UI/UX Designer'
  
  if (intern.endDate) {
    try {
      form.value.dateOfCompletion = format(new Date(intern.endDate), 'dd MMMM yyyy', { locale: idLocale })
    } catch {
      form.value.dateOfCompletion = format(new Date(), 'dd MMMM yyyy', { locale: idLocale })
    }
  }

  // Calculate duration in months if available
  if (intern.startDate && intern.endDate) {
    try {
      const start = new Date(intern.startDate)
      const end = new Date(intern.endDate)
      const months = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30)))
      form.value.durationMonths = String(months)
    } catch {
      form.value.durationMonths = '3'
    }
  }

  // Calculate attendance score if available
  if (intern.totalWorkingDays && intern.presentCount !== undefined) {
    const attendancePct = Math.min(100, Math.round((intern.presentCount / intern.totalWorkingDays) * 100))
    form.value.scores.attendance = attendancePct > 0 ? attendancePct : 90
  }

  form.value.serialNumber = generateSerialString()
  resetStatement()
  toast.success('Data Intern Berhasil Dimuat', { description: `Form telah diisi untuk ${intern.name}` })
}

// ─── Fetch Interns on Mount ───────────────────────────────────────────────────
onMounted(async () => {
  resetStatement()
  try {
    const response = await employeeApi.getEmployees(1, 100)
    if (response.success && response.data?.employees) {
      // Filter intern / graduate intern
      interns.value = response.data.employees.filter(e => e.role === 'INTERN' || e.status === 'GRADUATE' || e.department?.includes('KDT') || e.department?.includes('KCT'))
    }
  } catch (error) {
    console.error('Error fetching interns:', error)
  }
})

// ─── Export Handlers ──────────────────────────────────────────────────────────
const handleDownloadPdf = async () => {
  isGenerating.value = true
  const toastId = toast.loading('Memproses dokumen PDF sertifikat...')
  try {
    const safeName = form.value.recipientName.replace(/[^a-zA-Z0-9]/g, '_')
    const fileName = `Sertifikat_${safeName}_${form.value.serialNumber}.pdf`
    const result = await generateCertificatePdf('live-intern-certificate', fileName)
    
    if (result.success) {
      toast.success('Sertifikat Berhasil Diunduh!', { id: toastId, description: fileName })
    } else {
      toast.error('Gagal Mengunduh Sertifikat', { id: toastId, description: result.error })
    }
  } catch (err: any) {
    toast.error('Terjadi kesalahan saat generate PDF', { id: toastId })
  } finally {
    isGenerating.value = false
  }
}

const handleDownloadImage = async () => {
  isGenerating.value = true
  const toastId = toast.loading('Menyiapkan gambar sertifikat...')
  try {
    const safeName = form.value.recipientName.replace(/[^a-zA-Z0-9]/g, '_')
    const fileName = `Sertifikat_${safeName}_${form.value.serialNumber}.png`
    const result = await generateCertificateImage('live-intern-certificate', fileName)
    
    if (result.success) {
      toast.success('Gambar Sertifikat Berhasil Diunduh!', { id: toastId, description: fileName })
    } else {
      toast.error('Gagal Menyimpan Gambar', { id: toastId, description: result.error })
    }
  } catch (err: any) {
    toast.error('Terjadi kesalahan saat generate gambar', { id: toastId })
  } finally {
    isGenerating.value = false
  }
}
</script>

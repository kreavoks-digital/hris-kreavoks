<template>
  <div class="space-y-6 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-16">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2">
          <h1 class="text-2xl font-bold text-foreground">Certificate Generator</h1>
        </div>
        <p class="text-muted-foreground mt-1 text-sm">
          Buat, sesuaikan nilai, dan unduh sertifikat magang atau apresiasi secara instan dengan live preview.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <template v-if="canPerformActions">
          <Button
            variant="outline"
            @click="handleDownloadImage"
            :disabled="isGenerating"
          >
            <ImageIcon class="h-4 w-4" />
            Download PNG
          </Button>
          <Button
            variant="default"
            @click="handleDownloadPdf"
            :disabled="isGenerating"
          >
            <Download v-if="!isGenerating" class="h-4 w-4" />
            <Loader2 v-else class="h-4 w-4 animate-spin" />
            {{ isGenerating ? 'Menyiapkan Dokumen...' : 'Download PDF' }}
          </Button>
        </template>
        <span v-else class="text-xs text-muted-foreground italic px-3 py-2 border border-border rounded-xl bg-muted/30">
          View only — tidak dapat men-download
        </span>
      </div>
    </div>

    <!-- Main Studio Split Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      <!-- LEFT PANEL: Editor & Auto-fill Controls (5 Columns) -->
      <div class="lg:col-span-5 space-y-6">
        
        <!-- 1. Auto-fill Selector Card -->
        <Card class="border border-border bg-card rounded-3xl overflow-hidden">
          <CardHeader class="bg-muted/40 border-b border-border py-4 px-6">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UserCheck class="h-4 w-4 text-kv-primary" />
                <CardTitle class="text-sm font-bold text-foreground">Auto-Fill dari Data Intern</CardTitle>
              </div>
              <Badge variant="outline" class="text-xs font-medium border-border rounded-3xl">
                {{ interns.length }} Intern Tersedia
              </Badge>
            </div>
          </CardHeader>
          <CardContent class="p-6 space-y-4">
            <div class="space-y-2">
              <Label class="text-xs font-semibold text-foreground">Pilih Karyawan Magang</Label>
              <Select v-model="selectedInternId">
                <SelectTrigger class="rounded-2xl h-11 border-border bg-background focus:ring-kv-primary">
                  <SelectValue placeholder="Pilih Intern untuk Auto-Fill" />
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

            <div v-if="selectedIntern" class="p-4 bg-kv-primary/5 border border-kv-primary/20 rounded-3xl flex items-center justify-between text-xs">
              <div class="space-y-0.5">
                <p class="font-semibold text-foreground">{{ selectedIntern.name }}</p>
                <p class="text-muted-foreground">{{ selectedIntern.department }} &bull; {{ selectedIntern.institution || 'Kreavoks Intern' }}</p>
              </div>
              <Button size="sm" variant="ghost" @click="resetFormToSample">
                Reset ke Default
              </Button>
            </div>
          </CardContent>
        </Card>

        <!-- 2. Form Customization Card -->
        <Card class="border border-border bg-card rounded-3xl overflow-hidden">
          <CardHeader class="bg-muted/40 border-b border-border py-4 px-6">
            <div class="flex items-center gap-2">
              <FileBadge class="h-4 w-4 text-kv-primary" />
              <CardTitle class="text-sm font-bold text-foreground">Detail Sertifikat</CardTitle>
            </div>
          </CardHeader>
          <CardContent class="p-6 space-y-5">
            
            <!-- Serial Number & Date -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <div class="flex items-center justify-between">
                  <Label class="text-xs font-semibold text-foreground">Nomor Sertifikat</Label>
                  <span class="text-xs text-muted-foreground">Otomatis</span>
                </div>
                <Input :model-value="form.serialNumber" disabled readonly class="rounded-2xl h-10 border-border bg-muted/50 text-muted-foreground text-xs cursor-not-allowed font-semibold" placeholder="KWS-INTRN-011125-001" />
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
                <button type="button" @click="resetStatement" class="text-xs text-kv-primary hover:underline font-normal">
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
                <Label class="text-xs font-bold text-foreground">Komponen Nilai Magang</Label>
                <Badge variant="secondary" class="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold text-xs rounded-3xl">
                  Predikat: {{ autoFinalGrade }}
                </Badge>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <!-- Attendance -->
                <div class="space-y-1 bg-muted/30 p-2.5 rounded-2xl border border-border">
                  <div class="flex items-center justify-between px-1">
                    <Label class="text-xs font-semibold text-muted-foreground truncate">Attendance</Label>
                    <span v-if="isFetchingRecap" class="text-xs text-kv-primary animate-pulse">Menghitung...</span>
                    <span v-else-if="selectedIntern" class="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Auto</span>
                  </div>
                  <Input
                    :model-value="form.scores.attendance"
                    @input="(e: any) => updateScore('attendance', e.target.value)"
                    type="text"
                    inputmode="numeric"
                    min="0"
                    max="100"
                    placeholder="0"
                    class="h-9 text-center text-xs font-bold bg-background rounded-2xl border-border [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                <!-- Performance -->
                <div class="space-y-1 bg-muted/30 p-2.5 rounded-2xl border border-border">
                  <div class="flex items-center justify-between px-1">
                    <Label class="text-xs font-semibold text-muted-foreground truncate">Performance</Label>
                  </div>
                  <Input
                    :model-value="form.scores.workPerformance"
                    @input="(e: any) => updateScore('workPerformance', e.target.value)"
                    type="text"
                    inputmode="numeric"
                    min="0"
                    max="100"
                    placeholder="0"
                    class="h-9 text-center text-xs font-bold bg-background rounded-2xl border-border [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                <!-- Team Work -->
                <div class="space-y-1 bg-muted/30 p-2.5 rounded-2xl border border-border">
                  <div class="flex items-center justify-between px-1">
                    <Label class="text-xs font-semibold text-muted-foreground truncate">Team Work</Label>
                  </div>
                  <Input
                    :model-value="form.scores.teamWork"
                    @input="(e: any) => updateScore('teamWork', e.target.value)"
                    type="text"
                    inputmode="numeric"
                    min="0"
                    max="100"
                    placeholder="0"
                    class="h-9 text-center text-xs font-bold bg-background rounded-2xl border-border [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                <!-- Communication -->
                <div class="space-y-1 bg-muted/30 p-2.5 rounded-2xl border border-border">
                  <div class="flex items-center justify-between px-1">
                    <Label class="text-xs font-semibold text-muted-foreground truncate">Communication</Label>
                  </div>
                  <Input
                    :model-value="form.scores.communication"
                    @input="(e: any) => updateScore('communication', e.target.value)"
                    type="text"
                    inputmode="numeric"
                    min="0"
                    max="100"
                    placeholder="0"
                    class="h-9 text-center text-xs font-bold bg-background rounded-2xl border-border [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>

              <!-- Single Line Override Huruf Mutu & Auto Rentang -->
              <div class="flex flex-wrap items-center justify-between gap-4 pt-1">
                <div class="space-y-1.5">
                  <div class="flex items-center gap-2">
                    <Label class="text-xs font-semibold text-foreground">Override Huruf Mutu</Label>
                    <span class="text-xs text-muted-foreground">(Opsional)</span>
                  </div>
                  <!-- Clean Badge Chips tanpa Bullet Dots -->
                  <div class="flex flex-wrap items-center gap-1 text-xs">
                    <span class="px-2 py-0.5 rounded-lg bg-muted/60 text-muted-foreground font-medium"><strong class="text-kv-primary font-bold">A</strong> &ge; 85</span>
                    <span class="px-2 py-0.5 rounded-lg bg-muted/60 text-muted-foreground font-medium"><strong class="text-kv-primary font-bold">AB</strong> 78–84</span>
                    <span class="px-2 py-0.5 rounded-lg bg-muted/60 text-muted-foreground font-medium"><strong class="text-kv-primary font-bold">B</strong> 70–77</span>
                    <span class="px-2 py-0.5 rounded-lg bg-muted/60 text-muted-foreground font-medium"><strong class="text-kv-primary font-bold">BC</strong> 63–69</span>
                    <span class="px-2 py-0.5 rounded-lg bg-muted/60 text-muted-foreground font-medium"><strong class="text-kv-primary font-bold">C</strong> 55–62</span>
                    <span class="px-2 py-0.5 rounded-lg bg-muted/60 text-muted-foreground font-medium"><strong class="text-rose-500 font-bold">D</strong> &lt; 55</span>
                  </div>
                </div>
                <Input
                  v-model="form.customGrade"
                  placeholder="Auto"
                  class="w-20 h-9 text-center font-bold text-xs rounded-2xl border-border bg-background"
                />
              </div>
            </div>

          </CardContent>
        </Card>

      </div>

      <!-- RIGHT PANEL: Live Certificate Preview & Zoom Controls (7 Columns) -->
      <div class="lg:col-span-7 space-y-4 sticky top-6">
        
        <!-- Preview Action Bar -->
        <div class="flex items-center justify-between bg-card border border-border rounded-3xl p-3 px-5">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
            <span class="text-xs font-bold text-foreground">Live Preview</span>
          </div>

          <!-- Zoom Controls (Termasuk opsi 35% dan 50% untuk layar Mobile) -->
          <div class="flex items-center gap-1 bg-muted p-1 rounded-2xl overflow-x-auto max-w-full">
            <button
              v-for="scale in [0.35, 0.5, 0.75, 1.0]"
              :key="scale"
              @click="previewScale = scale"
              :class="[
                'px-2.5 py-1 text-xs font-semibold rounded-2xl transition-colors whitespace-nowrap',
                Math.abs(previewScale - scale) < 0.05
                  ? 'bg-background text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              ]"
            >
              {{ Math.round(scale * 100) }}%
            </button>
          </div>
        </div>

        <!-- Certificate Rendering Canvas Wrapper -->
        <div class="border border-border rounded-3xl bg-muted/20 p-2 sm:p-4 md:p-8 flex justify-center items-center overflow-x-auto min-h-[260px] sm:min-h-[450px]">
          <div
            class="transition-transform duration-300 origin-top rounded-sm"
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
        <div class="flex items-center gap-3 p-4 bg-muted/40 border border-border rounded-3xl text-xs text-muted-foreground">
          <Info class="h-4 w-4 text-kv-primary shrink-0" />
          <p>
            Hasil ekspor PDF menggunakan resolusi tinggi (High-DPI Canvas/Vector) yang siap langsung dicetak atau dikirimkan ke karyawan magang.
          </p>
        </div>

      </div>

    </div>

    <!-- ─── RIWAYAT SERTIFIKAT YANG SUDAH PERNAH DIBUAT ─── -->
    <CertificateHistoryTable
      ref="historyTableRef"
      @load-certificate="handleLoadCertificate"
    />
  </div>
</template>

<script setup lang="ts">
import { 
  UserCheck, 
  FileBadge, 
  Download, 
  Image as ImageIcon, 
  Loader2, 
  Info 
} from 'lucide-vue-next'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { toast } from 'vue-sonner'
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
import { useCertificateGenerator } from './hooks/useCertificateGenerator'
import InternCertificatePreview from './components/InternCertificatePreview.vue'
import CertificateHistoryTable from './components/CertificateHistoryTable.vue'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'admin'],
  title: 'Certificate Generator'
})

const { canPerformActions } = useViewerMode()

const historyTableRef = ref<InstanceType<typeof CertificateHistoryTable> | null>(null)

const {
  interns,
  selectedInternId,
  selectedIntern,
  isGenerating,
  isFetchingRecap,
  previewScale,
  form,
  autoFinalGrade,
  resetStatement,
  regenerateSerial,
  resetFormToSample,
  onSelectIntern,
  fetchInterns,
  handleDownloadPdf: downloadPdfRaw,
  handleDownloadImage: downloadImageRaw,
  updateScore
} = useCertificateGenerator()

const handleDownloadPdf = async () => {
  await downloadPdfRaw()
  historyTableRef.value?.fetchCertificates()
}

const handleDownloadImage = async () => {
  await downloadImageRaw()
  historyTableRef.value?.fetchCertificates()
}

const handleLoadCertificate = (cert: any) => {
  if (cert.userId) {
    selectedInternId.value = String(cert.userId)
  }
  form.value.serialNumber = cert.serialNumber
  form.value.recipientName = cert.recipientName
  form.value.position = cert.position || ''
  form.value.durationMonths = cert.durationMonths || ''
  if (cert.dateOfCompletion) {
    try {
      form.value.dateOfCompletion = format(new Date(cert.dateOfCompletion), 'dd MMMM yyyy', { locale: idLocale })
    } catch {
      form.value.dateOfCompletion = ''
    }
  }
  if (cert.statementText) {
    form.value.statementText = cert.statementText
  }
  form.value.scores.attendance = cert.attendanceScore ?? 0
  form.value.scores.workPerformance = cert.workPerformanceScore ?? 0
  form.value.scores.teamWork = cert.teamWorkScore ?? 0
  form.value.scores.communication = cert.communicationScore ?? 0
  form.value.customGrade = cert.finalGrade || ''

  window.scrollTo({ top: 0, behavior: 'smooth' })
  toast.success('Data Sertifikat Dimuat ke Studio', { description: cert.serialNumber })
}

onMounted(() => {
  resetStatement()
  fetchInterns()
})
</script>

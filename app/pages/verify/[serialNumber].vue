<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 text-foreground font-sans transition-colors duration-200">
    
    <!-- ─── HEADER / NAVBAR (Hidden on Print) ─── -->
    <header class="border-b border-border/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 print:hidden">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        <!-- Brand & Logo -->
        <NuxtLink to="/verify" class="flex items-center gap-3 group">
          <img
            src="/images/logo/kreavoks-hris.svg"
            alt="Kreavoks HRIS"
            class="h-6 w-auto dark:hidden"
          />
          <img
            src="/images/logo/kreavoks-hris-white.svg"
            alt="Kreavoks HRIS"
            class="h-6 w-auto hidden dark:block"
          />
          <div class="hidden sm:block h-4 w-px bg-border" />
          <span class="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-full">
            <ShieldCheck class="w-3.5 h-3.5 text-kv-primary" />
            Official Verification Portal
          </span>
        </NuxtLink>

        <!-- Right Header Actions -->
        <div class="flex items-center gap-2">
          <!-- Direct Search / Lookup Another -->
          <NuxtLink
            to="/verify"
            class="text-xs font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-xl hover:bg-muted transition-colors flex items-center gap-1.5"
          >
            <Search class="w-3.5 h-3.5" />
            <span class="hidden sm:inline">Cari Sertifikat Lain</span>
          </NuxtLink>

          <!-- Dark Mode Toggle -->
          <button
            type="button"
            class="w-9 h-9 rounded-xl border border-border/60 bg-background flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            :title="isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'"
            @click="toggleDark()"
          >
            <Sun v-if="isDark" class="w-4 h-4 text-amber-400" />
            <Moon v-else class="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>
    </header>

    <!-- ─── MAIN CONTENT ─── -->
    <main class="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

      <!-- ─── 1. LOADING STATE ─── -->
      <div v-if="isLoading" class="max-w-2xl mx-auto py-16 text-center space-y-6">
        <div class="relative w-20 h-20 mx-auto">
          <div class="absolute inset-0 rounded-3xl bg-kv-primary/20 animate-ping opacity-75" />
          <div class="relative w-20 h-20 rounded-3xl bg-kv-primary/10 border border-kv-primary/30 flex items-center justify-center text-kv-primary">
            <ShieldCheck class="w-10 h-10 animate-pulse" />
          </div>
        </div>
        <div class="space-y-2">
          <h2 class="text-xl font-bold text-foreground">Memeriksa Keaslian Sertifikat...</h2>
          <p class="text-xs sm:text-sm text-muted-foreground">
            Menghubungkan ke basis data resmi Kreavoks HRIS untuk nomor seri:
          </p>
          <span class="inline-block font-mono text-sm font-semibold bg-muted px-3 py-1 rounded-lg text-foreground">
            {{ serialNumber }}
          </span>
        </div>
      </div>

      <!-- ─── 2. ERROR / NOT FOUND STATE ─── -->
      <div
        v-else-if="!certificate"
        class="max-w-xl mx-auto bg-card border border-rose-200 dark:border-rose-900/50 rounded-3xl p-6 sm:p-10 shadow-lg text-center space-y-6"
      >
        <!-- Icon -->
        <div class="w-16 h-16 mx-auto rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center justify-center text-rose-500">
          <ShieldAlert class="w-9 h-9" />
        </div>

        <!-- Heading & Message -->
        <div class="space-y-2">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400">
            Sertifikat Tidak Valid / Tidak Ditemukan
          </div>
          <h1 class="text-xl sm:text-2xl font-bold text-foreground">
            Nomor Seri Tidak Terdaftar
          </h1>
          <p class="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {{ errorMessage || 'Nomor seri sertifikat yang Anda cari tidak ditemukan di basis data resmi Kreavoks.' }}
          </p>
          <div class="pt-2">
            <span class="font-mono text-xs sm:text-sm font-bold bg-muted px-3 py-1 rounded-md text-foreground select-all">
              {{ serialNumber }}
            </span>
          </div>
        </div>

        <!-- Quick Retry Search Box -->
        <div class="pt-4 border-t border-border/60 text-left space-y-3">
          <label class="block text-xs font-semibold text-foreground">
            Periksa kembali nomor seri:
          </label>
          <form @submit.prevent="handleRetrySearch" class="flex gap-2">
            <div class="relative flex-1">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                v-model="retrySerialInput"
                type="text"
                placeholder="Contoh: KWS-INTRN-2610-001"
                class="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-kv-primary/40"
                required
              />
            </div>
            <button
              type="submit"
              class="px-4 py-2 text-xs font-semibold rounded-xl bg-kv-primary hover:bg-kv-primary/90 text-white transition-colors cursor-pointer"
            >
              Cari
            </button>
          </form>
        </div>

        <!-- Help Guidance -->
        <div class="pt-4 text-xs text-muted-foreground">
          Butuh bantuan verifikasi manual? Hubungi tim People &amp; Culture Kreavoks di
          <a href="mailto:hello@kreavoks.my.id" class="text-kv-primary font-medium underline">hello@kreavoks.my.id</a>
        </div>
      </div>

      <!-- ─── 3. VERIFIED SUCCESS STATE ─── -->
      <div v-else class="space-y-6">

        <!-- Top Status Banner -->
        <div
          class="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/30 dark:border-emerald-500/20 shadow-sm print:hidden"
        >
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
                <CheckCircle2 class="w-7 h-7" />
              </div>
              <div class="space-y-1">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400">
                    <Check class="w-3.5 h-3.5" />
                    Terverifikasi Resmi
                  </span>
                  <span class="text-xs text-muted-foreground">
                    Diverifikasi pada: {{ verifiedAtString }}
                  </span>
                </div>
                <h1 class="text-lg sm:text-2xl font-bold text-foreground">
                  Dokumen Sah &amp; Terdaftar di Kreavoks HRIS
                </h1>
                <p class="text-xs sm:text-sm text-muted-foreground">
                  Sertifikat ini diakui secara legal dan diterbitkan oleh Kreavoks Digital Agency &amp; Edutech.
                </p>
              </div>
            </div>

            <!-- Action Buttons (Print / Copy Link) -->
            <div class="flex items-center gap-2 sm:self-center">
              <button
                type="button"
                @click="copyVerificationUrl"
                class="px-3.5 py-2 rounded-xl text-xs font-semibold bg-background border border-border hover:bg-muted text-foreground transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="Salin tautan publik verifikasi ini"
              >
                <Check v-if="isCopied" class="w-3.5 h-3.5 text-emerald-500" />
                <Copy v-else class="w-3.5 h-3.5 text-muted-foreground" />
                <span>{{ isCopied ? 'Tersalin!' : 'Salin Tautan' }}</span>
              </button>
              
              <button
                type="button"
                @click="printCertificate"
                class="px-4 py-2 rounded-xl text-xs font-semibold bg-kv-primary hover:bg-kv-primary/90 text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-kv-primary/20"
                title="Cetak atau simpan sebagai PDF"
              >
                <Printer class="w-3.5 h-3.5" />
                <span>Cetak / Simpan PDF</span>
              </button>
            </div>
          </div>
        </div>

        <!-- ─── OFFICIAL CERTIFICATE VOUCHER / CARD ─── -->
        <div
          class="bg-card border border-border/70 rounded-3xl shadow-xl overflow-hidden print:shadow-none print:border print:rounded-2xl print:m-0"
        >
          <!-- Card Header Decoration -->
          <div class="h-3 bg-gradient-to-r from-kv-primary via-sky-500 to-indigo-600 print:h-2" />

          <!-- Card Content Body -->
          <div class="p-6 sm:p-10 space-y-8">
            
            <!-- Header Section inside Voucher -->
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/60">
              <div class="flex items-center gap-4">
                <img
                  src="/images/logo/logo.png"
                  alt="Kreavoks"
                  class="w-14 h-14 object-contain rounded-2xl bg-white p-1 border border-border/60 shadow-sm"
                />
                <div>
                  <div class="text-[11px] font-bold uppercase tracking-wider text-kv-primary">
                    Kreavoks Digital Agency &amp; Edutech
                  </div>
                  <h2 class="text-xl sm:text-2xl font-extrabold text-foreground">
                    Sertifikat Kelulusan Program Magang
                  </h2>
                  <p class="text-xs text-muted-foreground">
                    Human Resource Information &amp; Credential Verification System
                  </p>
                </div>
              </div>

              <!-- Serial Number Pill Badge -->
              <div class="bg-muted/60 dark:bg-muted/30 border border-border rounded-2xl px-4 py-3 text-right">
                <div class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Nomor Seri Sertifikat
                </div>
                <div class="font-mono text-sm sm:text-base font-extrabold text-kv-primary select-all">
                  {{ certificate.serialNumber }}
                </div>
              </div>
            </div>

            <!-- Recipient Detail Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <!-- Left Column: Personal Information -->
              <div class="space-y-4">
                <div class="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <User class="w-3.5 h-3.5 text-kv-primary" />
                  Identitas Penerima
                </div>

                <div class="bg-muted/30 dark:bg-muted/10 rounded-2xl p-4 border border-border/50 space-y-3">
                  <div>
                    <div class="text-[11px] text-muted-foreground">Nama Lengkap</div>
                    <div class="text-base sm:text-lg font-bold text-foreground">
                      {{ certificate.recipientName }}
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <div class="text-[11px] text-muted-foreground">Posisi / Program</div>
                      <div class="text-xs font-semibold text-foreground">
                        {{ certificate.position || 'Intern' }}
                      </div>
                    </div>
                    <div>
                      <div class="text-[11px] text-muted-foreground">Tipe Sertifikat</div>
                      <div class="text-xs font-semibold text-foreground">
                        {{ certificate.type || 'INTERN' }}
                      </div>
                    </div>
                  </div>

                  <div v-if="certificate.user?.profile?.institution || certificate.user?.email">
                    <div class="text-[11px] text-muted-foreground">Institusi / Universitas</div>
                    <div class="text-xs font-semibold text-foreground">
                      {{ certificate.user?.profile?.institution || '-' }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right Column: Period & Timeline -->
              <div class="space-y-4">
                <div class="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Calendar class="w-3.5 h-3.5 text-kv-primary" />
                  Waktu &amp; Tanggal Pelaksanaan
                </div>

                <div class="bg-muted/30 dark:bg-muted/10 rounded-2xl p-4 border border-border/50 space-y-3">
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <div class="text-[11px] text-muted-foreground">Tanggal Selesai</div>
                      <div class="text-xs sm:text-sm font-semibold text-foreground">
                        {{ formatDate(certificate.dateOfCompletion) }}
                      </div>
                    </div>
                    <div>
                      <div class="text-[11px] text-muted-foreground">Durasi Magang</div>
                      <div class="text-xs sm:text-sm font-semibold text-foreground">
                        {{ certificate.durationMonths || '-' }}
                      </div>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <div class="text-[11px] text-muted-foreground">Tanggal Diterbitkan</div>
                      <div class="text-xs font-semibold text-foreground">
                        {{ formatDate(certificate.createdAt) }}
                      </div>
                    </div>
                    <div>
                      <div class="text-[11px] text-muted-foreground">Status Validasi</div>
                      <div class="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 class="w-3.5 h-3.5" />
                        Aktif &amp; Terdaftar
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <!-- Official Statement Box -->
            <div v-if="certificate.statementText" class="space-y-2">
              <div class="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Award class="w-3.5 h-3.5 text-kv-primary" />
                Pernyataan Resmi
              </div>
              <div class="p-4 rounded-2xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200/60 dark:border-sky-900/40 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                &ldquo;{{ certificate.statementText }}&rdquo;
              </div>
            </div>

            <!-- Assessment / Scores Breakdown (Interns) -->
            <div class="space-y-3">
              <div class="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span class="flex items-center gap-1.5">
                  <Sparkles class="w-3.5 h-3.5 text-kv-primary" />
                  Transkrip &amp; Rekapitulasi Penilaian
                </span>
                <span class="text-[11px] font-semibold text-kv-primary">
                  Standar Mutu Kreavoks
                </span>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <!-- 1. Attendance Score -->
                <div class="bg-card border border-border/80 rounded-2xl p-3 text-center">
                  <div class="text-[11px] text-muted-foreground font-medium mb-1">Kehadiran</div>
                  <div class="text-lg sm:text-xl font-extrabold text-foreground">
                    {{ certificate.attendanceScore ?? 0 }}%
                  </div>
                  <div class="text-[10px] text-muted-foreground mt-0.5">Presensi</div>
                </div>

                <!-- 2. Work Performance -->
                <div class="bg-card border border-border/80 rounded-2xl p-3 text-center">
                  <div class="text-[11px] text-muted-foreground font-medium mb-1">Kinerja Kerja</div>
                  <div class="text-lg sm:text-xl font-extrabold text-foreground">
                    {{ certificate.workPerformanceScore ?? 0 }}
                  </div>
                  <div class="text-[10px] text-muted-foreground mt-0.5">Skala 100</div>
                </div>

                <!-- 3. Team Work -->
                <div class="bg-card border border-border/80 rounded-2xl p-3 text-center">
                  <div class="text-[11px] text-muted-foreground font-medium mb-1">Kerja Sama</div>
                  <div class="text-lg sm:text-xl font-extrabold text-foreground">
                    {{ certificate.teamWorkScore ?? 0 }}
                  </div>
                  <div class="text-[10px] text-muted-foreground mt-0.5">Skala 100</div>
                </div>

                <!-- 4. Communication -->
                <div class="bg-card border border-border/80 rounded-2xl p-3 text-center">
                  <div class="text-[11px] text-muted-foreground font-medium mb-1">Komunikasi</div>
                  <div class="text-lg sm:text-xl font-extrabold text-foreground">
                    {{ certificate.communicationScore ?? 0 }}
                  </div>
                  <div class="text-[10px] text-muted-foreground mt-0.5">Skala 100</div>
                </div>

                <!-- 5. Final Predicate (Grade) -->
                <div class="col-span-2 sm:col-span-1 bg-gradient-to-br from-kv-primary/10 to-indigo-500/10 border border-kv-primary/30 rounded-2xl p-3 text-center flex flex-col justify-center items-center">
                  <div class="text-[11px] font-bold text-kv-primary uppercase">Predikat Akhir</div>
                  <div class="text-2xl font-black text-kv-primary mt-0.5">
                    Grade {{ certificate.finalGrade || 'A' }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Signatory & Security QR Code Section -->
            <div class="pt-6 border-t border-border/60 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              
              <!-- Signatory Info (2 cols on md) -->
              <div class="md:col-span-2 space-y-2">
                <div class="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Otoritas Pengesahan
                </div>
                <div class="space-y-0.5">
                  <div class="text-base font-bold text-foreground">
                    {{ certificate.signatoryName || 'M. Razi Farhan' }}
                  </div>
                  <div class="text-xs font-medium text-kv-primary">
                    {{ certificate.signatoryRole || 'Chief Executive Officer (CEO)' }}
                  </div>
                  <div class="text-xs text-muted-foreground">
                    Kreavoks Digital Agency &amp; Edutech
                  </div>
                </div>
                <p class="text-[11px] text-muted-foreground/80 pt-2 leading-relaxed">
                  Dokumen ini telah ditandatangani secara elektronik dan terverifikasi secara kriptografis pada sistem HRIS Kreavoks tanpa memerlukan tanda tangan basah fisik.
                </p>
              </div>

              <!-- Security QR Code (1 col on md) -->
              <div class="flex flex-col items-center justify-center p-4 bg-muted/40 dark:bg-muted/10 rounded-2xl border border-border/60 text-center">
                <div class="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
                  <QrcodeVue
                    :value="currentUrl"
                    :size="110"
                    level="H"
                    render-as="svg"
                  />
                </div>
                <div class="text-[10px] font-semibold text-muted-foreground mt-2">
                  Scan QR untuk Verifikasi Online
                </div>
              </div>

            </div>

          </div>

          <!-- Card Footer Info -->
          <div class="px-6 sm:px-10 py-4 bg-muted/40 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <div>
              &copy; {{ currentYear }} Kreavoks. Seluruh hak cipta dilindungi.
            </div>
            <div class="flex items-center gap-2">
              <span class="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sistem Verifikasi Publik Aktif</span>
            </div>
          </div>
        </div>

      </div>

    </main>

    <!-- ─── FOOTER (Hidden on Print) ─── -->
    <footer class="mt-12 py-8 border-t border-border/50 text-center text-xs text-muted-foreground print:hidden">
      <div class="max-w-5xl mx-auto px-4 space-y-2">
        <p>
          Kreavoks Digital Agency &amp; Edutech &bull; Jl. Kumbang No.14, Babakan, Kota Bogor, Indonesia 16128
        </p>
        <p>
          Layanan HRIS &amp; Verifikasi Sertifikat Resmi &bull; <a href="https://kreavoks.my.id" target="_blank" class="text-kv-primary hover:underline">kreavoks.my.id</a>
        </p>
      </div>
    </footer>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter, useRuntimeConfig, useHead } from '#imports'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { useDark, useToggle } from '@vueuse/core'
import { toast } from 'vue-sonner'
import QrcodeVue from 'qrcode.vue'
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle2,
  Check,
  Copy,
  Printer,
  Calendar,
  User,
  Award,
  Sparkles,
  Sun,
  Moon
} from 'lucide-vue-next'

// Standalone public page (no auth, no sidebar layout)
definePageMeta({
  layout: false
})

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()

// Dark mode control
const isDark = useDark()
const toggleDark = useToggle(isDark)

const serialNumber = computed(() => (route.params.serialNumber as string) || '')

const isLoading = ref(true)
const certificate = ref<any>(null)
const errorMessage = ref('')
const isCopied = ref(false)
const retrySerialInput = ref('')

const currentYear = new Date().getFullYear()

// Verification timestamp
const verifiedAtString = computed(() => {
  return format(new Date(), 'dd MMMM yyyy, HH:mm', { locale: idLocale }) + ' WIB'
})

// Current full URL for QR code and link sharing
const currentUrl = computed(() => {
  if (typeof window !== 'undefined') {
    return window.location.href
  }
  return `https://hris.kreavoks.my.id/verify/${serialNumber.value}`
})

// Date formatter helper
const formatDate = (dateStr?: string | Date) => {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return '-'
    return format(d, 'dd MMMM yyyy', { locale: idLocale })
  } catch {
    return '-'
  }
}

// Fetch certificate from public API endpoint
const fetchCertificate = async (serial: string) => {
  if (!serial) {
    isLoading.value = false
    errorMessage.value = 'Nomor seri sertifikat tidak disertakan.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  certificate.value = null

  const apiUrl = (config.public.apiUrl as string) || 'http://localhost:3001/api/v1'

  try {
    const res: any = await $fetch(`${apiUrl}/certificates/verify/${encodeURIComponent(serial.trim())}`, {
      method: 'GET'
    })

    if (res?.success && res?.data) {
      certificate.value = res.data
    } else {
      errorMessage.value = res?.message || 'Sertifikat tidak ditemukan atau nomor seri tidak valid.'
    }
  } catch (error: any) {
    const backendMessage = error?.data?.message || error?.response?._data?.message
    errorMessage.value = backendMessage || 'Sertifikat tidak ditemukan atau nomor seri tidak valid.'
  } finally {
    isLoading.value = false
  }
}

const copyVerificationUrl = async () => {
  try {
    await navigator.clipboard.writeText(currentUrl.value)
    isCopied.value = true
    toast.success('Tautan verifikasi berhasil disalin!')
    setTimeout(() => {
      isCopied.value = false
    }, 2500)
  } catch {
    toast.error('Gagal menyalin tautan.')
  }
}

const printCertificate = () => {
  if (typeof window !== 'undefined') {
    window.print()
  }
}

const handleRetrySearch = () => {
  if (retrySerialInput.value.trim()) {
    router.push(`/verify/${encodeURIComponent(retrySerialInput.value.trim())}`)
  }
}

// SEO & Meta title
useHead(() => ({
  title: certificate.value
    ? `Verifikasi Sertifikat: ${certificate.value.recipientName} (${certificate.value.serialNumber}) | Kreavoks HRIS`
    : `Verifikasi Sertifikat Online | Kreavoks HRIS`,
  meta: [
    {
      name: 'description',
      content: 'Portal verifikasi resmi keaslian dokumen sertifikat magang dan kepesertaan Kreavoks Digital Agency & Edutech.'
    }
  ]
}))

onMounted(() => {
  retrySerialInput.value = serialNumber.value
  fetchCertificate(serialNumber.value)
})
</script>

<style scoped>
@media print {
  body {
    background-color: #ffffff !important;
    color: #000000 !important;
  }
}
</style>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 text-foreground font-sans flex flex-col justify-between">
    
    <!-- Header -->
    <header class="border-b border-border/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <NuxtLink to="/verify" class="flex items-center gap-3">
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
    </header>

    <!-- Main Content Hero & Search Box -->
    <main class="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20 flex-1 flex flex-col justify-center items-center text-center">
      
      <!-- Shield Badge -->
      <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-kv-primary/10 text-kv-primary border border-kv-primary/20 mb-6">
        <ShieldCheck class="w-4 h-4 text-kv-primary" />
        Layanan Resmi Verifikasi Sertifikat
      </div>

      <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight leading-tight mb-4">
        Verifikasi Keaslian Sertifikat <span class="text-kv-primary">Kreavoks</span>
      </h1>

      <p class="text-sm sm:text-base text-muted-foreground max-w-xl mb-8 leading-relaxed">
        Pusat validasi resmi dokumen dan sertifikat kelulusan program magang &amp; kemitraan yang diterbitkan oleh Kreavoks Digital Agency &amp; Edutech.
      </p>

      <!-- Search Card Form -->
      <div class="w-full max-w-xl bg-card border border-border/70 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4 text-left">
        <form @submit.prevent="handleVerify" class="space-y-4">
          <div class="space-y-1.5">
            <label for="serial-input" class="text-xs font-bold text-foreground flex items-center justify-between">
              <span>Nomor Seri / Nomor Sertifikat</span>
              <span class="text-[11px] font-normal text-muted-foreground">Tercantum pada sertifikat</span>
            </label>
            <div class="relative">
              <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                id="serial-input"
                v-model="inputSerial"
                type="text"
                placeholder="Contoh: KWS-INTRN-011125-001"
                class="w-full pl-10 pr-4 py-3 text-sm font-mono rounded-2xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-kv-primary/40 transition-all uppercase"
                required
                autocomplete="off"
              />
            </div>
          </div>

          <button
            type="submit"
            class="w-full py-3 px-6 rounded-2xl bg-kv-primary hover:bg-kv-primary/90 text-white font-bold text-sm shadow-md shadow-kv-primary/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ShieldCheck class="w-4 h-4" />
            <span>Verifikasi Sekarang</span>
          </button>
        </form>

        <!-- Helper hint -->
        <div class="pt-3 border-t border-border/50 text-[11px] text-muted-foreground text-center">
          Format umum nomor seri sertifikat: <code class="font-mono bg-muted px-1.5 py-0.5 rounded text-foreground">KWS-INTRN-MMYY-XXX</code>
        </div>
      </div>

      <!-- Trust Pillars -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 w-full max-w-2xl text-left">
        <div class="p-4 rounded-2xl bg-card border border-border/60 space-y-1.5">
          <div class="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 class="w-4 h-4" />
          </div>
          <div class="text-xs font-bold text-foreground">Terverifikasi Real-Time</div>
          <div class="text-[11px] text-muted-foreground leading-relaxed">
            Data dicocokkan langsung ke database resmi HRIS Kreavoks.
          </div>
        </div>

        <div class="p-4 rounded-2xl bg-card border border-border/60 space-y-1.5">
          <div class="w-8 h-8 rounded-xl bg-sky-500/10 text-kv-primary flex items-center justify-center">
            <FileBadge class="w-4 h-4" />
          </div>
          <div class="text-xs font-bold text-foreground">Transkrip Resmi</div>
          <div class="text-[11px] text-muted-foreground leading-relaxed">
            Menampilkan rincian kompetensi, kehadiran, dan predikat akhir.
          </div>
        </div>

        <div class="p-4 rounded-2xl bg-card border border-border/60 space-y-1.5">
          <div class="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <Lock class="w-4 h-4" />
          </div>
          <div class="text-xs font-bold text-foreground">Aman &amp; Tepercaya</div>
          <div class="text-[11px] text-muted-foreground leading-relaxed">
            Mencegah pemalsuan dokumen dan sertifikat program magang.
          </div>
        </div>
      </div>

    </main>

    <!-- Footer -->
    <footer class="py-6 border-t border-border/50 text-center text-xs text-muted-foreground">
      <div class="max-w-5xl mx-auto px-4 space-y-1">
        <p>&copy; {{ currentYear }} Kreavoks Digital Agency &amp; Edutech. Seluruh hak cipta dilindungi.</p>
        <p>Hubungi dukungan kami: <a href="mailto:hello@kreavoks.my.id" class="text-kv-primary underline">hello@kreavoks.my.id</a></p>
      </div>
    </footer>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useHead } from '#imports'
import { useDark, useToggle } from '@vueuse/core'
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  FileBadge,
  Lock,
  Sun,
  Moon
} from 'lucide-vue-next'

// Standalone public page
definePageMeta({
  layout: false
})

const router = useRouter()
const isDark = useDark()
const toggleDark = useToggle(isDark)

const inputSerial = ref('')
const currentYear = new Date().getFullYear()

const handleVerify = () => {
  if (inputSerial.value.trim()) {
    router.push(`/verify/${encodeURIComponent(inputSerial.value.trim())}`)
  }
}

useHead({
  title: 'Pusat Verifikasi Sertifikat Resmi | Kreavoks HRIS',
  meta: [
    {
      name: 'description',
      content: 'Verifikasi keaslian nomor sertifikat kelulusan program magang dan mitra Kreavoks Digital Agency & Edutech.'
    }
  ]
})
</script>

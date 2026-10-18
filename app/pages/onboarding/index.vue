<template>
  <div class="min-h-dvh flex bg-slate-50 dark:bg-slate-950 font-sans">
    <!-- Left Side: Form Container -->
    <div class="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 md:px-16 lg:px-24 py-8 min-h-dvh overflow-y-auto">
      <div class="w-full max-w-md mx-auto my-auto">
        <!-- Brand Logos -->
        <div class="flex items-center gap-2.5 mb-6">
          <img
            src="/images/logo/logo.png"
            alt="Kreavoks Logo"
            class="h-5 w-auto object-contain"
          />
          <div class="h-3.5 w-px bg-slate-200 dark:bg-slate-700"></div>
          <img
            src="/images/logo/kreavoks-hris.svg"
            alt="Kreavoks HRIS"
            class="h-4 w-auto object-contain dark:hidden"
          />
          <img
            src="/images/logo/kreavoks-hris-white.svg"
            alt="Kreavoks HRIS"
            class="h-4 w-auto object-contain hidden dark:block"
          />
        </div>

        <!-- Header -->
        <div class="mb-6">
          <h1 class="text-2xl sm:text-3xl font-semibold tracking-tight text-[#131313] dark:text-slate-50">
            Lengkapi Dokumen Mentor
          </h1>
          <p class="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1.5">
            Unggah dokumen perjanjian kerja sama untuk mengaktifkan akses dashboard kamu.
          </p>
        </div>

        <!-- Form Link Reminder Banner -->
        <div class="p-3.5 mb-6 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 rounded-xl flex items-start gap-3">
          <Info class="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div class="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
            Pastikan kamu sudah mengisi berkas mentor di
            <a
              href="https://bit.ly/kvdocs-mentor2026"
              target="_blank"
              class="font-semibold underline hover:text-blue-900 dark:hover:text-blue-200"
            >
              https://bit.ly/kvdocs-mentor2026
            </a>
            terlebih dahulu sebelum mengunggah dokumen di sini.
          </div>
        </div>

        <!-- Upload Form -->
        <form @submit.prevent="handleSubmit" class="space-y-5">
          <!-- Upload Dokumen Perjanjian (Reused from RegisterForm) -->
          <div class="space-y-2">
            <Label for="agreementFile" class="text-sm font-medium">
              Upload Surat Perjanjian (PDF) <span class="text-red-500">*</span>
            </Label>

            <!-- List file yang dipilih -->
            <div v-if="files.length > 0" class="space-y-2">
              <div
                v-for="(file, index) in files"
                :key="index"
                class="flex items-center justify-between p-3 border rounded-md bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              >
                <div class="flex items-center gap-2 overflow-hidden">
                  <FileText class="h-5 w-5 text-primary flex-shrink-0" />
                  <span class="text-sm font-medium truncate">
                    {{ file.name }}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  @click="removeFile(index)"
                  class="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <X class="h-4 w-4" />
                </Button>
              </div>
            </div>

            <!-- Input File Picker jika belum mencapai 3 file -->
            <template v-if="files.length < 3">
              <Input
                id="agreementFile"
                ref="fileInputRef"
                type="file"
                accept=".pdf"
                @change="handleFileChange"
                class="w-full cursor-pointer file:cursor-pointer"
              />
              <p class="text-xs text-slate-500">
                Pilih hingga 3 file, format PDF (maks. 2MB per file)
              </p>
            </template>
            <p v-else class="text-xs text-slate-500">
              Batas maksimal 3 file telah tercapai.
            </p>
          </div>

          <!-- Submit Button -->
          <Button
            type="submit"
            class="w-full text-base font-medium"
            variant="primary"
            size="md"
            :loading="loading"
            :disabled="files.length === 0 || loading"
          >
            Kirim Dokumen
          </Button>
        </form>

        <!-- Logout Action -->
        <div class="mt-6 text-center text-xs sm:text-sm text-slate-500">
          Ingin keluar dari akun?
          <button
            type="button"
            @click="logoutAndRedirect"
            class="text-kv-primary font-medium hover:underline ml-1"
          >
            Keluar
          </button>
        </div>
      </div>
    </div>

    <!-- Right Side: Clean Illustration / Info -->
    <div class="hidden lg:flex w-1/2 bg-white dark:bg-slate-900 items-center justify-center p-20 relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950/20 z-0"></div>
      <div class="absolute top-[-10%] right-[-10%] w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>
      <div class="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl"></div>

      <div class="relative z-10 w-full h-full flex flex-col items-center justify-center">
        <img
          src="/images/login/computer-login.png"
          alt="Illustration"
          class="max-w-[85%] max-h-[65%] w-auto h-auto object-contain"
        />
        <div class="mt-8 text-center max-w-sm">
          <h2 class="text-2xl font-medium text-[#131313] dark:text-slate-100">
            Kolaborasi Terintegrasi
          </h2>
          <p class="mt-3 text-slate-400 text-sm">
            Setelah dokumen terverifikasi, kamu dapat langsung mengelola bimbingan dan jadwal mentoring di platform Kreavoks.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { FileText, X, Info } from 'lucide-vue-next'
import { Button } from '@kreavoks/kreaui'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { toast } from 'vue-sonner'
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  layout: false,
})

const { accessToken, fetchUser, logoutAndRedirect } = useAuth()
const config = useRuntimeConfig()
const apiUrl = (config.public.apiUrl as string) || 'http://localhost:3001/api/v1'

const files = ref<File[]>([])
const fileInputRef = ref<HTMLInputElement | null>(null)
const loading = ref(false)

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target?.files?.[0]
  if (!file) return

  // Validasi tipe file PDF
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    toast.error('Format file harus PDF')
    target.value = ''
    return
  }

  // Validasi ukuran maksimal 2MB per file
  if (file.size > 2 * 1024 * 1024) {
    toast.error('Ukuran file maksimal 2MB per file')
    target.value = ''
    return
  }

  // Maksimal 3 file
  if (files.value.length >= 3) {
    toast.error('Maksimal 3 file PDF')
    target.value = ''
    return
  }

  // Cek apakah file dengan nama yang sama sudah ada di list
  const alreadyExists = files.value.some(f => f.name === file.name && f.size === file.size)
  if (alreadyExists) {
    toast.error('File ini sudah ditambahkan')
    target.value = ''
    return
  }

  files.value.push(file)
  target.value = ''
}

const removeFile = (index: number) => {
  files.value.splice(index, 1)
}

const handleSubmit = async () => {
  if (files.value.length === 0) {
    toast.error('Pilih minimal satu file PDF')
    return
  }

  loading.value = true
  try {
    const formData = new FormData()
    files.value.forEach((file) => {
      formData.append('files', file)
    })

    const res = await $fetch<any>(`${apiUrl}/profile/documents`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken.value}`
      },
      body: formData
    })

    if (res.success) {
      toast.success('Dokumen Berhasil Diunggah', {
        description: 'Akses dashboard kamu kini telah aktif.'
      })
      await fetchUser()
      await navigateTo('/dashboard')
    } else {
      toast.error('Gagal Mengunggah', {
        description: res.message || 'Terjadi kesalahan saat mengunggah dokumen'
      })
    }
  } catch (err: any) {
    toast.error('Gagal Mengunggah', {
      description: err.data?.message || err.message || 'Terjadi kesalahan sistem'
    })
  } finally {
    loading.value = false
  }
}
</script>

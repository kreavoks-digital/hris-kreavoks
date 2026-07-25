<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Button } from '~/components/ui/button'
import { useAuth } from '~/composables/useAuth'
import { useSsoWhitelist } from '~/composables/useSsoWhitelist'

definePageMeta({
  layout: false,
})

const route = useRoute()
const router = useRouter()
const { user, accessToken } = useAuth()
const { isValidRedirectUri, getAppName } = useSsoWhitelist()

const loading = ref(true)
const errorMsg = ref('')

/**
 * SECURITY FIX: App name hanya berasal dari redirect_uri yang sudah divalidasi whitelist.
 * Tidak menerima input dari user sama sekali.
 */
const targetAppName = computed(() => {
  const redirectUri = route.query.redirect_uri as string
  if (redirectUri && isValidRedirectUri(redirectUri)) {
    return getAppName(redirectUri)
  }
  return 'Kreavoks'
})

const handleAuthorize = async () => {
  loading.value = true
  errorMsg.value = ''
  
  const redirectUri = route.query.redirect_uri as string

  // SECURITY FIX: Validasi redirect_uri terhadap whitelist domain sebelum diproses
  if (!redirectUri) {
    errorMsg.value = "Parameter redirect_uri tidak ditemukan."
    loading.value = false
    return
  }

  if (!isValidRedirectUri(redirectUri)) {
    errorMsg.value = "Tujuan redirect tidak diizinkan."
    loading.value = false
    return
  }

  // Pastikan user sudah login ke HRIS/SSO terlebih dahulu
  if (!user.value || !accessToken.value) {
    const fullPath = route.fullPath
    router.push(`/sso/login?redirect=${encodeURIComponent(fullPath)}`)
    return
  }

  try {
    const config = useRuntimeConfig()
    const apiUrl = (config.public.apiUrl as string) || 'http://localhost:3001/api/v1'

    // SECURITY FIX: Kirim redirect_uri ke backend agar bisa divalidasi dan
    // dimasukkan ke dalam payload SSO token sebagai audience (aud).
    const { data, error } = await useFetch<{ success: boolean; token: string }>('/auth/sso-token', {
      baseURL: apiUrl,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken.value}`
      },
      body: {
        redirect_uri: redirectUri,
      }
    })

    if (error.value || !data.value?.success) {
      errorMsg.value = "Gagal membuat token otorisasi SSO."
      loading.value = false
      return
    }

    // Kirim SSO token ke redirect_uri yang sudah tervalidasi
    const token = data.value.token
    const url = new URL(redirectUri)
    url.searchParams.append('token', token)
    
    window.location.href = url.toString()
    
  } catch (err) {
    errorMsg.value = "Terjadi kesalahan saat memproses otorisasi SSO."
    loading.value = false
  }
}

onMounted(() => {
  handleAuthorize()
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-[#f0f4f9] dark:bg-slate-950 p-4 sm:p-8 font-sans">
    <!-- Google-like wide card -->
    <div class="w-full max-w-[1040px] bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 md:p-8 lg:p-10 shadow-sm border border-slate-100 dark:border-slate-800/60 flex flex-col">
      
      <!-- Top Logo Header -->
      <div class="w-full">
        <img
          src="/images/sso/kreavoks-sso.svg"
          alt="Kreavoks SSO Logo"
          class="h-7 md:h-8 w-auto object-contain"
        />
        <!-- Divider abu tipis -->
        <hr class="my-4 md:my-5 border-slate-100 dark:border-slate-800/60" />
      </div>

      <!-- Bottom Split Content -->
      <div class="flex flex-col md:flex-row gap-8 md:gap-16 w-full">
        
        <!-- Left Side: Branding -->
        <div class="flex-1 flex flex-col">
          <h1 class="text-3xl md:text-4xl font-normal text-slate-900 dark:text-white tracking-tight">
            Otorisasi
          </h1>
          <p class="text-base text-slate-600 dark:text-slate-400 mt-3">
            Menyiapkan jalur aman ke <span class="font-medium text-slate-800 dark:text-slate-200">{{ targetAppName }}</span>
          </p>
        </div>

        <!-- Right Side: Action Area -->
        <div class="flex-1 flex flex-col justify-center max-w-md w-full">
        
        <!-- Loading State -->
        <div v-if="loading" class="space-y-6 text-left">
          <div class="h-14 w-14 rounded-full border-4 border-slate-100 dark:border-slate-800 flex items-center justify-center relative">
            <div class="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          </div>
          <div>
            <h2 class="text-xl font-medium text-slate-900 dark:text-white tracking-tight">
              Tunggu sebentar...
            </h2>
            <p class="text-[15px] text-slate-500 dark:text-slate-400 mt-2">
              Sistem sedang melakukan otentikasi sesi Anda untuk login SSO.
            </p>
          </div>
        </div>

        <!-- Error State -->
        <div v-else class="space-y-8">
          <div>
            <h2 class="text-xl font-medium text-red-600 dark:text-red-400 tracking-tight">
              Otorisasi Gagal
            </h2>
            <p class="text-[15px] text-slate-600 dark:text-slate-400 mt-2">
              {{ errorMsg }}
            </p>
          </div>

          <div class="flex flex-col sm:flex-row items-center gap-4">
            <Button
              @click="handleAuthorize"
            >
              Coba Lagi
            </Button>

            <Button
              variant="outline"
              @click="router.push('/sso/login')"
            >
              Login Ulang
            </Button>
          </div>
        </div>
      </div>

      </div>
    </div>
  </div>
</template>

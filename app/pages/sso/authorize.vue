<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ShieldCheck, AlertCircle, RefreshCw } from 'lucide-vue-next'
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  layout: false,
})

const route = useRoute()
const router = useRouter()
const { user, accessToken } = useAuth()

const loading = ref(true)
const errorMsg = ref('')

const handleAuthorize = async () => {
  loading.value = true
  errorMsg.value = ''
  
  const redirectUri = route.query.redirect_uri as string
  if (!redirectUri) {
    errorMsg.value = "Parameter redirect_uri tidak ditemukan."
    loading.value = false
    return
  }

  // Ensure the user is logged into HRIS/SSO first
  if (!user.value || !accessToken.value) {
    const fullPath = route.fullPath
    router.push(`/sso/login?redirect=${encodeURIComponent(fullPath)}`)
    return
  }

  try {
    const config = useRuntimeConfig()
    const apiUrl = (config.public.apiUrl as string) || 'http://localhost:3001/api/v1'

    const { data, error } = await useFetch<{ success: boolean; token: string }>('/auth/sso-token', {
      baseURL: apiUrl,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken.value}`
      }
    })

    if (error.value || !data.value?.success) {
      errorMsg.value = "Gagal membuat token otorisasi SSO."
      loading.value = false
      return
    }

    // Redirect back to the requested URI with the token
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
  <div class="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 font-sans relative overflow-hidden">
    <!-- Background Glow Effects -->
    <div class="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

    <div class="w-full max-w-md z-10">
      <div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-none text-center space-y-6">
        
        <!-- Loading State -->
        <div v-if="loading" class="space-y-5 py-4">
          <div class="relative w-16 h-16 mx-auto flex items-center justify-center">
            <div class="absolute inset-0 border-4 border-blue-100 dark:border-blue-900/40 rounded-full"></div>
            <div class="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <ShieldCheck class="w-7 h-7 text-blue-600 dark:text-blue-400 relative z-10" />
          </div>

          <div class="space-y-1">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 mb-2">
              Kreavoks Single Sign-On
            </span>
            <h2 class="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Mengamankan Akses SSO...
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Menyiapkan jalur enkripsi aman Anda menuju Portal Kreavoks.
            </p>
          </div>
        </div>

        <!-- Error State -->
        <div v-else class="space-y-5 py-2">
          <div class="w-14 h-14 bg-red-50 dark:bg-red-950/50 text-red-500 rounded-2xl flex items-center justify-center mx-auto border border-red-100 dark:border-red-900/50">
            <AlertCircle class="w-7 h-7" />
          </div>

          <div class="space-y-1">
            <h2 class="text-lg font-bold text-slate-900 dark:text-white">Otorisasi SSO Gagal</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">{{ errorMsg }}</p>
          </div>

          <div class="flex gap-2 pt-2">
            <button
              @click="handleAuthorize"
              class="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-md"
            >
              <RefreshCw class="w-3.5 h-3.5" />
              Coba Lagi
            </button>

            <button
              @click="router.push('/sso/login')"
              class="flex-1 py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-all"
            >
              Login Ulang
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

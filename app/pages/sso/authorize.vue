<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'

const route = useRoute()
const router = useRouter()
const { user, accessToken } = useAuth()

const loading = ref(true)
const errorMsg = ref('')

onMounted(async () => {
  const redirectUri = route.query.redirect_uri as string
  if (!redirectUri) {
    errorMsg.value = "Missing redirect_uri parameter."
    loading.value = false
    return
  }

  // Ensure the user is logged into HRIS first
  if (!user.value || !accessToken.value) {
    // Save the intended SSO authorization URL so we can return here after login
    const fullPath = route.fullPath
    router.push(`/auth/login?redirect=${encodeURIComponent(fullPath)}`)
    return
  }

      try {
    // User is logged in, fetch SSO token from KvHRISBE
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
      errorMsg.value = "Failed to generate SSO token."
      loading.value = false
      return
    }

    // Redirect back to the requested URI with the token
    const token = data.value.token
    const url = new URL(redirectUri)
    url.searchParams.append('token', token)
    
    window.location.href = url.toString()
    
  } catch (err) {
    errorMsg.value = "An unexpected error occurred during SSO authorization."
    loading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full text-center">
      <div v-if="loading" class="space-y-4">
        <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <h2 class="text-lg font-semibold text-gray-900">Mengamankan Jalur SSO...</h2>
        <p class="text-sm text-gray-500">Mempersiapkan otorisasi aman Anda ke Portal Kreavoks.</p>
      </div>
      
      <div v-else class="space-y-4">
        <div class="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </div>
        <h2 class="text-lg font-semibold text-gray-900">Otorisasi SSO Gagal</h2>
        <p class="text-sm text-gray-500">{{ errorMsg }}</p>
        <button @click="router.push('/')" class="mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800">
          Kembali ke Dashboard
        </button>
      </div>
    </div>
  </div>
</template>

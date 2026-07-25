<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { useAuth } from '~/composables/useAuth'
import { useLogin } from '~/pages/auth/login/hooks/useLogin'
import { useSsoWhitelist } from '~/composables/useSsoWhitelist'

definePageMeta({
  layout: false,
})

const route = useRoute()
const router = useRouter()
const { user, accessToken } = useAuth()
const { loading, error, handleLogin } = useLogin()
const { isValidRedirectUri, getAppName, isValidInternalRedirect } = useSsoWhitelist()

const form = ref({
  email: '',
  password: '',
})

/**
 * SECURITY FIX: App name hanya berasal dari redirect_uri yang sudah divalidasi whitelist.
 * Query param ?app_name dari user DIABAIKAN untuk mencegah phishing.
 */
const targetAppName = computed(() => {
  const redirectUri = route.query.redirect_uri as string
  if (redirectUri && isValidRedirectUri(redirectUri)) {
    return getAppName(redirectUri)
  }
  return 'Kreavoks'
})

/**
 * SECURITY FIX: Validasi redirect param agar tidak bisa jadi open redirect.
 * - redirect_uri: harus lolos whitelist domain
 * - redirect: harus berupa path relatif (dimulai dengan /)
 */
const getRedirectUrl = () => {
  const redirect = route.query.redirect as string
  const redirectUri = route.query.redirect_uri as string
  const state = route.query.state as string

  // Validasi internal path (dari /sso/authorize yang redirect ke /sso/login)
  if (redirect && isValidInternalRedirect(redirect)) return redirect

  // Validasi redirect_uri ke domain eksternal yang diizinkan
  if (redirectUri && isValidRedirectUri(redirectUri)) {
    let url = `/sso/authorize?redirect_uri=${encodeURIComponent(redirectUri)}`
    if (state) {
      url += `&state=${encodeURIComponent(state)}`
    }
    return url
  }

  return '/dashboard'
}

onMounted(() => {
  // If user is already logged in, automatically proceed to authorization or target redirect
  if (user.value && accessToken.value) {
    const target = getRedirectUrl()
    router.push(target)
  }
})

const onSubmit = async () => {
  const target = getRedirectUrl()
  await handleLogin(form.value, target)
}
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
        <!-- Left Side: Text Branding -->
        <div class="flex-1 flex flex-col">
          <h1 class="text-3xl md:text-4xl font-normal text-slate-900 dark:text-white tracking-tight">
          Masuk
        </h1>
        <p class="text-base text-slate-600 dark:text-slate-400 mt-3">
          Lanjutkan ke <span class="font-medium text-slate-800 dark:text-slate-200">{{ targetAppName }}</span>
        </p>
      </div>

      <!-- Right Side: Form -->
      <div class="flex-1 flex flex-col justify-center max-w-md w-full">
        <!-- Error Message Alert -->
        <div v-if="error" class="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/30 rounded-2xl text-sm text-red-600 dark:text-red-400">
          {{ error }}
        </div>

        <form @submit.prevent="onSubmit" class="space-y-6">
          <div class="space-y-2">
            <Label for="sso-email">Email</Label>
            <Input
              id="sso-email"
              v-model="form.email"
              type="email"
              placeholder="example@mail.com"
              required
            />
          </div>

          <div class="space-y-2">
            <Label for="sso-password">Kata Sandi</Label>
            <Input
              id="sso-password"
              v-model="form.password"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>

          <div class="pt-4 flex items-center justify-end">
            <Button
              type="submit"
              :disabled="loading"
            >
              {{ loading ? 'Memproses...' : 'Selanjutnya' }}
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>
</template>

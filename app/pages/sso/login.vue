<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Mail, Lock, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { useAuth } from '~/composables/useAuth'
import { useLogin } from '~/pages/auth/login/hooks/useLogin'

definePageMeta({
  layout: false,
})

const route = useRoute()
const router = useRouter()
const { user, accessToken } = useAuth()
const { loading, error, handleLogin } = useLogin()

const form = ref({
  email: '',
  password: '',
})
const showPassword = ref(false)

const getRedirectUrl = () => {
  const redirect = route.query.redirect as string
  const redirectUri = route.query.redirect_uri as string

  if (redirect) return redirect
  if (redirectUri) return `/sso/authorize?redirect_uri=${encodeURIComponent(redirectUri)}`
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
  await handleLogin(form.value)
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 font-sans relative overflow-hidden">
    <!-- Background Glow Effects -->
    <div class="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

    <div class="w-full max-w-md z-10">
      <!-- Main SSO Login Card -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6">
        
        <!-- Header & Logo -->
        <div class="text-center space-y-3">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 mb-1 border border-blue-100 dark:border-blue-900/50">
            <ShieldCheck class="w-7 h-7" />
          </div>
          
          <div>
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 mb-2">
              Kreavoks Single Sign-On
            </span>
            <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Masuk ke Kreavoks
            </h1>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Gunakan akun terintegrasi Anda untuk melanjutkan.
            </p>
          </div>
        </div>

        <!-- Error Message Alert -->
        <div v-if="error" class="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-2xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
          <span>{{ error }}</span>
        </div>

        <!-- Form -->
        <form @submit.prevent="onSubmit" class="space-y-4">
          <div class="space-y-1.5 text-left">
            <Label for="sso-email" class="text-xs font-semibold text-slate-700 dark:text-slate-300">Email Akun</Label>
            <div class="relative">
              <Mail class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="sso-email"
                v-model="form.email"
                type="email"
                placeholder="nama@email.com"
                class="pl-10 h-11 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-sm focus:bg-white dark:focus:bg-slate-900"
                required
              />
            </div>
          </div>

          <div class="space-y-1.5 text-left">
            <Label for="sso-password" class="text-xs font-semibold text-slate-700 dark:text-slate-300">Kata Sandi</Label>
            <div class="relative">
              <Lock class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="sso-password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Masukkan kata sandi"
                class="pl-10 pr-10 h-11 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-sm focus:bg-white dark:focus:bg-slate-900"
                required
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <Eye v-if="!showPassword" class="h-4 w-4" />
                <EyeOff v-else class="h-4 w-4" />
              </button>
            </div>
          </div>

          <Button
            type="submit"
            class="w-full h-11 rounded-xl text-sm font-semibold mt-2 transition-all shadow-md bg-blue-600 hover:bg-blue-700 text-white"
            :disabled="loading"
          >
            <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
            {{ loading ? 'Memproses Otorisasi...' : 'Masuk & Lanjutkan' }}
          </Button>
        </form>

        <!-- Footer Info -->
        <div class="pt-2 border-t border-slate-100 dark:border-slate-800/80 text-center">
          <p class="text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1.5">
            <Lock class="w-3 h-3 text-emerald-500" />
            Otorisasi SSO Terenkripsi & Aman
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

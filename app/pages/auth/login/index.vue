<template>
  <div class="h-screen flex bg-slate-50 dark:bg-slate-950 font-sans overflow-hidden lg:overflow-hidden">
    <!-- Left Side: Form -->
    <div
      class="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-6 md:py-10"
    >
      <div class="mb-8 flex flex-col items-center">
        <img
          src="/images/logo/logo.png"
          alt="Kreavoks Logo"
          class="w-32 md:w-40 h-auto object-contain mb-6"
        />
        <div class="text-center">
          <h1 class="text-2xl font-medium text-[#131313] dark:text-slate-50">
            Selamat Datang Kembali
          </h1>
          <p class="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-[340px] mx-auto">
            Masuk ke akun Anda untuk mengelola tugas harian dan meningkatkan produktivitas tim.
          </p>
        </div>
      </div>

      <div class="w-full max-w-md mx-auto">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div class="space-y-2">
            <Label for="email" class="text-sm font-medium">Email</Label>
            <div class="relative">
              <Mail class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="email"
                v-model="form.email"
                type="email"
                placeholder="nama@perusahaan.com"
                class="pl-10"
                required
              />
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <Label for="password" class="text-sm font-medium">Password</Label>
              <NuxtLink
                to="/auth/forgot-password"
                class="text-sm text-kv-primary hover:underline hover:text-kv-primary/80 transition-colors"
              >
                Lupa password?
              </NuxtLink>
            </div>
            <div class="relative">
              <Lock class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Masukkan password"
                class="pl-10 pr-10"
                required
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <Eye v-if="!showPassword" class="h-4 w-4" />
                <EyeOff v-else class="h-4 w-4" />
              </button>
            </div>
          </div>

          <Button
            type="submit"
            class="w-full text-base font-medium"
            :disabled="loading"
          >
            <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
            {{ loading ? 'Sedang Masuk...' : 'Masuk ke Akun' }}
          </Button>
        </form>

        <div class="mt-8 text-center text-sm text-slate-500">
          Belum punya akun?
          <NuxtLink
            to="/auth/register"
            class="text-kv-primary font-medium hover:underline ml-1 transition-all"
          >
            Daftar Sekarang
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Right Side: Illustration -->
    <div
      class="hidden lg:flex w-1/2 bg-white dark:bg-slate-900 items-center justify-center p-20 relative overflow-hidden"
    >
      <div class="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950/20 z-0"></div>
      
      <!-- Decorative Blobs -->
      <div class="absolute top-[-10%] right-[-10%] w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>
      <div class="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl"></div>

      <div class="relative z-10 w-full h-full flex flex-col items-center justify-center">
        <img
          src="/images/login/computer-login.png"
          alt="Illustration"
          class="max-w-[85%] max-h-[65%] w-auto h-auto object-contain"
        />
        <div class="mt-8 text-center max-w-sm">
          <h2 class="text-2xl font-medium text-[#131313] dark:text-slate-100">Efisiensi Dalam Genggaman</h2>
          <p class="mt-3 text-slate-400 text-sm">Kreavoks HRIS membantu HR dan karyawan berkolaborasi dalam satu platform yang terintegrasi dan modern.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useLogin } from './hooks/useLogin'
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

definePageMeta({
  layout: false,
});

const showPassword = ref(false)
const form = reactive({
  email: "",
  password: "",
});

const { loading, error, handleLogin: apiLogin } = useLogin()

const handleLogin = async () => {
  await apiLogin({
    email: form.email,
    password: form.password
  })
}
</script>

<style scoped>
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}
</style>

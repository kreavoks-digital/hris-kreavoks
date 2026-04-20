<template>
  <div class="min-h-screen flex bg-slate-50 dark:bg-slate-950 font-sans">
    <div
      class="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-10"
    >
      <div class="mb-8 flex flex-col items-center">
        <img
          src="/images/logo/logo.png"
          alt="Kreavoks Logo"
          class="w-40 h-auto object-contain mb-6"
        />
        <div class="text-center">
          <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Buat Akun Baru
          </h1>
          <p class="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-[340px] mx-auto">
            Bergabunglah dengan Kreavoks HRIS untuk pengelolaan tim yang lebih baik.
          </p>
        </div>
      </div>

      <div class="w-full max-w-md mx-auto">
        <form @submit.prevent="handleRegister" class="space-y-5">
          <div class="space-y-2">
            <Label for="name" class="text-sm font-medium">Nama Lengkap</Label>
            <div class="relative">
              <User class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="name"
                v-model="form.name"
                type="text"
                placeholder="Masukkan nama Anda"
                class="pl-10 h-11"
                required
              />
            </div>
          </div>

          <div class="space-y-2">
            <Label for="email" class="text-sm font-medium">Email Perusahaan</Label>
            <div class="relative">
              <Mail class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="email"
                v-model="form.email"
                type="email"
                placeholder="nama@perusahaan.com"
                class="pl-10 h-11"
                required
              />
            </div>
          </div>

          <div class="space-y-2">
            <Label for="password" class="text-sm font-medium">Password</Label>
            <div class="relative">
              <Lock class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Buat password minimal 8 karakter"
                class="pl-10 pr-10 h-11"
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

          <div class="flex items-center space-x-2 pt-2">
            <Checkbox id="terms" required />
            <label
              for="terms"
              class="text-xs text-slate-500 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Saya setuju dengan <a href="#" class="text-primary hover:underline">Ketentuan Layanan</a> dan <a href="#" class="text-primary hover:underline">Kebijakan Privasi</a>.
            </label>
          </div>

          <Button
            type="submit"
            class="w-full h-11 text-base font-bold shadow-sm shadow-primary/20"
            :disabled="loading"
          >
            <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
            {{ loading ? 'Mendaftarkan...' : 'Daftar Sekarang' }}
          </Button>
        </form>

        <div class="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
          Sudah punya akun?
          <NuxtLink
            to="/auth/login"
            class="text-primary font-bold hover:underline ml-1 transition-all"
          >
            Masuk
          </NuxtLink>
        </div>
      </div>
    </div>

    <div
      class="hidden lg:flex w-1/2 bg-white dark:bg-slate-900 items-center justify-center p-20 relative overflow-hidden"
    >
      <div class="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950/20 z-0"></div>
      
      <div class="relative z-10 w-full h-full flex flex-col items-center justify-center">
        <div class="relative">
          <div class="absolute -inset-4 bg-primary/10 rounded-full blur-2xl animate-pulse"></div>
          <img
            src="/images/login/computer-login.png"
            alt="Illustration"
            class="max-w-[85%] h-auto object-contain relative z-10 transition-all duration-700 hover:scale-105"
          />
        </div>
        
        <div class="mt-12 text-center max-w-md">
          <h2 class="text-2xl font-bold text-slate-800 dark:text-slate-100 italic">"Transformasi Digital HR"</h2>
          <p class="mt-4 text-slate-500 dark:text-slate-400 leading-relaxed">
            Daftarkan perusahaan Anda dan mulai kelola kehadiran, cuti, serta performa karyawan dengan lebih cerdas.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRegister } from './hooks/useRegister'
import { Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Checkbox } from '~/components/ui/checkbox'

definePageMeta({
  layout: false,
});

const showPassword = ref(false)
const form = reactive({
  name: "",
  email: "",
  password: "",
});

const { loading, error, handleRegister: apiRegister } = useRegister()

const handleRegister = async () => {
  await apiRegister({ ...form });
};
</script>

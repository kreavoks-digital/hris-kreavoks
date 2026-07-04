<template>
  <div class="min-h-screen flex bg-slate-50 dark:bg-slate-950 font-sans">
    <div class="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-10">
      
      <div class="mb-10 flex flex-col items-center">
        <img
          src="/images/logo/logo.png"
          alt="Kreavoks Logo"
          class="w-40 h-auto object-contain mb-8"
        />
      </div>

      <Card class="w-full max-w-md mx-auto border-slate-200/60 dark:border-slate-800/60 font-sans">
        <CardHeader>
          <CardTitle class="text-2xl font-semibold">Atur Ulang Password</CardTitle>
          <CardDescription class="mt-2">
            Silakan masukkan password baru untuk mengamankan akun Anda.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form @submit.prevent="submit" class="space-y-6">
            <div class="space-y-2">
              <Label for="password" class="text-sm font-medium">Password Baru</Label>
              <div class="relative">
                <Lock class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Password baru"
                  class="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <Eye v-if="!showPassword" class="h-4 w-4" />
                  <EyeOff v-else class="h-4 w-4" />
                </button>
              </div>
            </div>

            <div class="space-y-2">
              <Label for="confirmPassword" class="text-sm font-medium">Konfirmasi Password</Label>
              <div class="relative">
                <ShieldCheck class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="confirmPassword"
                  v-model="confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="Ulangi password baru"
                  class="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <Eye v-if="!showConfirmPassword" class="h-4 w-4" />
                  <EyeOff v-else class="h-4 w-4" />
                </button>
              </div>
              <p v-if="password && confirmPassword && password !== confirmPassword" class="text-destructive text-sm font-medium animate-in fade-in slide-in-from-top-1">
                Password tidak cocok. Periksa kembali inputan Anda.
              </p>
            </div>

            <Button
              type="submit"
              class="w-full text-base font-semibold"
              :disabled="loading || password !== confirmPassword || !password"
            >
              <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
              {{ loading ? 'Mengupdate...' : 'Update Password' }}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>

    <div class="hidden lg:flex w-1/2 bg-white dark:bg-slate-900 items-center justify-center p-20 relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950/20 z-0"></div>
      
      <div class="relative z-10 text-center max-w-md">
        <div class="mb-8 inline-flex p-4 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
          <RefreshCcw class="h-12 w-12 text-primary animate-spin-slow" />
        </div>
        <h2 class="text-2xl font-semibold text-slate-900 dark:text-slate-50">Satu Langkah Lagi</h2>
        <p class="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed">
          Amankan kembali akun Anda dengan password yang kuat dan unik untuk melindungi data penting perusahaan.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useResetPassword } from './hooks/useResetPassword'
import { Lock, Eye, EyeOff, Loader2, RefreshCcw, ShieldCheck } from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

definePageMeta({
  layout: false,
});

const route = useRoute();
const password = ref("");
const confirmPassword = ref("");
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const { loading, handleReset } = useResetPassword()

const submit = async () => {
  if (password.value !== confirmPassword.value) {
    return;
  }

  await handleReset({
    token: route.query.token,
    password: password.value, 
  })
};
</script>

<style scoped>
.animate-spin-slow {
  animation: spin 8s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
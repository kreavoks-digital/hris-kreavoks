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

      <Card class="w-full max-w-md mx-auto border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-3xl shadow-none">
        <CardHeader class="pb-4">
          <div class="flex justify-between items-start">
            <div>
              <CardTitle class="text-2xl font-semibold">Lupa Password</CardTitle>
              <CardDescription class="mt-2">
                Masukkan email Anda dan kami akan mengirimkan instruksi untuk reset password.
              </CardDescription>
            </div>
            <NuxtLink to="/auth/login" class="text-slate-400 hover:text-slate-600 transition p-1">
              <X class="h-5 w-5" />
            </NuxtLink>
          </div>
        </CardHeader>

        <CardContent>
          <form @submit.prevent="submit" class="space-y-6">
            <div class="space-y-2">
              <Label for="email" class="text-sm font-medium">Email</Label>
              <div class="relative">
                <Mail class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  v-model="email"
                  type="email"
                  placeholder="nama@perusahaan.com"
                  class="pl-10"
                  required
                />
              </div>
            </div>

             <div class="flex gap-3 p-4 rounded-3xl bg-kv-primary/5 dark:bg-kv-primary/10 border border-kv-primary/10 text-sm text-kv-primary dark:text-blue-300">
              <Info class="h-5 w-5 shrink-0" />
              <p>Link reset password akan dikirimkan ke email tersebut jika terdaftar di sistem kami.</p>
            </div>

             <Button
              type="submit"
              class="w-full text-base font-semibold"
              :disabled="loading"
            >
              <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
              {{ loading ? 'Mengirim...' : 'Kirim Link Reset' }}
            </Button>
          </form>
        </CardContent>

        <CardFooter class="pt-2 border-t border-slate-100 dark:border-slate-800 mt-6 flex justify-center">
          <p class="text-sm text-slate-600 dark:text-slate-400">
            Ingat password?
             <NuxtLink to="/auth/login" class="text-kv-primary font-semibold hover:underline ml-1">
              Kembali Masuk
            </NuxtLink>
          </p>
        </CardFooter>
      </Card>
    </div>

    <!-- Right Side: Decorative -->
    <div
      class="hidden lg:flex w-1/2 bg-white dark:bg-slate-900 items-center justify-center p-20 relative overflow-hidden"
    >
      <div class="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950/20 z-0"></div>
      
      <div class="relative z-10 text-center max-w-md">
        <div class="mb-8 inline-flex p-4 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
          <KeyRound class="h-12 w-12 text-primary" />
        </div>
        <h2 class="text-2xl font-semibold text-slate-900 dark:text-slate-50">Keamanan Utama Kami</h2>
        <p class="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed">
          Jangan khawatir, kami membantu Anda mengembalikan akses ke akun HRIS Anda dengan cepat dan aman.
        </p>
      </div>
      
      <!-- Decorative Elements -->
      <div class="absolute top-1/4 left-1/4 w-60 h-60 bg-blue-300/10 rounded-full blur-3xl"></div>
      <div class="absolute bottom-1/4 right-1/4 w-60 h-60 bg-indigo-300/10 rounded-full blur-3xl"></div>
    </div>
  </div>
</template>

<script setup>
import { useForgotPassword } from './hooks/useForgotPassword'
import { Mail, Loader2, Info, X, KeyRound } from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

definePageMeta({
  layout: false,
})

const email = ref("")
const { loading, handleSubmit } = useForgotPassword()

const submit = async () => {
  await handleSubmit(email.value)
}
</script>
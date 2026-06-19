<template>
  <div class="max-w-xl mx-auto py-10 px-4">
    <div class="flex items-center gap-3 mb-8">
      <div class="p-2 rounded-2xl bg-primary/10 text-primary">
        <KeyRound class="h-6 w-6" />
      </div>
      <h1 class="text-2xl font-semibold text-slate-900 dark:text-slate-50">Ganti Password</h1>
    </div>

    <Card class="border-slate-200/60 dark:border-slate-800/60">
      <CardHeader>
        <CardTitle>Keamanan Akun</CardTitle>
        <CardDescription>
          Pastikan password baru Anda kuat dan belum pernah digunakan sebelumnya.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form @submit.prevent="submit" class="space-y-6">
          <div class="space-y-2">
            <Label for="oldPassword" class="text-sm font-medium">Password Lama</Label>
            <div class="relative">
              <Lock class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="oldPassword"
                v-model="form.oldPassword"
                :type="showOldPassword ? 'text' : 'password'"
                placeholder="Password saat ini"
                class="pl-10 pr-10"
                required
              />
              <button
                type="button"
                @click="showOldPassword = !showOldPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <Eye v-if="!showOldPassword" class="h-4 w-4" />
                <EyeOff v-else class="h-4 w-4" />
              </button>
            </div>
          </div>

          <Separator class="my-4" />

          <div class="space-y-2">
            <Label for="newPassword" class="text-sm font-medium">Password Baru</Label>
            <div class="relative">
              <ShieldAlert class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="newPassword"
                v-model="form.newPassword"
                :type="showNewPassword ? 'text' : 'password'"
                placeholder="Minimal 8 karakter"
                class="pl-10 pr-10"
                required
              />
              <button
                type="button"
                @click="showNewPassword = !showNewPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <Eye v-if="!showNewPassword" class="h-4 w-4" />
                <EyeOff v-else class="h-4 w-4" />
              </button>
            </div>
          </div>

          <div class="space-y-2">
            <Label for="confirmPassword" class="text-sm font-medium">Konfirmasi Password Baru</Label>
            <div class="relative">
              <ShieldCheck class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="confirmPassword"
                v-model="form.confirmPassword"
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
            <p v-if="form.newPassword && form.confirmPassword && form.newPassword !== form.confirmPassword" class="text-destructive text-sm font-medium">
              Password tidak cocok.
            </p>
          </div>

          <Button
            type="submit"
            class="w-full font-semibold transition-all"
            :disabled="loading || form.newPassword !== form.confirmPassword || !form.newPassword"
          >
            <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
            {{ loading ? 'Menyimpan...' : 'Update Password Akun' }}
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { useChangePassword } from './hooks/useChangePassword'
import { KeyRound, Lock, Eye, EyeOff, Loader2, ShieldAlert, ShieldCheck } from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Separator } from '~/components/ui/separator'

definePageMeta({
  middleware: 'auth'
})

const { loading, error, handleChange } = useChangePassword()

const form = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const showOldPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const submit = async () => {
  if (form.newPassword !== form.confirmPassword) {
    return;
  }

  const success = await handleChange({
    oldPassword: form.oldPassword,
    newPassword: form.newPassword
  })

  if (success) {
    form.oldPassword = ''
    form.newPassword = ''
    form.confirmPassword = ''
  }
}
</script>
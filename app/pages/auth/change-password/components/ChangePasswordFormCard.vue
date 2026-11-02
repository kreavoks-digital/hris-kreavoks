<template>
  <Card class="border border-border bg-card/60 backdrop-blur-sm rounded-3xl overflow-hidden shadow-none">
    <CardHeader class="bg-muted/30 border-b border-border pb-4">
      <CardTitle class="text-base font-semibold text-foreground">Keamanan Akun</CardTitle>
      <CardDescription class="text-sm text-muted-foreground">
        Pastikan password baru Anda kuat, minimal 8 karakter, dan belum pernah digunakan sebelumnya.
      </CardDescription>
    </CardHeader>

    <CardContent class="p-6">
      <form @submit.prevent="emit('submit')" class="space-y-6">
        <!-- 1. Password Lama -->
        <div class="space-y-2">
          <Label for="oldPassword" class="text-sm font-medium text-foreground">
            Password Lama <span class="text-rose-500">*</span>
          </Label>
          <div class="relative">
            <Lock class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="oldPassword"
              v-model="form.oldPassword"
              :type="showOldPassword ? 'text' : 'password'"
              placeholder="Masukkan password saat ini"
              class="h-11 pl-10 pr-11 rounded-2xl border-border bg-background focus:ring-kv-primary text-sm font-medium"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="xs"
              :icon="true"
              class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground [&_svg]:!w-4 [&_svg]:!h-4"
              :title="showOldPassword ? 'Sembunyikan password' : 'Lihat password'"
              @click="emit('toggleShowOldPassword')"
            >
              <EyeOff v-if="showOldPassword" class="w-4 h-4" />
              <Eye v-else class="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Separator class="my-4 bg-border/60" />

        <!-- 2. Password Baru -->
        <div class="space-y-2">
          <Label for="newPassword" class="text-sm font-medium text-foreground">
            Password Baru <span class="text-rose-500">*</span>
          </Label>
          <div class="relative">
            <ShieldAlert class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="newPassword"
              v-model="form.newPassword"
              :type="showNewPassword ? 'text' : 'password'"
              placeholder="Minimal 8 karakter"
              class="h-11 pl-10 pr-11 rounded-2xl border-border bg-background focus:ring-kv-primary text-sm font-medium"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="xs"
              :icon="true"
              class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground [&_svg]:!w-4 [&_svg]:!h-4"
              :title="showNewPassword ? 'Sembunyikan password' : 'Lihat password'"
              @click="emit('toggleShowNewPassword')"
            >
              <EyeOff v-if="showNewPassword" class="w-4 h-4" />
              <Eye v-else class="w-4 h-4" />
            </Button>
          </div>
          <p v-if="form.newPassword && form.newPassword.length < 8" class="text-xs text-amber-500 font-medium">
            Password baru masih kurang dari 8 karakter.
          </p>
        </div>

        <!-- 3. Konfirmasi Password Baru -->
        <div class="space-y-2">
          <Label for="confirmPassword" class="text-sm font-medium text-foreground">
            Konfirmasi Password Baru <span class="text-rose-500">*</span>
          </Label>
          <div class="relative">
            <ShieldCheck class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="confirmPassword"
              v-model="form.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="Ulangi password baru"
              class="h-11 pl-10 pr-11 rounded-2xl border-border bg-background focus:ring-kv-primary text-sm font-medium"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="xs"
              :icon="true"
              class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground [&_svg]:!w-4 [&_svg]:!h-4"
              :title="showConfirmPassword ? 'Sembunyikan password' : 'Lihat password'"
              @click="emit('toggleShowConfirmPassword')"
            >
              <EyeOff v-if="showConfirmPassword" class="w-4 h-4" />
              <Eye v-else class="w-4 h-4" />
            </Button>
          </div>
          <p v-if="isPasswordMismatch" class="text-xs text-rose-500 font-medium">
            Konfirmasi password tidak cocok dengan password baru.
          </p>
        </div>

        <!-- Submit Button -->
        <div class="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            label="Update Password Akun"
            :loading="loading"
            :disabled="isSubmitDisabled"
            class="w-full justify-center"
          />
        </div>
      </form>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Lock, Eye, EyeOff, ShieldAlert, ShieldCheck } from 'lucide-vue-next'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '~/components/ui/card'
import { Button } from '@kreavoks/kreaui'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Separator } from '~/components/ui/separator'

defineProps<{
  form: {
    oldPassword: string
    newPassword: string
    confirmPassword: string
  }
  loading: boolean
  showOldPassword: boolean
  showNewPassword: boolean
  showConfirmPassword: boolean
  isPasswordMismatch: boolean
  isSubmitDisabled: boolean
}>()

const emit = defineEmits<{
  submit: []
  toggleShowOldPassword: []
  toggleShowNewPassword: []
  toggleShowConfirmPassword: []
}>()
</script>

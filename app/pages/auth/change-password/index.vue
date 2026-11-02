<template>
  <div class="max-w-xl mx-auto py-10 px-4 space-y-8 animate-in fade-in duration-300">
    <!-- Header -->
    <div class="flex items-center gap-3.5">
      <div class="w-11 h-11 rounded-2xl bg-kv-primary/10 text-kv-primary flex items-center justify-center shrink-0">
        <KeyRound class="h-5 w-5" />
      </div>
      <div>
        <h1 class="text-xl sm:text-2xl font-semibold text-foreground">Ganti Password</h1>
        <p class="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Perbarui kata sandi akun Anda untuk menjaga keamanan data.
        </p>
      </div>
    </div>

    <!-- Main Form Card -->
    <ChangePasswordFormCard
      :form="form"
      :loading="loading"
      :show-old-password="showOldPassword"
      :show-new-password="showNewPassword"
      :show-confirm-password="showConfirmPassword"
      :is-password-mismatch="isPasswordMismatch"
      :is-submit-disabled="isSubmitDisabled"
      @submit="handleSubmit"
      @toggle-show-old-password="showOldPassword = !showOldPassword"
      @toggle-show-new-password="showNewPassword = !showNewPassword"
      @toggle-show-confirm-password="showConfirmPassword = !showConfirmPassword"
    />
  </div>
</template>

<script setup lang="ts">
import { KeyRound } from 'lucide-vue-next'
import ChangePasswordFormCard from './components/ChangePasswordFormCard.vue'
import { useChangePassword } from './hooks/useChangePassword'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const {
  form,
  loading,
  showOldPassword,
  showNewPassword,
  showConfirmPassword,
  isPasswordMismatch,
  isSubmitDisabled,
  handleSubmit
} = useChangePassword()
</script>
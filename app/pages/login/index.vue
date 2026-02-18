<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
      
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800">Welcome Back</h1>
        <p class="text-gray-500 mt-1">Login ke dashboard Anda</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="space-y-5">
        <FormInput
          v-model="form.email"
          label="Email"
          type="email"
          placeholder="email@company.com"
        />

        <FormInput
          v-model="form.password"
          label="Password"
          type="password"
          placeholder="••••••••"
        />

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
        >
          <span v-if="!loading">Login</span>
          <span v-else>Processing...</span>
        </button>
      </form>

      <p class="text-center text-sm text-gray-500 mt-6">
        © {{ new Date().getFullYear() }} Kreavoks Project
      </p>

    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'

definePageMeta({
  layout: false
})

const form = reactive({
  email: '',
  password: ''
})

const loading = ref(false)

const handleLogin = async () => {
  loading.value = true

  try {
    const { data } = await $fetch('/api/auth/login', {
      method: 'POST',
      body: form
    })

    localStorage.setItem('token', data.token)

    navigateTo('/')
  } catch (err) {
    alert(err?.data?.message || 'Login gagal')
  } finally {
    loading.value = false
  }
}
</script>

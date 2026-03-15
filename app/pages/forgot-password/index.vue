<template>
  <div class="min-h-screen flex bg-white font-sans text-[#4F4F4F]">
    <div class="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-10">
      
      <div class="mb-10 text-center flex flex-col items-center">
        <img
          src="/images/logo/logo.png"
          alt="Kreavoks Logo"
          class="w-48 h-auto object-contain mb-4"
        />
      </div>

      <div class="w-full max-w-md mx-auto bg-white shadow-[0px_4px_20px_rgba(0,0,0,0.08)] rounded-2xl p-8 relative border border-gray-50">
        
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-2xl font-bold text-gray-900">Lupa Password</h1>
          <NuxtLink to="/login" class="text-gray-400 hover:text-gray-600 transition cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </NuxtLink>
        </div>

        <form @submit.prevent="submit">
          <div class="mb-5">
            <label class="block text-[15px] font-bold text-gray-800 mb-2">
              Email
            </label>
            <input
              v-model="email"
              type="email"
              placeholder="Masukkan Email"
              class="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition placeholder:text-gray-400 text-gray-900"
              required
            />
          </div>

          <div class="flex gap-2 text-[13px] text-gray-800 leading-relaxed mb-8">
            <span class="mt-0.5 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </span>
            <p>Silakan masukkan alamat email yang terdaftar untuk mengatur ulang kata sandi.</p>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-4 rounded-xl bg-[#3B82F6] text-white font-bold hover:bg-blue-700 transition shadow-md disabled:opacity-50 disabled:cursor-wait"
          >
            {{ loading ? 'Mengirim...' : 'Kirim Email' }}
          </button>
        </form>

        <p v-if="message" class="mt-4 text-center text-sm font-medium" :class="isError ? 'text-red-500' : 'text-green-600'">
          {{ message }}
        </p>

        <div class="text-center mt-10">
          <p class="text-[13px] text-gray-600">
            Ingat password?
            <NuxtLink to="/login" class="text-blue-500 font-bold hover:underline ml-1">
              Masuk
            </NuxtLink>
          </p>
        </div>
      </div>
    </div>

    <div class="hidden lg:flex w-1/2 bg-white items-center justify-center p-20 overflow-hidden">
      <div class="relative w-full h-full flex items-center justify-center">
        <img
          src="/images/login/computer-login.png" 
          alt="Illustration"
          class="max-w-[90%] max-h-[80%] w-auto h-auto object-contain transition-all duration-700 hover:scale-105"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

definePageMeta({
  layout: false,
})

const email = ref("")
const message = ref("")
const loading = ref(false)
const isError = ref(false)

const submit = async () => {
  loading.value = true
  message.value = ""
  isError.value = false
  
  try {
    const res = await $fetch("http://localhost:3001/api/v1/auth/forgot-password", {
      method: "POST",
      body: { email: email.value }
    })

    message.value = res.message || "Link reset password berhasil dikirim. Cek kotak masuk emailmu."
  } catch (error) {
    isError.value = true
    message.value = error?.data?.message || "Gagal mengirim link reset password."
  } finally {
    loading.value = false
  }
}
</script>
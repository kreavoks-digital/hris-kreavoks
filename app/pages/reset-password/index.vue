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
        
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Buat Password Baru</h1>
        <p class="text-sm text-gray-500 mb-8">Silakan masukkan password baru untuk akun kamu.</p>

        <form @submit.prevent="submit" class="space-y-5">
          
          <div class="relative">
            <label class="block text-sm font-bold text-gray-700 mb-2">Password Baru</label>
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Masukkan password baru"
                class="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition placeholder:text-gray-300"
                required
                minlength="6"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition"
              >
                <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" y1="2" x2="22" y2="22"></line></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              </button>
            </div>
          </div>

          <div class="relative">
            <label class="block text-sm font-bold text-gray-700 mb-2">Konfirmasi Password</label>
            <div class="relative">
              <input
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="Ulangi password baru"
                class="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition placeholder:text-gray-300"
                required
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition"
              >
                <svg v-if="!showConfirmPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" y1="2" x2="22" y2="22"></line></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              </button>
            </div>
            <p v-if="password && confirmPassword && password !== confirmPassword" class="text-red-500 text-xs mt-1">
              Password tidak cocok.
            </p>
          </div>

          <div class="pt-2">
            <button
              type="submit"
              :disabled="loading || (password !== confirmPassword)"
              class="w-full py-4 rounded-xl bg-[#3B82F6] text-white font-bold hover:bg-blue-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ loading ? "Menyimpan..." : "Reset Password" }}
            </button>
          </div>
        </form>
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
import { ref } from "vue";

definePageMeta({
  layout: false,
});

const route = useRoute();
const password = ref("");
const confirmPassword = ref("");
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const loading = ref(false);

const submit = async () => {
  if (password.value !== confirmPassword.value) {
    alert("Password dan konfirmasi password tidak sama!");
    return;
  }

  loading.value = true;
  try {
    await $fetch("http://localhost:3001/api/v1/auth/reset-password", {
      method: "POST",
      body: {
        token: route.query.token,
        password: password.value, 
      },
    });

    alert("Password berhasil diubah! Silakan login.");
    await navigateTo("/login");
  } catch (error) {
    alert(error?.data?.message || "Terjadi kesalahan saat mereset password.");
  } finally {
    loading.value = false;
  }
};
</script>
<template>
  <div class="min-h-screen flex bg-white font-sans text-[#4F4F4F]">
    <div
      class="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-10"
    >
      <div class="mb-10 text-center flex flex-col items-center">
        <img
          src="/images/logo/logo.png"
          alt="Kreavoks Logo"
          class="w-48 h-auto object-contain mb-4"
        />
        <p class="text-gray-500 text-sm leading-relaxed max-w-[340px] mx-auto">
          Login untuk kelola tugas harian lebih mudah, efisien, dan mendukung
          produktivitas kerjamu setiap hari.
        </p>
      </div>

      <form
        @submit.prevent="handleLogin"
        class="space-y-5 w-full max-w-md mx-auto"
      >
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-2"
            >Email</label
          >
          <input
            v-model="form.email"
            type="email"
            placeholder="Masukkan Email"
            class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition placeholder:text-gray-300"
          />
        </div>

        <div class="relative">
          <label class="block text-sm font-bold text-gray-700 mb-2"
            >Password</label
          >
          <div class="relative">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Masukkan Password"
              class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition placeholder:text-gray-300"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-600 transition"
            >
              <svg
                v-if="!showPassword"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                <path
                  d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"
                ></path>
                <path
                  d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"
                ></path>
                <line x1="2" y1="2" x2="22" y2="22"></line>
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          </div>
          <div class="text-right mt-2">
            <NuxtLink
              to="/forgot-password"
              class="text-[11px] font-bold text-blue-500 hover:underline"
            >
              Lupa Password ?
            </NuxtLink>
          </div>
        </div>

        <div class="pt-4">
          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3.5 rounded-lg bg-[#3B82F6] text-white font-bold hover:bg-blue-700 transition shadow-md disabled:opacity-50"
          >
            {{ loading ? "Memproses..." : "Masuk ke Akun" }}
          </button>
        </div>
      </form>

      <p class="text-center text-[13px] text-gray-600 mt-10">
        Belum punya akun?
        <NuxtLink
          to="/register"
          class="text-blue-500 font-bold hover:underline ml-1"
          >Daftar</NuxtLink
        >
      </p>
    </div>

    <div
      class="hidden lg:flex w-1/2 bg-white items-center justify-center p-20 overflow-hidden"
    >
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
import { reactive, ref } from "vue";

definePageMeta({
  layout: false,
});

const form = reactive({
  email: "",
  password: "",
});

const loading = ref(false);
const showPassword = ref(false);

const { setToken, fetchUser } = useAuth()

const handleLogin = async () => {
  loading.value = true
  try {
    const res = await $fetch("http://localhost:3001/api/v1/auth/login", {
      method: "POST",
      body: {
        email: form.email,
        password: form.password,
      },
    })

    if (res.success) {
      setToken(res.data.token)
      await fetchUser()

      await navigateTo("/dashboard")
    }
  } catch (err) {
    alert(err?.data?.message || "Login gagal")
  } finally {
    loading.value = false
  }
}

</script>

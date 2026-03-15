<template>
  <div class="min-h-screen flex bg-white font-sans">
    <div
      class="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24"
    >
      <div class="mb-10 text-center flex flex-col items-center">
        <img
          src="/images/logo/logo.png"
          alt="Kreavoks Logo"
          class="w-48 h-auto object-contain mb-6"
        />

        <p class="text-gray-500 text-sm leading-relaxed max-w-[320px] mx-auto">
          Login untuk kelola tugas harian lebih mudah, efisien, dan mendukung
          produktivitas kerjamu setiap hari.
        </p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2"
            >Email</label
          >
          <input
            v-model="form.email"
            type="email"
            placeholder="Masukkan Email"
            class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>

        <div class="relative">
          <div class="flex justify-between mb-2">
            <label class="text-sm font-semibold text-gray-700">Password</label>
          </div>
          <div class="relative">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500"
            >
              <span v-if="showPassword">👁️</span>
              <span v-else>🙈</span>
            </button>
          </div>
          <div class="text-right mt-2">
            <NuxtLink
              to="/forgot-password"
              class="text-xs font-semibold text-blue-500 hover:underline"
            >
              Lupa Password?
            </NuxtLink>
          </div>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:opacity-50"
        >
          {{ loading ? "Memproses..." : "Masuk ke Akun" }}
        </button>
      </form>

      <p class="text-center text-sm text-gray-600 mt-8">
        Belum punya akun?
        <NuxtLink to="/register" class="text-blue-500 font-bold hover:underline"
          >Daftar</NuxtLink
        >
      </p>
    </div>

    <div class="hidden lg:flex w-1/2 bg-white items-center justify-center p-12">
      <img
        src="/images/login/computer-login.png"
        alt="Illustration"
        class="max-w-full h-auto object-contain"
      />
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

const handleLogin = async () => {
  loading.value = true;
  try {
    const res = await $fetch("http://localhost:3001/api/v1/auth/login", {
      method: "POST",
      body: {
        email: form.email,
        password: form.password,
      },
    });

    if (res.success) {
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      await navigateTo("/");
    }
  } catch (err) {
    alert(err?.data?.message || "Login gagal");
  } finally {
    loading.value = false;
  }
};
</script>

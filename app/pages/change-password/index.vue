<template>
  <div class="max-w-xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">Ganti Password</h1>

    <form @submit.prevent="submit" class="bg-white p-6 rounded-xl shadow space-y-5">
      <FormInput label="Password Lama" type="password" v-model="form.oldPassword" />
      <FormInput label="Password Baru" type="password" v-model="form.newPassword" />
      <FormInput label="Konfirmasi Password Baru" type="password" v-model="form.confirmPassword" />

      <button
        class="bg-primary-600 text-white px-5 py-2 rounded-xl hover:bg-primary-700"
        :disabled="loading"
      >
        <span v-if="!loading">Simpan</span>
        <span v-else>Processing...</span>
      </button>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'

definePageMeta({
  middleware: 'auth'
})

const loading = ref(false)

const form = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const submit = async () => {
  if (form.newPassword !== form.confirmPassword) {
    return alert('Konfirmasi password tidak cocok')
  }

  loading.value = true

  try {
    const { token } = useAuth()

    await $fetch('http://localhost:3001/api/v1/auth/change-password', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.value}`
      },
      body: {
        oldPassword: form.oldPassword,
        newPassword: form.newPassword
      }
    })

    alert('Password berhasil diubah')

    form.oldPassword = ''
    form.newPassword = ''
    form.confirmPassword = ''
  } catch (err) {
    alert(err?.data?.message || 'Gagal mengubah password')
  } finally {
    loading.value = false
  }
}
</script>
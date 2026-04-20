<template>
  <div class="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <!-- Header Section -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <Button variant="ghost" size="icon" @click="navigateTo('/karyawan')" class="rounded-full h-10 w-10">
          <ArrowLeft class="h-5 w-5" />
        </Button>
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Tambah Karyawan</h1>
          <p class="text-slate-500 text-sm">Lengkapi formulir di bawah untuk mendaftarkan karyawan baru.</p>
        </div>
      </div>
    </div>

    <form @submit.prevent="submitForm" class="space-y-8">
      <!-- Data Pribadi -->
      <Card class="border-none shadow-md overflow-hidden bg-white/50 backdrop-blur-sm">
        <CardHeader class="bg-slate-50/50 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <UserCircle class="h-5 w-5 text-primary" />
            <CardTitle class="text-lg">Data Pribadi</CardTitle>
          </div>
          <CardDescription>Informasi identitas dan kontak personil karyawan.</CardDescription>
        </CardHeader>
        <CardContent class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <Label for="nik">NIK (Nomor Induk Karyawan)</Label>
              <Input id="nik" v-model="formData.nik" required placeholder="Contoh: 2024001" />
            </div>
            <div class="space-y-2">
              <Label for="name">Nama Lengkap</Label>
              <Input id="name" v-model="formData.name" required placeholder="Nama lengkap sesuai KTP" />
            </div>
            <div class="space-y-2">
              <Label for="email">Alamat Email</Label>
              <Input id="email" v-model="formData.email" type="email" required placeholder="email@kreavoks.com" />
            </div>
            <div class="space-y-2">
              <Label for="phone">No. Telepon / WhatsApp</Label>
              <Input id="phone" v-model="formData.phone" required placeholder="08xxxxxxxxxx" />
            </div>
            <div class="space-y-2">
              <Label for="birthDate">Tanggal Lahir</Label>
              <Input id="birthDate" v-model="formData.birthDate" type="date" required />
            </div>
            <div class="space-y-2 md:col-span-2">
              <Label for="address">Alamat Domisili</Label>
              <Input id="address" v-model="formData.address" required placeholder="Alamat lengkap saat ini" />
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Data Pekerjaan -->
      <Card class="border-none shadow-md overflow-hidden bg-white/50 backdrop-blur-sm">
        <CardHeader class="bg-slate-50/50 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <Briefcase class="h-5 w-5 text-primary" />
            <CardTitle class="text-lg">Data Pekerjaan</CardTitle>
          </div>
          <CardDescription>Detail penempatan departemen dan status kepegawaian.</CardDescription>
        </CardHeader>
        <CardContent class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <Label for="department">Departemen</Label>
              <Select v-model="formData.department">
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Departemen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="dept in departments" :key="dept.value" :value="dept.value">
                    {{ dept.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label for="position">Jabatan / Posisi</Label>
              <Input id="position" v-model="formData.position" required placeholder="Jabatan spesifik" />
            </div>
            <div class="space-y-2">
              <Label for="joinDate">Tanggal Bergabung</Label>
              <Input id="joinDate" v-model="formData.joinDate" type="date" required />
            </div>
            <div class="space-y-2">
              <Label for="employmentType">Jenis Kontrak</Label>
              <Select v-model="formData.employmentType">
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Jenis Kontrak" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="type in employmentTypes" :key="type.value" :value="type.value">
                    {{ type.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label for="salary">Gaji Pokok (IDR)</Label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">Rp</span>
                <Input id="salary" v-model="formData.salary" type="number" required class="pl-10" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Form Actions -->
      <div class="flex items-center justify-end gap-4 p-4">
        <Button type="button" variant="ghost" @click="navigateTo('/karyawan')">Batal</Button>
        <Button type="submit" class="w-full sm:w-48 gap-2 shadow-lg shadow-primary/20" :disabled="loading">
          <Save v-if="!loading" class="h-4 w-4" />
          <RefreshCw v-else class="h-4 w-4 animate-spin" />
          {{ loading ? "Menyimpan..." : "Simpan Data" }}
        </Button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { 
  ArrowLeft, 
  Save, 
  RefreshCw, 
  UserCircle, 
  Briefcase 
} from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: "default",
  middleware: "auth",
});

const loading = ref(false);

const formData = ref({
  nik: "",
  name: "",
  email: "",
  phone: "",
  birthDate: "",
  address: "",
  department: "",
  position: "",
  joinDate: "",
  employmentType: "",
  salary: 0,
});

const departments = [
  { value: "IT", label: "Information Technology" },
  { value: "HR", label: "Human Resources" },
  { value: "Finance", label: "Finance & Accounting" },
  { value: "Marketing", label: "Marketing & Sales" },
  { value: "Operations", label: "Operations" },
];

const employmentTypes = [
  { value: "permanent", label: "Karyawan Tetap" },
  { value: "contract", label: "Karyawan Kontrak" },
  { value: "intern", label: "Magang / Internship" },
];

const submitForm = async () => {
  if (!formData.value.department || !formData.value.employmentType) {
    toast.warning("Peringatan", {
      description: "Mohon pilih departemen dan jenis kontrak"
    })
    return
  }

  loading.value = true;
  try {
    await $fetch("/api/employees", {
      method: "POST",
      body: formData.value,
    });
    toast.success("Berhasil", {
      description: `Karyawan ${formData.value.name} berhasil ditambahkan!`
    });
    navigateTo("/karyawan");
  } catch (error) {
    console.error("Error adding employee:", error);
    toast.error("Gagal", {
      description: "Terjadi kesalahan saat menambahkan karyawan"
    });
  } finally {
    loading.value = false;
  }
};
</script>

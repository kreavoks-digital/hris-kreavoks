<template>
  <div class="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <!-- Header Section -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <Button variant="ghost" size="icon" @click="navigateTo('/employee')" class="rounded-full w-10 text-slate-400 hover:text-kv-black hover:bg-slate-100">
          <ArrowLeft class="h-5 w-5" />
        </Button>
        <div>
          <h1 class="text-2xl font-semibold text-kv-black">Tambah Karyawan</h1>
          <p class="text-slate-400 text-sm">Lengkapi formulir di bawah untuk mendaftarkan karyawan baru.</p>
        </div>
      </div>
    </div>

    <form @submit.prevent="submitForm" class="space-y-8">
      <!-- Data Pribadi -->
      <Card class="border border-slate-100 overflow-hidden bg-white/50 backdrop-blur-sm rounded-3xl">
        <CardHeader class="bg-slate-50/50 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <UserCircle class="h-5 w-5 text-kv-primary" />
            <CardTitle class="text-lg font-semibold text-kv-black">Data Pribadi</CardTitle>
          </div>
          <CardDescription class="text-slate-400">Informasi identitas dan kontak personil karyawan.</CardDescription>
        </CardHeader>
        <CardContent class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <Label for="npk" class="text-slate-600 font-medium ml-1">NPK (Nomor Pegawai Kreavoks)</Label>
              <Input id="npk" v-model="formData.npk" required placeholder="Contoh: KV-0016" class="border-slate-200 focus:ring-kv-primary" />
            </div>
            <div class="space-y-2">
              <Label for="name" class="text-slate-600 font-medium ml-1">Nama Lengkap</Label>
              <Input id="name" v-model="formData.name" required placeholder="Nama lengkap sesuai KTP" class="border-slate-200 focus:ring-kv-primary" />
            </div>
            <div class="space-y-2">
              <Label for="email" class="text-slate-600 font-medium ml-1">Alamat Email</Label>
              <Input id="email" v-model="formData.email" type="email" required placeholder="email@kreavoks.com" class="border-slate-200 focus:ring-kv-primary" />
            </div>
            <div class="space-y-2">
              <Label for="phone" class="text-slate-600 font-medium ml-1">No. Telepon / WhatsApp</Label>
              <Input id="phone" v-model="formData.phone" required placeholder="08xxxxxxxxxx" class="border-slate-200 focus:ring-kv-primary" />
            </div>
            <div class="space-y-2">
              <Label for="birthDate" class="text-slate-600 font-medium ml-1">Tanggal Lahir</Label>
              <Input id="birthDate" v-model="formData.birthDate" type="date" required class="border-slate-200 focus:ring-kv-primary" />
            </div>
            <div class="space-y-2 md:col-span-2">
              <Label for="address" class="text-slate-600 font-medium ml-1">Alamat Domisili</Label>
              <Input id="address" v-model="formData.address" required placeholder="Alamat lengkap saat ini" class="border-slate-200 focus:ring-kv-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Data Pekerjaan -->
      <Card class="border border-slate-100 overflow-hidden bg-white/50 backdrop-blur-sm rounded-3xl">
        <CardHeader class="bg-slate-50/50 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <Briefcase class="h-5 w-5 text-kv-primary" />
            <CardTitle class="text-lg font-semibold text-kv-black">Data Pekerjaan</CardTitle>
          </div>
          <CardDescription class="text-slate-400">Detail penempatan departemen dan status kepegawaian.</CardDescription>
        </CardHeader>
        <CardContent class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <Label for="department" class="text-slate-600 font-medium ml-1">Departemen</Label>
              <Select v-model="formData.department">
                <SelectTrigger class="rounded-3xl h-11 border-slate-200 focus:ring-kv-primary">
                  <SelectValue placeholder="Pilih Departemen" />
                </SelectTrigger>
                <SelectContent class="rounded-3xl">
                  <SelectItem v-for="dept in departments" :key="dept.value" :value="dept.value">
                    {{ dept.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label for="position" class="text-slate-600 font-medium ml-1">Jabatan / Posisi</Label>
              <Select v-if="availablePositions.length > 0" v-model="formData.position">
                <SelectTrigger class="rounded-3xl h-11 border-slate-200 focus:ring-kv-primary">
                  <SelectValue placeholder="Pilih Posisi" />
                </SelectTrigger>
                <SelectContent class="rounded-3xl">
                  <SelectItem v-for="pos in availablePositions" :key="pos.value" :value="pos.value">
                    {{ pos.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <Input v-else id="position" v-model="formData.position" required placeholder="Jabatan spesifik" class="border-slate-200 focus:ring-kv-primary rounded-3xl h-11" />
            </div>
            <div class="space-y-2">
              <Label for="joinDate" class="text-slate-600 font-medium ml-1">Tanggal Bergabung</Label>
              <Input id="joinDate" v-model="formData.joinDate" type="date" required class="border-slate-200 focus:ring-kv-primary" />
            </div>
            <div class="space-y-2">
              <Label for="employmentType" class="text-slate-600 font-medium ml-1">Jenis Kontrak</Label>
              <Select v-model="formData.employmentType">
                <SelectTrigger class="rounded-3xl h-11 border-slate-200 focus:ring-kv-primary">
                  <SelectValue placeholder="Pilih Jenis Kontrak" />
                </SelectTrigger>
                <SelectContent class="rounded-3xl">
                  <SelectItem v-for="type in employmentTypes" :key="type.value" :value="type.value">
                    {{ type.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label for="salary" class="text-slate-600 font-medium ml-1">Gaji Pokok (IDR)</Label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">Rp</span>
                <Input id="salary" v-model="formData.salary" type="number" required class="pl-12 border-slate-200 focus:ring-kv-primary" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Form Actions -->
      <div class="flex items-center justify-end gap-4 p-4">
        <Button type="button" variant="ghost" class="px-6 text-slate-500 hover:text-kv-black" @click="navigateTo('/employee')">Batal</Button>
        <Button type="submit" class="w-full sm:w-48 gap-2 bg-kv-primary hover:bg-kv-primary/90 text-white border-none" :disabled="loading">
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
  middleware: ["auth", "admin"],
});

const loading = ref(false);

const formData = ref({
  npk: "",
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

const departmentGroups: Record<string, string[]> = {
  "Kreavoks Development Team (KDT)": ["UI/UX Designer", "Web Developer", "Wordpress Developer", "Project Manager"],
  "Kreavoks Creative Team (KCT)": ["Design Graphis", "Content Creator", "Sosmed Specialist", "Video Editor"],
  "Kreavoks Management Team (KMT)": ["HR/HC"],
  "Kreavoks Collaboration Mentor (KCM)": ["Mentor"],
  "Lainnya": []
};

const departments = Object.keys(departmentGroups).map(k => ({ value: k, label: k }));

const availablePositions = computed(() => {
  if (!formData.value.department) return [];
  return departmentGroups[formData.value.department]?.map(p => ({ value: p, label: p })) ?? [];
});

watch(() => formData.value.department, () => {
  formData.value.position = ""; // Reset position when department changes
});

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
    const api = useApi();
    await api("/users", {
      method: "POST",
      body: formData.value,
    });
    toast.success("Berhasil", {
      description: `Karyawan ${formData.value.name} berhasil ditambahkan!`
    });
    navigateTo("/employee");
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

<template>
  <div class="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <!-- Header Section -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <Button variant="ghost" size="icon" @click="navigateTo('/employee')" class="rounded-full w-10 text-slate-400 hover:text-kv-black hover:bg-slate-100">
          <ArrowLeft class="h-5 w-5" />
        </Button>
        <div>
          <h1 class="text-2xl font-semibold text-kv-black">Edit Karyawan</h1>
          <p class="text-slate-400 text-sm">Perbarui informasi dan data pekerjaan karyawan.</p>
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
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="npk" class="text-slate-600 font-medium ml-1">NPK (Nomor Pegawai Kreavoks)</Label>
              <Input id="npk" v-model="formData.npk" required placeholder="Contoh: KV-0016" class="border-slate-200 focus:ring-kv-primary" />
            </div>
            <div class="space-y-2">
              <Label for="name" class="text-slate-600 font-medium ml-1">Nama Lengkap</Label>
              <Input id="name" v-model="formData.fullName" required placeholder="Nama lengkap sesuai KTP" class="border-slate-200 focus:ring-kv-primary" />
            </div>
            <div class="space-y-2">
              <Label for="email" class="text-slate-600 font-medium ml-1">Alamat Email</Label>
              <Input id="email" v-model="formData.email" type="email" required placeholder="email@kreavoks.com" class="border-slate-200 focus:ring-kv-primary" />
            </div>
            <div class="space-y-2">
              <Label for="phone" class="text-slate-600 font-medium ml-1">No. Telepon / WhatsApp</Label>
              <Input id="phone" v-model="formData.phone" required placeholder="08xxxxxxxxxx" class="border-slate-200 focus:ring-kv-primary" />
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
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Input id="position" v-model="formData.position" required placeholder="Jabatan spesifik" class="border-slate-200 focus:ring-kv-primary" />
            </div>
            <div class="space-y-2">
              <Label for="role" class="text-slate-600 font-medium ml-1">Role Sistem</Label>
              <Select v-model="formData.role">
                <SelectTrigger class="rounded-3xl h-11 border-slate-200 focus:ring-kv-primary">
                  <SelectValue placeholder="Pilih Role" />
                </SelectTrigger>
                <SelectContent class="rounded-3xl">
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="MENTOR">Mentor / Karyawan</SelectItem>
                  <SelectItem value="INTERN">Intern / Magang</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Masa Kerja & Kontrak -->
      <Card class="border border-slate-100 overflow-hidden bg-white/50 backdrop-blur-sm rounded-3xl">
        <CardHeader class="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <div class="flex items-center gap-2">
              <CalendarIconBase class="h-5 w-5 text-kv-primary" />
              <CardTitle class="text-lg font-semibold text-kv-black">Masa Kerja & Kontrak</CardTitle>
            </div>
            <CardDescription class="text-slate-400 mt-1">Aktifkan lifetime jika karyawan tetap, atau atur periode untuk magang/kontrak.</CardDescription>
          </div>
          <div class="flex items-center gap-3">
            <Label for="lifetime" class="text-sm font-medium text-slate-600">Lifetime</Label>
            <Switch id="lifetime" v-model="isLifetime" />
          </div>
        </CardHeader>
        <CardContent class="p-6" v-if="!isLifetime">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="space-y-2">
              <Label for="startDate" class="text-slate-600 font-medium ml-1">Tanggal Mulai (Start Date)</Label>
              <Popover>
                <PopoverTrigger as-child>
                  <Button
                    variant="outline"
                    :class="cn('w-full justify-start text-left font-normal border-slate-200 rounded-3xl h-11 focus:ring-kv-primary', !formData.startDate && 'text-muted-foreground')"
                  >
                    <CalendarIcon class="mr-2 h-4 w-4 text-slate-500" />
                    {{ formData.startDate ? format(new Date(formData.startDate), 'dd MMMM yyyy', { locale: idLocale }) : 'Pilih Tanggal' }}
                  </Button>
                </PopoverTrigger>
                <PopoverContent class="w-auto p-0 rounded-2xl shadow-sm border-border" align="start">
                  <Calendar v-model="startDateObj" initial-focus />
                </PopoverContent>
              </Popover>
            </div>
            <div class="space-y-2">
              <Label for="endDate" class="text-slate-600 font-medium ml-1">Tanggal Selesai (End Date)</Label>
              <Popover>
                <PopoverTrigger as-child>
                  <Button
                    variant="outline"
                    :class="cn('w-full justify-start text-left font-normal border-slate-200 rounded-3xl h-11 focus:ring-kv-primary', !formData.endDate && 'text-muted-foreground')"
                  >
                    <CalendarIcon class="mr-2 h-4 w-4 text-slate-500" />
                    {{ formData.endDate ? format(new Date(formData.endDate), 'dd MMMM yyyy', { locale: idLocale }) : 'Pilih Tanggal' }}
                  </Button>
                </PopoverTrigger>
                <PopoverContent class="w-auto p-0 rounded-2xl shadow-sm border-border" align="start">
                  <Calendar v-model="endDateObj" initial-focus />
                </PopoverContent>
              </Popover>
            </div>
            <div class="space-y-2">
              <Label for="certificateStatus" class="text-slate-600 font-medium ml-1">Status Sertifikat</Label>
              <Select v-model="formData.certificateStatus">
                <SelectTrigger class="rounded-3xl h-11 border-slate-200 focus:ring-kv-primary">
                  <SelectValue placeholder="Pilih Status" />
                </SelectTrigger>
                <SelectContent class="rounded-3xl">
                  <SelectItem value="NONE">Belum / Tidak Ada</SelectItem>
                  <SelectItem value="PROSES">Sedang Proses</SelectItem>
                  <SelectItem value="SELESAI">Selesai / Terbit</SelectItem>
                </SelectContent>
              </Select>
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
          {{ loading ? "Menyimpan..." : "Simpan Perubahan" }}
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
  Briefcase,
  Calendar as CalendarIconBase,
  CalendarIcon
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
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { Calendar } from '~/components/ui/calendar'
import { Switch } from '~/components/ui/switch'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { parseDate } from '@internationalized/date'
import { cn } from '@/lib/utils'
import { toast } from 'vue-sonner'
import { employeeApi } from '../api/employee.api'

definePageMeta({
  layout: "default",
  middleware: ["auth", "admin"],
});

const route = useRoute();
const loading = ref(false);

const formData = ref({
  npk: "",
  fullName: "",
  email: "",
  phone: "",
  department: "",
  position: "",
  role: "MENTOR",
  startDate: "",
  endDate: "",
  certificateStatus: "NONE",
});

const isLifetime = ref(true);

watch(isLifetime, (val) => {
  if (val) {
    formData.value.startDate = "9999-12-31";
    formData.value.endDate = "9999-12-31";
    formData.value.certificateStatus = "NONE";
  } else {
    if (formData.value.startDate === "9999-12-31") {
      formData.value.startDate = "";
      formData.value.endDate = "";
    }
  }
});

const startDateObj = computed({
  get: () => formData.value.startDate ? parseDate(formData.value.startDate) : undefined,
  set: (val: any) => {
    formData.value.startDate = val ? val.toString() : ""
  }
})

const endDateObj = computed({
  get: () => formData.value.endDate ? parseDate(formData.value.endDate) : undefined,
  set: (val: any) => {
    formData.value.endDate = val ? val.toString() : ""
  }
})

const departments = [
  { value: "IT", label: "Information Technology" },
  { value: "HR", label: "Human Resources" },
  { value: "Finance", label: "Finance & Accounting" },
  { value: "Marketing", label: "Marketing & Sales" },
  { value: "Operations", label: "Operations" },
  { value: "Management", label: "Management" },
  { value: "-", label: "Lainnya" },
];

onMounted(async () => {
  const id = route.params.id as string;
  if (id) {
    loading.value = true;
    try {
      const response = await employeeApi.getEmployees();
      if (response.success) {
        const emp = response.data.find(e => e.id === id);
        if (emp) {
          formData.value = {
            npk: emp.npk || "",
            fullName: emp.name || "",
            email: emp.email || "",
            phone: emp.phone !== "-" ? emp.phone : "",
            department: emp.department || "-",
            position: emp.position || "",
            role: emp.role || "MENTOR",
            startDate: emp.startDate || "",
            endDate: emp.endDate || "",
            certificateStatus: emp.certificateStatus || "NONE",
          };
          
          isLifetime.value = !emp.startDate || emp.startDate.startsWith("9999");
          if (isLifetime.value) {
            formData.value.startDate = "9999-12-31";
            formData.value.endDate = "9999-12-31";
            formData.value.certificateStatus = "NONE";
          }
        } else {
          toast.error("Karyawan tidak ditemukan");
          navigateTo("/employee");
        }
      }
    } catch (error) {
      console.error("Error fetching employee:", error);
    } finally {
      loading.value = false;
    }
  }
});

const submitForm = async () => {
  loading.value = true;
  try {
    const api = useApi();
    await api(`/users/${route.params.id}`, {
      method: "PUT",
      body: formData.value,
    });
    toast.success("Berhasil", {
      description: `Data Karyawan berhasil diperbarui!`
    });
    navigateTo("/employee");
  } catch (error) {
    console.error("Error updating employee:", error);
    toast.error("Gagal", {
      description: "Terjadi kesalahan saat memperbarui data karyawan"
    });
  } finally {
    loading.value = false;
  }
};
</script>

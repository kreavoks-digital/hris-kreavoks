<template>
  <div class="min-h-screen flex bg-slate-50 dark:bg-slate-950 font-sans">
    <div
      class="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-10 overflow-y-auto"
    >
      <div class="mb-6 flex flex-col items-center">
        <img
          src="/images/logo/logo.png"
          alt="Kreavoks Logo"
          class="w-36 h-auto object-contain mb-4"
        />
        <div class="text-center">
          <h1 class="text-2xl font-semibold text-slate-900 dark:text-slate-50">
            Buat Akun Baru
          </h1>
          <p class="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-[360px] mx-auto">
            Bergabunglah dengan Kreavoks HRIS untuk pengelolaan tim yang lebih baik.
          </p>
        </div>
      </div>

      <div class="w-full max-w-md mx-auto">
        <!-- Step indicator -->
        <div class="flex items-center justify-center gap-2 mb-6">
          <div
            v-for="s in 2"
            :key="s"
            class="flex items-center"
          >
            <div
              :class="[
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300',
                step >= s
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              ]"
            >
              <Check v-if="step > s" class="h-3.5 w-3.5" />
              <span v-else>{{ s }}</span>
            </div>
            <div
              v-if="s < 2"
              :class="[
                'w-12 h-0.5 mx-1 transition-all duration-300',
                step > s ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-800'
              ]"
            />
          </div>
        </div>
        <p class="text-center text-xs text-slate-500 dark:text-slate-400 mb-5">
          {{ step === 1 ? 'Langkah 1: Informasi Pribadi' : 'Langkah 2: Data Profesional & Akun' }}
        </p>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Step 1: Informasi Pribadi -->
          <template v-if="step === 1">
            <!-- Nama Lengkap -->
            <div class="space-y-1.5">
              <Label for="fullName" class="text-sm font-medium">Nama Lengkap <span class="text-red-500">*</span></Label>
              <div class="relative">
                <User class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="fullName"
                  v-model="form.fullName"
                  type="text"
                  placeholder="Masukkan nama lengkap Anda"
                  class="pl-10"
                  required
                />
              </div>
            </div>

            <!-- Email -->
            <div class="space-y-1.5">
              <Label for="email" class="text-sm font-medium">Email Perusahaan <span class="text-red-500">*</span></Label>
              <div class="relative">
                <Mail class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  v-model="form.email"
                  type="email"
                  placeholder="nama@perusahaan.com"
                  class="pl-10"
                  required
                />
              </div>
            </div>

            <!-- No. Telepon -->
            <div class="space-y-1.5">
              <Label for="phone" class="text-sm font-medium">No. Telepon</Label>
              <div class="relative">
                <Phone class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="phone"
                  v-model="form.phone"
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  class="pl-10"
                />
              </div>
            </div>

            <!-- Alamat -->
            <div class="space-y-1.5">
              <Label for="address" class="text-sm font-medium">Alamat</Label>
              <div class="relative">
                <MapPin class="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <textarea
                  id="address"
                  v-model="form.address"
                  placeholder="Masukkan alamat lengkap Anda"
                  rows="2"
                  class="w-full pl-10 pr-3 py-2 text-sm border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0 resize-none"
                />
              </div>
            </div>

            <Button
              type="button"
              class="w-full text-base font-semibold"
              @click="goToStep2"
            >
              Selanjutnya
              <ArrowRight class="ml-2 h-4 w-4" />
            </Button>
          </template>

          <!-- Step 2: Data Profesional & Akun -->
          <template v-else>
            <!-- Institusi/Universitas -->
            <div class="space-y-1.5">
              <Label for="institution" class="text-sm font-medium">Institusi / Universitas</Label>
              <div class="relative">
                <Building2 class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="institution"
                  v-model="form.institution"
                  type="text"
                  placeholder="Nama institusi atau universitas"
                  class="pl-10"
                />
              </div>
            </div>

            <!-- Departemen -->
            <div class="space-y-1.5">
              <Label for="department" class="text-sm font-medium">Departemen / Divisi</Label>
              <Select v-model="form.department">
                <SelectTrigger class="bg-background border-input w-full">
                  <SelectValue placeholder="Pilih Departemen" />
                </SelectTrigger>
                <SelectContent class="bg-background border-border">
                  <SelectItem value="Kreavoks Development Team (KDT)">Kreavoks Development Team (KDT)</SelectItem>
                  <SelectItem value="Kreavoks Creative Team (KCT)">Kreavoks Creative Team (KCT)</SelectItem>
                  <SelectItem value="Kreavoks Management Team (KMT)">Kreavoks Management Team (KMT)</SelectItem>
                  <SelectItem value="Kreavoks Collaboration Mentor (KCM)">Kreavoks Collaboration Mentor (KCM)</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- Posisi -->
            <div class="space-y-1.5">
              <Label for="position" class="text-sm font-medium">Posisi / Jabatan</Label>
              <Select v-model="form.position">
                <SelectTrigger class="bg-background border-input w-full">
                  <SelectValue placeholder="Pilih Posisi / Jabatan" />
                </SelectTrigger>
                <SelectContent class="bg-background border-border">
                  <SelectItem value="Desainer Grafis">Desainer Grafis</SelectItem>
                  <SelectItem value="Social Media Specialist">Social Media Specialist</SelectItem>
                  <SelectItem value="Content Creator">Content Creator</SelectItem>
                  <SelectItem value="Web Developer">Web Developer</SelectItem>
                  <SelectItem value="Project Manager">Project Manager</SelectItem>
                  <SelectItem value="UI/UX Designer">UI/UX Designer</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- Password -->
            <div class="space-y-1.5">
              <Label for="password" class="text-sm font-medium">Password <span class="text-red-500">*</span></Label>
              <div class="relative">
                <Lock class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Buat password minimal 8 karakter"
                  class="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  <Eye v-if="!showPassword" class="h-4 w-4" />
                  <EyeOff v-else class="h-4 w-4" />
                </button>
              </div>
              <p v-if="form.password && form.password.length < 8" class="text-xs text-red-500 mt-1">
                Password minimal 8 karakter
              </p>
            </div>

            <!-- Konfirmasi Password -->
            <div class="space-y-1.5">
              <Label for="confirmPassword" class="text-sm font-medium">Konfirmasi Password <span class="text-red-500">*</span></Label>
              <div class="relative">
                <Lock class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="confirmPassword"
                  v-model="form.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="Ulangi password Anda"
                  class="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  <Eye v-if="!showConfirmPassword" class="h-4 w-4" />
                  <EyeOff v-else class="h-4 w-4" />
                </button>
              </div>
              <p v-if="form.confirmPassword && form.password !== form.confirmPassword" class="text-xs text-red-500 mt-1">
                Password tidak cocok
              </p>
            </div>

            <!-- Terms -->
            <div class="flex items-start space-x-2 pt-1" @click.prevent="agreedToTerms = !agreedToTerms">
              <Checkbox 
                id="terms" 
                :checked="agreedToTerms" 
              />
              <label
                class="text-sm text-slate-500 leading-tight cursor-pointer select-none"
              >
                Saya setuju dengan <a href="#" class="text-kv-primary hover:underline" @click.stop>Ketentuan Layanan</a> dan <a href="#" class="text-kv-primary hover:underline" @click.stop>Kebijakan Privasi</a>.
              </label>
            </div>
            <!-- DEBUG: hapus setelah fix -->
            <p class="text-xs text-slate-400">agreedToTerms = {{ agreedToTerms }}</p>

            <!-- Info verifikasi -->
            <div class="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md">
              <Info class="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <p class="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                Setelah mendaftar, akun Anda perlu <strong>diverifikasi oleh Admin</strong> sebelum dapat digunakan untuk login.
              </p>
            </div>

            <div class="flex gap-2">
              <Button
                type="button"
                variant="outline"
                class="flex-1 font-semibold"
                @click="step = 1"
                :disabled="loading"
              >
                <ArrowLeft class="mr-2 h-4 w-4" />
                Kembali
              </Button>
              <Button
                type="submit"
                class="flex-1 text-base font-semibold"
                :disabled="loading || !agreedToTerms || form.password !== form.confirmPassword || form.password.length < 8"
              >
                <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
                {{ loading ? 'Mendaftarkan...' : 'Daftar Sekarang' }}
              </Button>
            </div>

            <!-- Validation Helper -->
            <div v-if="(!agreedToTerms || form.password !== form.confirmPassword || form.password.length < 8) && !loading" class="text-xs space-y-1 p-3 bg-slate-50 dark:bg-slate-900 rounded-md border border-slate-100 dark:border-slate-800">
              <p class="font-medium text-slate-700 dark:text-slate-300 mb-2">Tombol belum aktif karena:</p>
              <p v-if="form.password.length < 8" class="text-red-500 dark:text-red-400 flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-red-500"></span> Password minimal 8 karakter</p>
              <p v-if="form.password !== form.confirmPassword" class="text-red-500 dark:text-red-400 flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-red-500"></span> Konfirmasi password belum sama</p>
              <p v-if="!agreedToTerms" class="text-red-500 dark:text-red-400 flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-red-500"></span> Belum mencentang Syarat & Ketentuan</p>
            </div>
          </template>
        </form>

        <div class="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          Sudah punya akun?
          <NuxtLink
            to="/auth/login"
            class="text-primary font-semibold hover:underline ml-1 transition-all"
          >
            Masuk
          </NuxtLink>
        </div>
      </div>
    </div>

    <div
      class="hidden lg:flex w-1/2 bg-white dark:bg-slate-900 items-center justify-center p-20 relative overflow-hidden"
    >
      <div class="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950/20 z-0"></div>
      
      <div class="relative z-10 w-full h-full flex flex-col items-center justify-center">
        <div class="relative">
          <div class="absolute -inset-4 bg-primary/10 rounded-full blur-2xl animate-pulse"></div>
          <img
            src="/images/login/computer-login.png"
            alt="Illustration"
            class="max-w-[85%] h-auto object-contain relative z-10 transition-all duration-700"
          />
        </div>
        
        <div class="mt-12 text-center max-w-md">
          <h2 class="text-2xl font-semibold text-slate-800 dark:text-slate-100">"Transformasi Digital HR"</h2>
          <p class="mt-4 text-slate-500 dark:text-slate-400 leading-relaxed">
            Daftarkan diri Anda dan mulai kelola kehadiran, cuti, serta performa karyawan dengan lebih cerdas.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRegister } from './hooks/useRegister'
import {
  Mail, Lock, User, Eye, EyeOff, Loader2,
  Phone, MapPin, Building2, Layers, Briefcase,
  ArrowRight, ArrowLeft, Check, Info
} from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Checkbox } from '~/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'

definePageMeta({
  layout: false,
});

const step = ref(1)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const agreedToTerms = ref(false)

const form = reactive({
  fullName: '',
  email: '',
  phone: '',
  address: '',
  institution: '',
  department: '',
  position: '',
  password: '',
  confirmPassword: '',
})

const { loading, error, handleRegister: apiRegister } = useRegister()

const goToStep2 = () => {
  if (!form.fullName.trim()) {
    return
  }
  if (!form.email.trim()) {
    return
  }
  step.value = 2
}

const handleSubmit = async () => {
  if (form.password !== form.confirmPassword) return
  if (form.password.length < 8) return
  if (!agreedToTerms.value) return

  const payload = {
    fullName: form.fullName,
    email: form.email,
    phone: form.phone || undefined,
    address: form.address || undefined,
    institution: form.institution || undefined,
    department: form.department || undefined,
    position: form.position || undefined,
    password: form.password,
  }

  await apiRegister(payload)
}
</script>

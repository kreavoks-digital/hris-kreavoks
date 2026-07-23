<template>
  <div class="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <!-- Header Section -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <Button variant="ghost" size="icon" @click="navigateTo('/employee')" class="rounded-full w-10 text-muted-foreground hover:text-foreground hover:bg-accent">
          <ArrowLeft class="h-5 w-5" />
        </Button>
        <div>
          <h1 class="text-2xl font-semibold text-foreground">Review Pendaftaran Mentor</h1>
          <p class="text-muted-foreground text-sm">Tinjau data pendaftaran mentor dari Kreavoks Portal sebelum melakukan approval.</p>
        </div>
      </div>
    </div>

    <!-- Status Badge Banner -->
    <div v-if="formData.status !== 'PENDING'" class="p-4 rounded-xl flex items-center justify-between border" :class="{
      'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300': formData.status === 'APPROVED',
      'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300': formData.status === 'REJECTED'
    }">
      <div class="flex items-center gap-2">
        <CheckCircle2 v-if="formData.status === 'APPROVED'" class="h-5 w-5 text-emerald-600" />
        <X v-else class="h-5 w-5 text-rose-600" />
        <span class="font-medium text-sm">Pendaftaran ini telah {{ formData.status === 'APPROVED' ? 'Disetujui' : 'Ditolak' }}.</span>
      </div>
    </div>

    <div class="space-y-8">
      <!-- 1. Data Pribadi & Kontak -->
      <Card class="border border-border overflow-hidden bg-card rounded-3xl">
        <CardHeader class="bg-muted/50 border-b border-border">
          <div class="flex items-center gap-2">
            <UserCircle class="h-5 w-5 text-kv-primary" />
            <CardTitle class="text-lg font-semibold text-foreground">Identitas & Kontak</CardTitle>
          </div>
        </CardHeader>
        <CardContent class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
            <div class="flex flex-col">
              <span class="text-xs text-muted-foreground font-medium">Nama Lengkap</span>
              <span class="text-sm font-semibold text-foreground mt-0.5">{{ formData.name }}</span>
            </div>
            <div class="flex flex-col">
              <span class="text-xs text-muted-foreground font-medium">Alamat Email</span>
              <span class="text-sm font-semibold text-foreground mt-0.5">{{ formData.email }}</span>
            </div>
            <div class="flex flex-col">
              <span class="text-xs text-muted-foreground font-medium">No. Telepon / WhatsApp</span>
              <span class="text-sm font-semibold text-foreground mt-0.5">{{ formData.phone || '-' }}</span>
            </div>
            <div class="flex flex-col">
              <span class="text-xs text-muted-foreground font-medium">Nomor KTP</span>
              <span class="text-sm font-semibold text-foreground mt-0.5">{{ formData.ktpNumber || '-' }}</span>
            </div>
            <div class="flex flex-col">
              <span class="text-xs text-muted-foreground font-medium">Nomor NPWP</span>
              <span class="text-sm font-semibold text-foreground mt-0.5">{{ formData.npwpNumber || '-' }}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- 2. Keahlian & Portfolio -->
      <Card class="border border-border overflow-hidden bg-card rounded-3xl">
        <CardHeader class="bg-muted/50 border-b border-border">
          <div class="flex items-center gap-2">
            <Briefcase class="h-5 w-5 text-kv-primary" />
            <CardTitle class="text-lg font-semibold text-foreground">Keahlian & Profesionalisme</CardTitle>
          </div>
        </CardHeader>
        <CardContent class="p-6 space-y-4">
          <div class="space-y-6">
            <div class="flex flex-col">
              <span class="text-xs text-muted-foreground font-medium mb-3">Bidang Keahlian</span>
              <ol class="flex flex-col gap-2.5" v-if="parsedExpertise.length > 0">
                <li v-for="(exp, idx) in parsedExpertise" :key="idx" class="flex items-start gap-2">
                  <span class="text-sm font-medium text-muted-foreground w-4 flex-shrink-0 pt-0.5">{{ idx + 1 }}.</span>
                  <div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span class="text-sm font-semibold text-foreground">{{ exp.name || '-' }}</span>
                    <span class="hidden sm:inline text-muted-foreground/40">•</span>
                    <div class="flex items-center gap-2 text-xs text-muted-foreground">
                      <span class="bg-muted px-2 py-0.5 rounded-md font-medium">{{ exp.level || '-' }}</span>
                      <span>{{ exp.years || '0' }} Tahun</span>
                    </div>
                  </div>
                </li>
              </ol>
              <span v-else class="text-sm font-semibold text-foreground mt-0.5">-</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-8 border-t border-border/60 pt-4">
              <div class="flex flex-col">
                <span class="text-xs text-muted-foreground font-medium">Lama Pengalaman Kerja</span>
                <span class="text-sm font-semibold text-foreground mt-0.5">{{ formData.experience || '0' }} Tahun</span>
              </div>
              <div class="flex flex-col">
                <span class="text-xs text-muted-foreground font-medium">Pekerjaan Saat Ini</span>
                <span class="text-sm font-semibold text-foreground mt-0.5">{{ formData.currentJob || '-' }}</span>
              </div>
              <div class="flex flex-col">
                <span class="text-xs text-muted-foreground font-medium">Perusahaan / Institusi</span>
                <span class="text-sm font-semibold text-foreground mt-0.5">{{ formData.company || '-' }}</span>
              </div>
            </div>
          </div>

          <div class="border-t border-border/60 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col">
              <span class="text-xs text-muted-foreground font-medium">Ketersediaan Mengajar</span>
              <span class="text-sm text-foreground mt-0.5">{{ formData.teachingAvailability || '-' }}</span>
            </div>
            <div class="flex flex-col">
              <span class="text-xs text-muted-foreground font-medium">Pengalaman Mengajar</span>
              <span class="text-sm text-foreground mt-0.5">{{ formData.teachingExperience || '-' }}</span>
            </div>
          </div>

          <div class="border-t border-border/60 pt-4 space-y-2">
            <span class="text-xs text-muted-foreground font-medium">Bio Singkat</span>
            <p class="text-sm text-foreground bg-muted/30 p-3 rounded-xl border border-border/50 leading-relaxed">{{ formData.bio || 'Tidak ada biografi' }}</p>
          </div>

          <div class="space-y-2">
            <span class="text-xs text-muted-foreground font-medium">Alasan Mendaftar</span>
            <p class="text-sm text-foreground bg-muted/30 p-3 rounded-xl border border-border/50 leading-relaxed">{{ formData.reason || 'Tidak ada alasan khusus' }}</p>
          </div>

          <div class="border-t border-border/60 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="flex items-center gap-3 p-3 border border-border rounded-2xl bg-muted/10">
              <FileText class="h-5 w-5 text-kv-primary flex-shrink-0" />
              <div class="flex flex-col overflow-hidden">
                <span class="text-[10px] text-muted-foreground">Portofolio</span>
                <a v-if="formData.portfolioLink" :href="formData.portfolioLink" target="_blank" class="text-xs font-semibold text-kv-primary hover:underline truncate">
                  Buka Link Portofolio
                </a>
                <span v-else class="text-xs font-semibold text-muted-foreground">Tidak melampirkan</span>
              </div>
            </div>
            <div class="flex items-center gap-3 p-3 border border-border rounded-2xl bg-muted/10">
              <Linkedin class="h-5 w-5 text-blue-600 flex-shrink-0" />
              <div class="flex flex-col overflow-hidden">
                <span class="text-[10px] text-muted-foreground">LinkedIn</span>
                <a v-if="formData.linkedinLink" :href="formData.linkedinLink" target="_blank" class="text-xs font-semibold text-kv-primary hover:underline truncate">
                  Buka Profil LinkedIn
                </a>
                <span v-else class="text-xs font-semibold text-muted-foreground">Tidak melampirkan</span>
              </div>
            </div>
            <div class="flex items-center gap-3 p-3 border border-border rounded-2xl bg-muted/10">
              <FileText class="h-5 w-5 text-red-500 flex-shrink-0" />
              <div class="flex flex-col overflow-hidden">
                <span class="text-[10px] text-muted-foreground">Dokumen CV</span>
                <a v-if="formData.cvFileUrl" :href="formData.cvFileUrl" target="_blank" class="text-xs font-semibold text-kv-primary hover:underline truncate">
                  Buka Dokumen CV
                </a>
                <span v-else class="text-xs font-semibold text-muted-foreground">Tidak melampirkan</span>
              </div>
            </div>
            <div class="flex items-center gap-3 p-3 border border-border rounded-2xl bg-muted/10">
              <FileText class="h-5 w-5 text-indigo-500 flex-shrink-0" />
              <div class="flex flex-col overflow-hidden">
                <span class="text-[10px] text-muted-foreground">Dokumen KTP</span>
                <a v-if="formData.ktpFileUrl" :href="formData.ktpFileUrl" target="_blank" class="text-xs font-semibold text-kv-primary hover:underline truncate">
                  Buka Dokumen KTP
                </a>
                <span v-else class="text-xs font-semibold text-muted-foreground">Tidak melampirkan</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- 3. Rekening Pembayaran -->
      <Card class="border border-border overflow-hidden bg-card rounded-3xl">
        <CardHeader class="bg-muted/50 border-b border-border">
          <div class="flex items-center gap-2">
            <CreditCard class="h-5 w-5 text-kv-primary" />
            <CardTitle class="text-lg font-semibold text-foreground">Data Rekening Bank (Fee/Honor)</CardTitle>
          </div>
        </CardHeader>
        <CardContent class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-8">
            <div class="flex flex-col">
              <span class="text-xs text-muted-foreground font-medium">Bank Tujuan</span>
              <span class="text-sm font-semibold text-foreground mt-0.5">{{ formData.bankName || '-' }}</span>
            </div>
            <div class="flex flex-col">
              <span class="text-xs text-muted-foreground font-medium">Nomor Rekening</span>
              <span class="text-sm font-semibold text-foreground mt-0.5">{{ formData.accountNumber || '-' }}</span>
            </div>
            <div class="flex flex-col">
              <span class="text-xs text-muted-foreground font-medium">Nama Pemilik Rekening</span>
              <span class="text-sm font-semibold text-foreground mt-0.5">{{ formData.accountHolder || '-' }}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Review Actions (Only show if status is PENDING) -->
      <div v-if="formData.status === 'PENDING'" class="flex items-center justify-end gap-4 p-4">
        <Button 
          type="button" 
          variant="outline" 
          class="px-6 text-destructive border-destructive hover:bg-destructive/10" 
          @click="reviewMentor('REJECTED')"
          :disabled="loading"
        >
          Tolak Pendaftaran
        </Button>
        <Button 
          type="button" 
          class="w-full sm:w-48 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white border-none" 
          @click="reviewMentor('APPROVED')"
          :disabled="loading"
        >
          <Loader2 v-if="loading" class="h-4 w-4 animate-spin" />
          <CheckCircle2 v-else class="h-4 w-4" />
          Setujui Mentor
        </Button>
      </div>
      <div v-else class="flex justify-end p-4">
        <Button variant="ghost" class="px-6" @click="navigateTo('/employee')">Kembali</Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  ArrowLeft, 
  UserCircle, 
  Briefcase,
  FileText,
  Linkedin,
  CreditCard,
  CheckCircle2,
  X,
  Loader2
} from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { toast } from 'vue-sonner'
import { useRoute } from 'vue-router'
import { mentorApplicationApi, type MentorApplication } from '~/pages/employee/api/mentorApplication.api'

definePageMeta({
  layout: "default",
  middleware: ["auth", "admin"],
});

const route = useRoute();
const loading = ref(false);

const formData = ref<MentorApplication>({
  id: "",
  uuid: "",
  name: "",
  email: "",
  phone: "",
  currentJob: "",
  company: "",
  expertise: "",
  experience: "",
  portfolioLink: "",
  linkedinLink: "",
  cvFileUrl: "",
  ktpFileUrl: "",
  bankName: "",
  accountNumber: "",
  accountHolder: "",
  ktpNumber: "",
  npwpNumber: "",
  teachingAvailability: "",
  teachingExperience: "",
  bio: "",
  reason: "",
  status: "PENDING",
  createdAt: ""
});

const parsedExpertise = computed(() => {
  try {
    if (!formData.value.expertise) return [];
    return JSON.parse(formData.value.expertise);
  } catch (e) {
    // Fallback if not JSON
    return [{ name: formData.value.expertise, level: "-", years: "-" }];
  }
});

const fetchDetail = async () => {
  const id = route.params.id as string;
  if (!id) return;
  
  loading.value = true;
  try {
    const response = await mentorApplicationApi.getApplicationDetail(id);
    if (response.success && response.data) {
      formData.value = response.data;
    } else {
      toast.error("Detail pendaftaran tidak ditemukan");
      navigateTo("/employee");
    }
  } catch (error) {
    console.error("Error loading application detail:", error);
    toast.error("Gagal memuat detail data");
  } finally {
    loading.value = false;
  }
};

const reviewMentor = async (status: 'APPROVED' | 'REJECTED') => {
  const id = route.params.id as string;
  const actionText = status === 'APPROVED' ? 'menyetujui' : 'menolak';
  
  loading.value = true;
  try {
    const response = await mentorApplicationApi.reviewApplication(id, status);
    if (response.success) {
      toast.success(`Pendaftaran ${status === 'APPROVED' ? 'Disetujui' : 'Ditolak'}`, {
        description: `Berhasil ${actionText} pendaftaran mentor.`
      });
      navigateTo("/employee");
    }
  } catch (error: any) {
    toast.error("Gagal mengirimkan keputusan", {
      description: error?.data?.message || "Terjadi kesalahan pada server."
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchDetail();
});
</script>

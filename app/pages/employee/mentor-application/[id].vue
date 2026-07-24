<template>
  <div class="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <!-- Header Section -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <Button variant="ghost" size="icon" @click="handleBack" class="rounded-full w-10 text-muted-foreground hover:text-foreground hover:bg-accent">
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
      <MentorIdentityCard :application="formData" />

      <!-- 2. Keahlian & Portfolio -->
      <MentorExpertiseCard :application="formData" />

      <!-- 3. Rekening Pembayaran -->
      <MentorBankCard :application="formData" />

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
        <Button variant="ghost" class="px-6" @click="handleBack">Kembali</Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  ArrowLeft, 
  CheckCircle2,
  X,
  Loader2
} from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { toast } from 'vue-sonner'
import { mentorApplicationApi, type MentorApplication } from '~/pages/employee/api/mentorApplication.api'
import MentorIdentityCard from '../components/MentorIdentityCard.vue'
import MentorExpertiseCard from '../components/MentorExpertiseCard.vue'
import MentorBankCard from '../components/MentorBankCard.vue'

definePageMeta({
  layout: "default",
  middleware: ["auth", "admin"],
});

const route = useRoute();
const loading = ref(false);

const handleBack = () => {
  navigateTo('/employee');
};

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

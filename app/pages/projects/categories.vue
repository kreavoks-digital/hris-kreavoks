<template>
  <div class="space-y-6 max-w-6xl mx-auto pb-12">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <NuxtLink
          to="/projects"
          class="w-10 h-10 rounded-2xl border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all shrink-0 shadow-sm"
          title="Kembali ke Daftar Proyek"
        >
          <ArrowLeft class="w-5 h-5" />
        </NuxtLink>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl sm:text-2xl font-bold text-foreground">
              Manajemen Kategori Proyek
            </h1>
            <span class="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
              {{ categories.length }} Kategori
            </span>
          </div>
          <p class="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Atur klasifikasi bidang, deskripsi, dan identitas visual untuk seluruh proyek tim.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2 self-start sm:self-auto">
        <Button
          type="button"
          variant="outline"
          size="sm"
          label="Reset Default"
          :icon-left="RotateCcw"
          class="rounded-xl sm:rounded-2xl text-xs h-10"
          @click="handleResetDefaults"
        />
        <Button
          type="button"
          variant="primary"
          size="sm"
          label="Tambah Kategori"
          :icon-left="Plus"
          class="rounded-xl sm:rounded-2xl text-xs font-medium h-10 shadow-sm"
          @click="openCreateModal"
        />
      </div>
    </div>

    <!-- Quick Stats Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      <Card class="border border-border bg-card rounded-2xl shadow-none p-3.5 sm:p-4">
        <p class="text-xs text-muted-foreground font-medium">Total Kategori</p>
        <p class="text-xl sm:text-2xl font-bold text-foreground mt-1">{{ categories.length }}</p>
        <span class="text-[11px] text-muted-foreground">Aktif digunakan</span>
      </Card>

      <Card class="border border-border bg-card rounded-2xl shadow-none p-3.5 sm:p-4">
        <p class="text-xs text-muted-foreground font-medium">Kategori Bawaan</p>
        <p class="text-xl sm:text-2xl font-bold text-foreground mt-1">
          {{ categories.filter(c => c.isDefault).length }}
        </p>
        <span class="text-[11px] text-muted-foreground">Standar sistem</span>
      </Card>

      <Card class="border border-border bg-card rounded-2xl shadow-none p-3.5 sm:p-4">
        <p class="text-xs text-muted-foreground font-medium">Kategori Kustom</p>
        <p class="text-xl sm:text-2xl font-bold text-primary mt-1">
          {{ categories.filter(c => !c.isDefault).length }}
        </p>
        <span class="text-[11px] text-muted-foreground">Ditambahkan tim</span>
      </Card>

      <Card class="border border-border bg-card rounded-2xl shadow-none p-3.5 sm:p-4">
        <p class="text-xs text-muted-foreground font-medium">Total Proyek</p>
        <p class="text-xl sm:text-2xl font-bold text-foreground mt-1">{{ projects.length }}</p>
        <span class="text-[11px] text-muted-foreground">Di seluruh kategori</span>
      </Card>
    </div>

    <!-- Category Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card
        v-for="cat in categories"
        :key="cat.id"
        class="border border-border bg-card rounded-2xl sm:rounded-3xl p-5 shadow-none transition-all hover:border-primary/40 flex flex-col justify-between"
      >
        <div>
          <!-- Top Row: Color indicator, Label & Actions -->
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border border-border/40 shadow-sm"
                :style="{ backgroundColor: `${cat.color}15`, color: cat.color }"
              >
                <Tag class="w-5 h-5" />
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="font-semibold text-foreground text-sm sm:text-base">
                    {{ cat.label }}
                  </h3>
                  <span
                    v-if="cat.isDefault"
                    class="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                  >
                    Bawaan
                  </span>
                  <span
                    v-else
                    class="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                  >
                    Kustom
                  </span>
                </div>
                <p class="text-xs font-mono text-muted-foreground mt-0.5">
                  Kode: <span class="font-bold text-foreground/80">{{ cat.key }}</span>
                </p>
              </div>
            </div>

            <!-- Action buttons -->
            <div class="flex items-center gap-1">
              <button
                type="button"
                @click="openEditModal(cat)"
                class="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="Edit Kategori"
              >
                <Pencil class="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                @click="confirmDelete(cat)"
                class="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                title="Hapus Kategori"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <!-- Description -->
          <p class="text-xs text-muted-foreground mt-3 line-clamp-2 leading-relaxed">
            {{ cat.description || 'Tidak ada deskripsi ruang lingkup.' }}
          </p>
        </div>

        <!-- Bottom Row: Count of active projects -->
        <div class="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs">
          <div class="flex items-center gap-1.5 text-muted-foreground">
            <FolderKanban class="w-3.5 h-3.5 text-primary" />
            <span>{{ getProjectsCount(cat.key) }} proyek aktif</span>
          </div>

          <NuxtLink
            :to="`/projects?category=${cat.key}`"
            class="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
          >
            <span>Lihat proyek</span>
            <ArrowRight class="w-3 h-3" />
          </NuxtLink>
        </div>
      </Card>
    </div>

    <!-- Modal Form: Tambah / Edit Kategori -->
    <Dialog :open="isModalOpen" @update:open="isModalOpen = $event">
      <DialogContent class="w-[calc(100%-1.5rem)] sm:max-w-lg p-0 rounded-2xl sm:rounded-3xl bg-popover border border-border flex flex-col overflow-hidden shadow-2xl">
        <DialogHeader class="p-5 sm:p-6 pb-4 border-b border-border/50 !text-left items-start shrink-0">
          <div class="flex items-center gap-3 w-full">
            <div
              class="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
              :style="{ backgroundColor: `${form.color}20`, color: form.color }"
            >
              <Tag class="w-5 h-5" />
            </div>
            <div>
              <DialogTitle class="text-base sm:text-lg font-bold text-foreground text-left">
                {{ isEditing ? 'Edit Kategori Proyek' : 'Tambah Kategori Baru' }}
              </DialogTitle>
              <p class="text-xs text-muted-foreground mt-0.5 text-left">
                Definisikan klasifikasi proyek untuk mempermudah filter dan alokasi tim.
              </p>
            </div>
          </div>
        </DialogHeader>

        <form @submit.prevent="handleSave" class="p-5 sm:p-6 space-y-4">
          <!-- Category Name -->
          <div class="space-y-1.5">
            <label class="text-xs sm:text-sm font-medium text-foreground flex items-center gap-1">
              Nama Kategori <span class="text-rose-500 font-semibold">*</span>
            </label>
            <Input
              v-model="form.label"
              placeholder="Contoh: AI & Machine Learning"
              required
              class="rounded-xl sm:rounded-2xl h-11 border-border bg-background px-3.5 text-sm"
              @input="onLabelInput"
            />
          </div>

          <!-- Category Key / Slug -->
          <div class="space-y-1.5">
            <label class="text-xs sm:text-sm font-medium text-foreground flex items-center gap-1">
              Kode Kategori (Slug) <span class="text-rose-500 font-semibold">*</span>
            </label>
            <Input
              v-model="form.key"
              placeholder="Contoh: AI_ML"
              required
              :disabled="isEditing && editingCategory?.isDefault"
              class="rounded-xl sm:rounded-2xl h-11 border-border bg-background px-3.5 text-sm font-mono uppercase"
            />
            <p class="text-[11px] text-muted-foreground">
              Digunakan sebagai identifier unik pada database dan filter URL.
            </p>
          </div>

          <!-- Color Presets -->
          <div class="space-y-1.5">
            <label class="text-xs sm:text-sm font-medium text-foreground">
              Warna Tema Kategori
            </label>
            <div class="flex items-center gap-2 flex-wrap">
              <button
                v-for="color in colorPresets"
                :key="color"
                type="button"
                @click="form.color = color"
                class="w-7 h-7 rounded-full transition-transform flex items-center justify-center border-2"
                :class="form.color === color ? 'scale-110 border-foreground shadow-sm' : 'border-transparent hover:scale-105'"
                :style="{ backgroundColor: color }"
              >
                <Check v-if="form.color === color" class="w-3.5 h-3.5 text-white drop-shadow" />
              </button>
            </div>
          </div>

          <!-- Description -->
          <div class="space-y-1.5">
            <label class="text-xs sm:text-sm font-medium text-foreground flex items-center gap-1">
              Deskripsi Singkat <span class="text-[11px] text-muted-foreground font-normal">(Opsional)</span>
            </label>
            <Textarea
              v-model="form.description"
              rows="3"
              placeholder="Jelaskan ruang lingkup proyek yang masuk ke dalam kategori ini..."
              class="rounded-xl sm:rounded-2xl border-border bg-background p-3 text-sm resize-none"
            />
          </div>

          <!-- Footer Buttons (Kiri Kanan Flex) -->
          <div class="pt-4 border-t border-border/50 flex flex-row items-center justify-between gap-3">
            <Button
              type="button"
              variant="ghost"
              class="flex-1 sm:flex-none sm:min-w-[100px] h-11 sm:h-10 rounded-xl sm:rounded-2xl text-sm"
              label="Batal"
              @click="isModalOpen = false"
            />
            <Button
              type="submit"
              variant="primary"
              class="flex-1 sm:flex-none sm:min-w-[140px] h-11 sm:h-10 rounded-xl sm:rounded-2xl text-sm font-medium shadow-sm"
              :label="isEditing ? 'Simpan Perubahan' : 'Buat Kategori'"
              :disabled="!isFormValid"
            />
          </div>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Modal Konfirmasi Hapus -->
    <Dialog :open="isDeleteModalOpen" @update:open="isDeleteModalOpen = $event">
      <DialogContent class="w-[calc(100%-1.5rem)] sm:max-w-md p-6 rounded-2xl sm:rounded-3xl bg-popover border border-border shadow-2xl">
        <DialogHeader class="!text-left items-start">
          <div class="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mb-2">
            <AlertTriangle class="w-5 h-5" />
          </div>
          <DialogTitle class="text-base sm:text-lg font-bold text-foreground text-left">
            Hapus Kategori "{{ deletingCategory?.label }}"?
          </DialogTitle>
          <p class="text-xs sm:text-sm text-muted-foreground mt-1 text-left leading-relaxed">
            Apakah Anda yakin ingin menghapus kategori ini? Proyek yang saat ini menggunakan kategori ini akan tetap tersimpan namun label kategorinya tidak lagi muncul di filter utama.
          </p>
        </DialogHeader>

        <DialogFooter class="pt-4 border-t border-border/50 !flex-row flex-row items-center justify-between gap-3 mt-4">
          <Button
            type="button"
            variant="ghost"
            class="flex-1 h-10 rounded-xl text-sm"
            label="Batal"
            @click="isDeleteModalOpen = false"
          />
          <Button
            type="button"
            variant="destructive"
            class="flex-1 h-10 rounded-xl text-sm font-medium shadow-sm bg-rose-600 text-white hover:bg-rose-700"
            label="Hapus Kategori"
            @click="executeDelete"
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { toast } from 'vue-sonner'
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  RotateCcw,
  Tag,
  Pencil,
  Trash2,
  FolderKanban,
  Check,
  AlertTriangle
} from 'lucide-vue-next'
import { Card } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '~/components/ui/dialog'
import { Button } from '@kreavoks/kreaui'
import { useProjectCategories, type ProjectCategoryItem } from './hooks/useProjectCategories'
import { useProjects } from './hooks/useProjects'

definePageMeta({
  title: 'Manajemen Kategori Proyek'
})

const {
  categories,
  addCategory,
  updateCategory,
  deleteCategory,
  resetToDefaults
} = useProjectCategories()

const { projects } = useProjects()

// Color presets for categories
const colorPresets = [
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#ef4444', // Red
  '#6366f1'  // Indigo
]

// Modal Form State
const isModalOpen = ref(false)
const isEditing = ref(false)
const editingCategory = ref<ProjectCategoryItem | null>(null)

const form = ref({
  label: '',
  key: '',
  color: '#3b82f6',
  description: ''
})

const onLabelInput = () => {
  if (!isEditing.value) {
    form.value.key = form.value.label.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_')
  }
}

const isFormValid = computed(() => {
  return form.value.label.trim() !== '' && form.value.key.trim() !== ''
})

const openCreateModal = () => {
  isEditing.value = false
  editingCategory.value = null
  form.value = {
    label: '',
    key: '',
    color: '#3b82f6',
    description: ''
  }
  isModalOpen.value = true
}

const openEditModal = (cat: ProjectCategoryItem) => {
  isEditing.value = true
  editingCategory.value = cat
  form.value = {
    label: cat.label,
    key: cat.key,
    color: cat.color || '#3b82f6',
    description: cat.description || ''
  }
  isModalOpen.value = true
}

const handleSave = () => {
  if (!isFormValid.value) return

  if (isEditing.value && editingCategory.value) {
    updateCategory(editingCategory.value.id, {
      label: form.value.label,
      key: form.value.key,
      color: form.value.color,
      description: form.value.description
    })
    toast.success(`Kategori "${form.value.label}" berhasil diperbarui!`)
  } else {
    addCategory({
      label: form.value.label,
      key: form.value.key,
      color: form.value.color,
      description: form.value.description
    })
    toast.success(`Kategori "${form.value.label}" berhasil ditambahkan!`)
  }

  isModalOpen.value = false
}

// Delete State
const isDeleteModalOpen = ref(false)
const deletingCategory = ref<ProjectCategoryItem | null>(null)

const confirmDelete = (cat: ProjectCategoryItem) => {
  deletingCategory.value = cat
  isDeleteModalOpen.value = true
}

const executeDelete = () => {
  if (!deletingCategory.value) return
  const label = deletingCategory.value.label
  deleteCategory(deletingCategory.value.id)
  toast.success(`Kategori "${label}" berhasil dihapus.`)
  isDeleteModalOpen.value = false
  deletingCategory.value = null
}

const handleResetDefaults = () => {
  if (confirm('Kembalikan seluruh daftar kategori ke konfigurasi standar sistem?')) {
    resetToDefaults()
    toast.success('Daftar kategori berhasil dikembalikan ke default.')
  }
}

// Helper: Menghitung total proyek aktif yang menggunakan kategori ini
const getProjectsCount = (key: string): number => {
  return projects.value.filter(p => p.category === key).length
}
</script>

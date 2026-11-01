<template>
  <div class="w-full rounded-3xl border border-border bg-card overflow-hidden transition-colors">
    <!-- Toolbar (Hanya aktif jika editable) -->
    <div
      v-if="editable"
      class="flex flex-wrap items-center gap-1.5 p-2.5 bg-muted/40 border-b border-border select-none"
    >
      <button
        type="button"
        @click="execFormat('bold')"
        :class="btnClass(activeState.bold)"
        title="Tebal (Ctrl+B)"
      >
        <Bold class="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        @click="execFormat('italic')"
        :class="btnClass(activeState.italic)"
        title="Miring (Ctrl+I)"
      >
        <Italic class="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        @click="execFormat('strikeThrough')"
        :class="btnClass(activeState.strike)"
        title="Coret"
      >
        <Strikethrough class="w-3.5 h-3.5" />
      </button>

      <div class="h-4 w-px bg-border mx-1" />

      <button
        type="button"
        @click="execBlock('h2')"
        :class="btnClass(activeState.h2)"
        title="Heading 2 (Judul Bagian)"
      >
        <Heading2 class="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        @click="execBlock('h3')"
        :class="btnClass(activeState.h3)"
        title="Heading 3 (Sub-judul)"
      >
        <Heading3 class="w-3.5 h-3.5" />
      </button>

      <div class="h-4 w-px bg-border mx-1" />

      <button
        type="button"
        @click="execFormat('insertUnorderedList')"
        :class="btnClass(activeState.bullet)"
        title="Daftar Poin"
      >
        <List class="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        @click="execFormat('insertOrderedList')"
        :class="btnClass(activeState.number)"
        title="Daftar Angka"
      >
        <ListOrdered class="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        @click="execBlock('blockquote')"
        :class="btnClass(activeState.quote)"
        title="Kutipan / Catatan Penting"
      >
        <Quote class="w-3.5 h-3.5" />
      </button>

      <div class="h-4 w-px bg-border mx-1" />

      <button
        type="button"
        @click="clearFormatting"
        class="px-2.5 py-1 text-xs rounded-xl font-medium border border-border bg-background hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
        title="Hapus Format"
      >
        <RemoveFormatting class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- Read-Only Banner saat tidak bisa mengedit -->
    <div
      v-else
      class="px-4 py-2 bg-muted/20 border-b border-border flex items-center justify-between text-xs text-muted-foreground"
    >
      <div class="flex items-center gap-1.5">
        <Lock class="w-3.5 h-3.5 text-muted-foreground" />
        <span>Mode Baca (View-Only) — Hanya penyelenggara atau peserta dengan izin edit yang dapat mengubah catatan ini.</span>
      </div>
    </div>

    <!-- Editable Canvas -->
    <div
      ref="editorEl"
      :contenteditable="editable"
      @input="handleInput"
      @blur="handleInput"
      :style="{ minHeight }"
      class="p-4 sm:p-5 text-sm text-foreground focus:outline-none leading-relaxed prose prose-slate dark:prose-invert max-w-none space-y-2 select-text"
      :data-placeholder="placeholder"
    />
  </div>
</template>

<script setup lang="ts">
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  RemoveFormatting,
  Lock
} from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    modelValue?: string | null
    placeholder?: string
    editable?: boolean
    minHeight?: string
  }>(),
  {
    modelValue: '',
    placeholder: 'Tuliskan catatan meeting, poin diskusi, atau action items di sini...',
    editable: true,
    minHeight: '260px'
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editorEl = ref<HTMLDivElement | null>(null)

const activeState = ref({
  bold: false,
  italic: false,
  strike: false,
  h2: false,
  h3: false,
  bullet: false,
  number: false,
  quote: false
})

const btnClass = (active: boolean) => [
  'p-1.5 rounded-xl text-xs transition-colors border cursor-pointer flex items-center justify-center',
  active
    ? 'bg-kv-primary text-white border-kv-primary'
    : 'bg-background hover:bg-muted text-foreground border-border'
]

const handleInput = () => {
  if (!editorEl.value) return
  emit('update:modelValue', editorEl.value.innerHTML)
}

const execFormat = (cmd: string) => {
  document.execCommand(cmd, false)
  handleInput()
}

const execBlock = (tag: string) => {
  document.execCommand('formatBlock', false, tag)
  handleInput()
}

const clearFormatting = () => {
  document.execCommand('removeFormat', false)
  handleInput()
}

onMounted(() => {
  if (editorEl.value && props.modelValue) {
    editorEl.value.innerHTML = props.modelValue
  }
})

watch(() => props.modelValue, (newVal) => {
  if (editorEl.value && editorEl.value.innerHTML !== newVal) {
    editorEl.value.innerHTML = newVal || ''
  }
})
</script>

<style scoped>
[contenteditable]:empty:before {
  content: attr(data-placeholder);
  color: var(--muted-foreground, #94a3b8);
  pointer-events: none;
  display: block;
}
</style>

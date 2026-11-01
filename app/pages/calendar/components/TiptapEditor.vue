<template>
  <div ref="editorContainerRef" class="relative w-full rounded-2xl border border-border bg-card transition-colors">
    <!-- Toolbar (Hanya aktif jika editable) -->
    <div
      v-if="editable"
      class="flex flex-wrap items-center gap-1 p-1.5 sm:px-2.5 sm:py-2 bg-muted/40 border-b border-border select-none rounded-t-2xl"
    >
      <button
        type="button"
        @click="editor?.chain().focus().toggleBold().run()"
        :class="btnClass(editor?.isActive('bold') ?? false)"
        title="Tebal (Ctrl+B)"
      >
        <Bold class="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        @click="editor?.chain().focus().toggleItalic().run()"
        :class="btnClass(editor?.isActive('italic') ?? false)"
        title="Miring (Ctrl+I)"
      >
        <Italic class="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        @click="editor?.chain().focus().toggleStrike().run()"
        :class="btnClass(editor?.isActive('strike') ?? false)"
        title="Coret"
      >
        <Strikethrough class="w-3.5 h-3.5" />
      </button>

      <div class="h-3.5 w-px bg-border mx-0.5" />

      <button
        type="button"
        @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()"
        :class="btnClass(editor?.isActive('heading', { level: 1 }) ?? false)"
        title="Heading 1 (Judul Utama)"
      >
        <Heading1 class="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
        :class="btnClass(editor?.isActive('heading', { level: 2 }) ?? false)"
        title="Heading 2 (Sub-judul)"
      >
        <Heading2 class="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()"
        :class="btnClass(editor?.isActive('heading', { level: 3 }) ?? false)"
        title="Heading 3 (Rincian)"
      >
        <Heading3 class="w-3.5 h-3.5" />
      </button>

      <div class="h-3.5 w-px bg-border mx-0.5" />

      <button
        type="button"
        @click="editor?.chain().focus().toggleBulletList().run()"
        :class="btnClass(editor?.isActive('bulletList') ?? false)"
        title="Daftar Poin"
      >
        <List class="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        @click="editor?.chain().focus().toggleOrderedList().run()"
        :class="btnClass(editor?.isActive('orderedList') ?? false)"
        title="Daftar Angka"
      >
        <ListOrdered class="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        @click="editor?.chain().focus().toggleTaskList().run()"
        :class="btnClass(editor?.isActive('taskList') ?? false)"
        title="Daftar Tugas / Checklist"
      >
        <CheckSquare class="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        @click="editor?.chain().focus().toggleBlockquote().run()"
        :class="btnClass(editor?.isActive('blockquote') ?? false)"
        title="Kutipan / Catatan Penting"
      >
        <Quote class="w-3.5 h-3.5" />
      </button>

      <div class="h-3.5 w-px bg-border mx-0.5" />

      <!-- Tombol Link -->
      <button
        type="button"
        @click="openLinkModal"
        :class="btnClass(editor?.isActive('link') ?? false)"
        title="Sisipkan / Edit Tautan (Link)"
      >
        <Link2 class="w-3.5 h-3.5" />
      </button>

      <!-- Tombol Tabel -->
      <button
        type="button"
        @click="insertTable"
        :class="btnClass(editor?.isActive('table') ?? false)"
        title="Sisipkan Tabel (3x3)"
      >
        <TableIcon class="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        @click="editor?.chain().focus().setHorizontalRule().run()"
        class="p-1.5 rounded-lg text-xs transition-colors border cursor-pointer flex items-center justify-center bg-background hover:bg-muted text-foreground border-border"
        title="Garis Pembatas (Divider)"
      >
        <Minus class="w-3.5 h-3.5" />
      </button>

      <div class="h-3.5 w-px bg-border mx-0.5" />

      <button
        type="button"
        @click="editor?.chain().focus().unsetAllMarks().clearNodes().run()"
        class="px-2 py-1 text-xs rounded-lg font-medium border border-border bg-background hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
        title="Hapus Format"
      >
        <RemoveFormatting class="w-3.5 h-3.5" />
      </button>

      <!-- Petunjuk Menu Format pada Toolbar -->
      <div class="ml-auto hidden sm:flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md border border-border/40 select-none">
        <span class="font-mono font-bold bg-background px-1 rounded text-kv-primary border border-border/60">/</span>
        <span>Ketik / untuk menu format</span>
      </div>
    </div>

    <!-- Table Action Toolbar Bar (Aktif ketika kursor ada di dalam tabel) -->
    <div
      v-if="editable && editor?.isActive('table')"
      class="flex flex-wrap items-center gap-1 px-2.5 py-1 bg-kv-primary/5 border-b border-border text-[11px] text-foreground select-none"
    >
      <span class="font-semibold text-kv-primary flex items-center gap-1 mr-1">
        <TableIcon class="w-3 h-3" />
        <span>Menu Tabel:</span>
      </span>

      <button
        type="button"
        @click="editor?.chain().focus().addColumnAfter().run()"
        class="px-2 py-0.5 rounded-md border border-border bg-background hover:bg-muted text-foreground transition-colors"
        title="Tambah Kolom Kanan"
      >
        + Kolom
      </button>

      <button
        type="button"
        @click="editor?.chain().focus().addRowAfter().run()"
        class="px-2 py-0.5 rounded-md border border-border bg-background hover:bg-muted text-foreground transition-colors"
        title="Tambah Baris Bawah"
      >
        + Baris
      </button>

      <button
        type="button"
        @click="editor?.chain().focus().deleteColumn().run()"
        class="px-2 py-0.5 rounded-md border border-border bg-background hover:bg-muted text-foreground transition-colors"
        title="Hapus Kolom Saat Ini"
      >
        - Kolom
      </button>

      <button
        type="button"
        @click="editor?.chain().focus().deleteRow().run()"
        class="px-2 py-0.5 rounded-md border border-border bg-background hover:bg-muted text-foreground transition-colors"
        title="Hapus Baris Saat Ini"
      >
        - Baris
      </button>

      <button
        type="button"
        @click="editor?.chain().focus().deleteTable().run()"
        class="px-2 py-0.5 rounded-md border border-destructive/30 bg-background hover:bg-destructive/10 text-destructive transition-colors ml-auto font-medium"
        title="Hapus Seluruh Tabel"
      >
        Hapus Tabel
      </button>
    </div>

    <!-- Read-Only Banner saat tidak bisa mengedit -->
    <div
      v-else-if="!editable"
      class="px-3.5 py-1.5 bg-muted/20 border-b border-border flex items-center justify-between text-xs text-muted-foreground rounded-t-2xl"
    >
      <div class="flex items-center gap-1.5">
        <Lock class="w-3.5 h-3.5 text-muted-foreground" />
        <span>Mode Baca (View-Only) — Hanya penyelenggara atau peserta dengan izin edit yang dapat mengubah catatan ini.</span>
      </div>
    </div>

    <!-- Tiptap Editor Content resmi -->
    <EditorContent
      :editor="editor"
      :style="{ minHeight }"
      class="tiptap-wrapper"
    />

    <!-- Menu Format Cepat Popover (Slash Command Menu) -->
    <div
      v-if="showSlashMenu && filteredMenuItems.length > 0"
      ref="slashMenuRef"
      :style="{ top: menuPosition.top, left: menuPosition.left }"
      class="absolute z-50 w-72 max-h-72 overflow-y-auto rounded-2xl border border-border bg-popover text-popover-foreground shadow-2xl p-1.5 space-y-1 animate-in fade-in-0 zoom-in-95"
    >
      <div class="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between border-b border-border/50 pb-1.5 mb-1">
        <span>Pilihan Format Blok</span>
        <span v-if="slashQuery" class="text-kv-primary font-mono text-[10px] bg-kv-primary/10 px-1 rounded">/{{ slashQuery }}</span>
      </div>

      <div class="space-y-0.5">
        <button
          v-for="(item, idx) in filteredMenuItems"
          :key="item.id"
          type="button"
          @click="applyMenuItem(item)"
          @mouseenter="selectedMenuIndex = idx"
          :class="[
            'w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center gap-2.5 transition-colors cursor-pointer group',
            selectedMenuIndex === idx
              ? 'bg-muted text-foreground'
              : 'hover:bg-muted/70 text-muted-foreground hover:text-foreground'
          ]"
        >
          <div class="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center shrink-0 group-hover:border-kv-primary/50 text-foreground transition-colors shadow-2xs">
            <component :is="item.icon" class="w-4 h-4 text-kv-primary" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between gap-1">
              <p class="font-medium text-xs text-foreground truncate">{{ item.title }}</p>
              <span v-if="item.shortcut" class="text-[10px] text-muted-foreground font-mono bg-muted/80 px-1 py-0.2 rounded border border-border/40">
                {{ item.shortcut }}
              </span>
            </div>
            <p class="text-[10px] text-muted-foreground truncate">{{ item.description }}</p>
          </div>
        </button>
      </div>
    </div>

    <!-- Modal Sisipkan / Edit Link -->
    <div
      v-if="showLinkModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
      @click.self="showLinkModal = false"
    >
      <div class="w-full max-w-sm rounded-2xl border border-border bg-card p-4 shadow-xl space-y-3">
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-semibold text-foreground flex items-center gap-2">
            <Link2 class="w-4 h-4 text-kv-primary" />
            <span>Sisipkan Tautan Web</span>
          </h4>
          <button
            type="button"
            @click="showLinkModal = false"
            class="text-muted-foreground hover:text-foreground text-xs p-1 rounded-lg"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="space-y-1.5">
          <label class="text-xs text-muted-foreground">URL Web (Contoh: https://example.com)</label>
          <input
            ref="linkInputRef"
            v-model="linkUrl"
            type="url"
            placeholder="https://"
            @keydown.enter.prevent="saveLink"
            class="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none focus:ring-1 focus:ring-kv-primary text-foreground"
          />
        </div>

        <div class="flex items-center justify-end gap-2 pt-1">
          <button
            v-if="editor?.isActive('link')"
            type="button"
            @click="removeLink"
            class="px-2.5 py-1.5 text-xs rounded-xl border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
          >
            Hapus Link
          </button>
          <button
            type="button"
            @click="showLinkModal = false"
            class="px-3 py-1.5 text-xs rounded-xl border border-border hover:bg-muted text-muted-foreground transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            @click="saveLink"
            class="px-3.5 py-1.5 text-xs rounded-xl bg-kv-primary text-white hover:bg-kv-primary/90 font-medium transition-colors"
          >
            Terapkan
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount, nextTick } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { onClickOutside } from '@vueuse/core'
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Minus,
  Type,
  RemoveFormatting,
  Lock,
  Link2,
  Table as TableIcon,
  X
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

const editorContainerRef = ref<HTMLDivElement | null>(null)
const slashMenuRef = ref<HTMLDivElement | null>(null)
const linkInputRef = ref<HTMLInputElement | null>(null)

const showSlashMenu = ref(false)
const slashQuery = ref('')
const selectedMenuIndex = ref(0)
const menuPosition = ref({ top: '40px', left: '20px' })

const showLinkModal = ref(false)
const linkUrl = ref('')

interface SlashMenuItem {
  id: string
  title: string
  description: string
  shortcut?: string
  icon: any
  action: () => void
}

const insertTable = () => {
  editor.value?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
}

const openLinkModal = () => {
  if (!editor.value) return
  const previousUrl = editor.value.getAttributes('link').href || ''
  linkUrl.value = previousUrl
  showLinkModal.value = true
  nextTick(() => {
    linkInputRef.value?.focus()
  })
}

const saveLink = () => {
  if (!editor.value) return
  const url = linkUrl.value.trim()

  if (url === '') {
    editor.value.chain().focus().extendMarkRange('link').unsetLink().run()
  } else {
    const formattedUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`
    if (editor.value.state.selection.empty) {
      editor.value
        .chain()
        .focus()
        .insertContent(`<a href="${formattedUrl}" target="_blank" rel="noopener noreferrer">${formattedUrl}</a> `)
        .run()
    } else {
      editor.value
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: formattedUrl, target: '_blank' })
        .run()
    }
  }

  showLinkModal.value = false
  linkUrl.value = ''
}

const removeLink = () => {
  editor.value?.chain().focus().extendMarkRange('link').unsetLink().run()
  showLinkModal.value = false
  linkUrl.value = ''
}

const slashMenuItems: SlashMenuItem[] = [
  {
    id: 'text',
    title: 'Teks Biasa',
    description: 'Paragraf standar teks biasa',
    shortcut: 'P',
    icon: Type,
    action: () => editor.value?.chain().focus().setParagraph().run()
  },
  {
    id: 'h1',
    title: 'Heading 1',
    description: 'Judul bagian utama berukuran besar',
    shortcut: '#',
    icon: Heading1,
    action: () => editor.value?.chain().focus().toggleHeading({ level: 1 }).run()
  },
  {
    id: 'h2',
    title: 'Heading 2',
    description: 'Sub-judul atau topik pembahasan',
    shortcut: '##',
    icon: Heading2,
    action: () => editor.value?.chain().focus().toggleHeading({ level: 2 }).run()
  },
  {
    id: 'h3',
    title: 'Heading 3',
    description: 'Sub-poin kecil atau rincian agenda',
    shortcut: '###',
    icon: Heading3,
    action: () => editor.value?.chain().focus().toggleHeading({ level: 3 }).run()
  },
  {
    id: 'bullet-list',
    title: 'Daftar Poin (Bullet List)',
    description: 'Daftar item dengan simbol peluru',
    shortcut: '-',
    icon: List,
    action: () => editor.value?.chain().focus().toggleBulletList().run()
  },
  {
    id: 'number-list',
    title: 'Daftar Angka (Numbered List)',
    description: 'Daftar berurutan langkah demi langkah',
    shortcut: '1.',
    icon: ListOrdered,
    action: () => editor.value?.chain().focus().toggleOrderedList().run()
  },
  {
    id: 'task-list',
    title: 'Daftar Tugas (Checklist)',
    description: 'Daftar action item dengan kotak centang',
    shortcut: '[]',
    icon: CheckSquare,
    action: () => editor.value?.chain().focus().toggleTaskList().run()
  },
  {
    id: 'table',
    title: 'Tabel (Table)',
    description: 'Sisipkan tabel data 3 baris x 3 kolom',
    shortcut: 'table',
    icon: TableIcon,
    action: () => insertTable()
  },
  {
    id: 'link',
    title: 'Tautan Web (Link)',
    description: 'Sisipkan link URL eksternal atau rujukan',
    shortcut: 'link',
    icon: Link2,
    action: () => openLinkModal()
  },
  {
    id: 'quote',
    title: 'Kutipan (Blockquote)',
    description: 'Kutipan atau keputusan meeting penting',
    shortcut: '>',
    icon: Quote,
    action: () => editor.value?.chain().focus().toggleBlockquote().run()
  },
  {
    id: 'divider',
    title: 'Garis Pembatas (Divider)',
    description: 'Garis pemisah visual antar bagian',
    shortcut: '---',
    icon: Minus,
    action: () => editor.value?.chain().focus().setHorizontalRule().run()
  }
]

const filteredMenuItems = computed(() => {
  const q = slashQuery.value.trim().toLowerCase()
  if (!q) return slashMenuItems
  return slashMenuItems.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q) ||
      (item.shortcut && item.shortcut.toLowerCase().includes(q))
  )
})

onClickOutside(slashMenuRef, () => {
  closeSlashMenu()
})

const closeSlashMenu = () => {
  showSlashMenu.value = false
  slashQuery.value = ''
  selectedMenuIndex.value = 0
}

const scrollToSelected = () => {
  nextTick(() => {
    if (!slashMenuRef.value) return
    const buttons = slashMenuRef.value.querySelectorAll('button')
    const activeBtn = buttons[selectedMenuIndex.value]
    if (activeBtn) {
      activeBtn.scrollIntoView({ block: 'nearest' })
    }
  })
}

const applyMenuItem = (item: SlashMenuItem) => {
  if (!editor.value) return

  const { state } = editor.value
  const { selection } = state
  const { $from } = selection

  const textBefore = $from.parent.textBetween(0, $from.parentOffset, undefined, ' ')
  const lastSlashIndex = textBefore.lastIndexOf('/')

  if (lastSlashIndex !== -1) {
    const from = $from.pos - (textBefore.length - lastSlashIndex)
    const to = $from.pos
    editor.value.chain().focus().deleteRange({ from, to }).run()
  }

  item.action()
  closeSlashMenu()
}

const checkSlashCommand = () => {
  if (!props.editable || !editor.value) return

  const { state, view } = editor.value
  const { selection } = state
  const { $from, empty } = selection

  if (!empty) {
    closeSlashMenu()
    return
  }

  const textBefore = $from.parent.textBetween(0, $from.parentOffset, undefined, ' ')
  const lastSlashIndex = textBefore.lastIndexOf('/')

  if (lastSlashIndex === -1) {
    closeSlashMenu()
    return
  }

  // Harus di awal baris atau didahului whitespace
  if (lastSlashIndex > 0 && !/\s/.test(textBefore[lastSlashIndex - 1])) {
    closeSlashMenu()
    return
  }

  const query = textBefore.slice(lastSlashIndex + 1)
  if (/\s/.test(query)) {
    closeSlashMenu()
    return
  }

  slashQuery.value = query.toLowerCase()
  selectedMenuIndex.value = 0

  try {
    const coords = view.coordsAtPos($from.pos)
    const containerRect = editorContainerRef.value?.getBoundingClientRect()
    if (containerRect) {
      const top = coords.bottom - containerRect.top + 6
      const left = Math.min(
        Math.max(16, coords.left - containerRect.left),
        Math.max(16, containerRect.width - 300)
      )
      menuPosition.value = { top: `${top}px`, left: `${left}px` }
      showSlashMenu.value = true
    }
  } catch {
    // Abaikan jika koordinat tidak ditemukan saat blur
  }
}

// Inisialisasi Tiptap Editor resmi sesuai dokumentasi tiptap.dev
const editor = useEditor({
  content: props.modelValue || '',
  editable: props.editable,
  extensions: [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3]
      }
    }),
    Placeholder.configure({
      placeholder: () =>
        props.editable
          ? "Ketik '/' untuk menu format, atau mulai menulis catatan..."
          : props.placeholder || 'Belum ada catatan untuk agenda ini.'
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        target: '_blank',
        rel: 'noopener noreferrer',
        class: 'text-kv-primary underline font-medium hover:opacity-80 transition-opacity'
      }
    }),
    Table.configure({
      resizable: true
    }),
    TableRow,
    TableHeader,
    TableCell,
    TaskList,
    TaskItem.configure({
      nested: true
    })
  ],
  editorProps: {
    attributes: {
      class:
        'px-4 py-3 sm:px-5 sm:py-4 text-sm text-foreground focus:outline-none leading-relaxed prose prose-slate dark:prose-invert max-w-none select-text'
    },
    handleKeyDown: (_view, event) => {
      if (showSlashMenu.value && filteredMenuItems.value.length > 0) {
        if (event.key === 'ArrowDown') {
          selectedMenuIndex.value = (selectedMenuIndex.value + 1) % filteredMenuItems.value.length
          scrollToSelected()
          return true
        }
        if (event.key === 'ArrowUp') {
          selectedMenuIndex.value =
            (selectedMenuIndex.value - 1 + filteredMenuItems.value.length) % filteredMenuItems.value.length
          scrollToSelected()
          return true
        }
        if (event.key === 'Enter') {
          const item = filteredMenuItems.value[selectedMenuIndex.value]
          if (item) {
            applyMenuItem(item)
            return true
          }
        }
        if (event.key === 'Escape') {
          closeSlashMenu()
          return true
        }
      }
      return false
    }
  },
  onUpdate: () => {
    emit('update:modelValue', editor.value?.getHTML() || '')
    checkSlashCommand()
  },
  onSelectionUpdate: () => {
    checkSlashCommand()
  }
})

const btnClass = (active: boolean) => [
  'p-1.5 rounded-lg text-xs transition-colors border cursor-pointer flex items-center justify-center',
  active
    ? 'bg-kv-primary text-white border-kv-primary'
    : 'bg-background hover:bg-muted text-foreground border-border'
]

watch(
  () => props.modelValue,
  (newVal) => {
    const isSame = editor.value?.getHTML() === newVal
    if (isSame) return
    editor.value?.commands.setContent(newVal || '', false)
  }
)

watch(
  () => props.editable,
  (val) => {
    editor.value?.setEditable(val)
  }
)

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style scoped>
/* Styling resmi placeholder Tiptap dengan warna keabuan lembut */
:deep(.tiptap p.is-editor-empty:first-child::before),
:deep(.tiptap p.is-empty::before) {
  color: #94a3b8 !important;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

:deep(.tiptap) {
  outline: none !important;
}

:deep(.tiptap h1) {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.3;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  color: var(--foreground);
}

:deep(.tiptap h2) {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.35;
  margin-top: 0.875rem;
  margin-bottom: 0.375rem;
  color: var(--foreground);
}

:deep(.tiptap h3) {
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.4;
  margin-top: 0.75rem;
  margin-bottom: 0.25rem;
  color: var(--foreground);
}

:deep(.tiptap blockquote) {
  border-left: 3px solid #4082e6;
  padding-left: 0.875rem;
  margin: 0.625rem 0;
  font-style: italic;
  color: var(--muted-foreground, #64748b);
  background: rgba(64, 130, 230, 0.05);
  padding-top: 0.375rem;
  padding-bottom: 0.375rem;
  border-radius: 0 0.5rem 0.5rem 0;
}

:deep(.tiptap ul:not([data-type="taskList"])) {
  list-style-type: disc;
  padding-left: 1.25rem;
  margin: 0.5rem 0;
}

:deep(.tiptap ol) {
  list-style-type: decimal;
  padding-left: 1.25rem;
  margin: 0.5rem 0;
}

:deep(.tiptap hr) {
  border: 0;
  border-top: 1px solid var(--border);
  margin: 1rem 0;
}

/* Tabel Styling */
:deep(.tiptap table) {
  border-collapse: collapse;
  margin: 1rem 0;
  overflow: hidden;
  table-layout: fixed;
  width: 100%;
  border-radius: 0.5rem;
  border: 1px solid var(--border);
}

:deep(.tiptap table td),
:deep(.tiptap table th) {
  border: 1px solid var(--border);
  box-sizing: border-box;
  min-width: 1em;
  padding: 0.5rem 0.75rem;
  position: relative;
  vertical-align: top;
  text-align: left;
}

:deep(.tiptap table th) {
  background-color: rgba(64, 130, 230, 0.08);
  font-weight: 600;
  color: var(--foreground);
}

:deep(.tiptap table .selectedCell:after) {
  background: rgba(64, 130, 230, 0.12);
  content: "";
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  pointer-events: none;
  position: absolute;
  z-index: 2;
}

/* Checklist / Task List Styling */
:deep(ul[data-type="taskList"]) {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0;
}

:deep(ul[data-type="taskList"] li) {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

:deep(ul[data-type="taskList"] li > label) {
  user-select: none;
  margin-top: 0.15rem;
  cursor: pointer;
}

:deep(ul[data-type="taskList"] li > label input[type="checkbox"]) {
  cursor: pointer;
  accent-color: #4082e6;
  width: 1rem;
  height: 1rem;
  border-radius: 0.25rem;
}

:deep(ul[data-type="taskList"] li > div) {
  flex: 1 1 auto;
}

:deep(ul[data-type="taskList"] li[data-checked="true"] > div) {
  text-decoration: line-through;
  color: var(--muted-foreground);
}
</style>

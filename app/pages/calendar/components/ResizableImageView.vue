<template>
  <NodeViewWrapper
    :class="[
      'relative my-3 flex select-none transition-all',
      alignmentClass
    ]"
  >
    <div
      ref="containerRef"
      class="group relative inline-block max-w-full"
      :style="{ width: node.attrs.width || '100%' }"
    >
      <!-- Image Element -->
      <img
        :src="node.attrs.src"
        :alt="node.attrs.alt || ''"
        class="block w-full h-auto rounded-xl border border-border shadow-xs object-cover transition-all"
        :class="{ 'ring-2 ring-kv-primary': isFocused }"
        @click="isFocused = !isFocused"
      />

      <!-- Overlay & Controls GUI saat Gambar Dihover atau Difokuskan (Hanya jika editable) -->
      <div
        v-if="editor.isEditable"
        class="transition-opacity duration-200"
        :class="isFocused ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'"
      >
        <!-- Floating Toolbar Ukuran Cepat & Alignment -->
        <div class="absolute top-2 left-1/2 -translate-x-1/2 bg-popover/95 backdrop-blur-sm border border-border rounded-xl shadow-xl px-2 py-1 flex items-center gap-1.5 z-30 text-xs">
          <!-- Preset Lebar Cepat -->
          <button
            type="button"
            @click.stop="setWidth('25%')"
            :class="presetBtnClass(node.attrs.width === '25%')"
            title="Ukuran Kecil (25%)"
          >
            25%
          </button>
          <button
            type="button"
            @click.stop="setWidth('50%')"
            :class="presetBtnClass(node.attrs.width === '50%')"
            title="Ukuran Sedang (50%)"
          >
            50%
          </button>
          <button
            type="button"
            @click.stop="setWidth('75%')"
            :class="presetBtnClass(node.attrs.width === '75%')"
            title="Ukuran Besar (75%)"
          >
            75%
          </button>
          <button
            type="button"
            @click.stop="setWidth('100%')"
            :class="presetBtnClass(!node.attrs.width || node.attrs.width === '100%')"
            title="Ukuran Penuh (100%)"
          >
            100%
          </button>

          <div class="h-3 w-px bg-border mx-0.5" />

          <!-- Alignment -->
          <button
            type="button"
            @click.stop="setAlignment('left')"
            class="p-1 rounded-md hover:bg-muted text-foreground transition-colors"
            title="Rata Kiri"
          >
            <AlignLeft class="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            @click.stop="setAlignment('center')"
            class="p-1 rounded-md hover:bg-muted text-foreground transition-colors"
            title="Rata Tengah"
          >
            <AlignCenter class="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            @click.stop="setAlignment('right')"
            class="p-1 rounded-md hover:bg-muted text-foreground transition-colors"
            title="Rata Kanan"
          >
            <AlignRight class="w-3.5 h-3.5" />
          </button>

          <div class="h-3 w-px bg-border mx-0.5" />

          <!-- Hapus Gambar -->
          <button
            type="button"
            @click.stop="deleteNode"
            class="p-1 rounded-md hover:bg-destructive/10 text-destructive transition-colors"
            title="Hapus Gambar"
          >
            <Trash2 class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Handle Drag Resize GUI di Sudut Kanan Bawah -->
        <div
          class="absolute -bottom-2 -right-2 w-4 h-4 bg-kv-primary border-2 border-background rounded-full shadow-md cursor-se-resize z-20 hover:scale-125 transition-transform"
          @mousedown.prevent.stop="startResize('se', $event)"
          title="Tarik untuk mengubah ukuran gambar"
        />

        <!-- Handle Drag Resize GUI di Sudut Kiri Bawah -->
        <div
          class="absolute -bottom-2 -left-2 w-4 h-4 bg-kv-primary border-2 border-background rounded-full shadow-md cursor-sw-resize z-20 hover:scale-125 transition-transform"
          @mousedown.prevent.stop="startResize('sw', $event)"
          title="Tarik untuk mengubah ukuran gambar"
        />
      </div>
    </div>
  </NodeViewWrapper>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3'
import { AlignLeft, AlignCenter, AlignRight, Trash2 } from 'lucide-vue-next'

const props = defineProps(nodeViewProps)

const containerRef = ref<HTMLDivElement | null>(null)
const isFocused = ref(false)

const alignmentClass = computed(() => {
  const align = props.node.attrs.alignment || 'center'
  if (align === 'left') return 'justify-start'
  if (align === 'right') return 'justify-end'
  return 'justify-center'
})

const setWidth = (width: string) => {
  props.updateAttributes({ width })
}

const setAlignment = (alignment: 'left' | 'center' | 'right') => {
  props.updateAttributes({ alignment })
}

const presetBtnClass = (active: boolean) => [
  'px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer',
  active ? 'bg-kv-primary text-white font-bold' : 'hover:bg-muted text-foreground'
]

const startResize = (direction: 'se' | 'sw', event: MouseEvent) => {
  const container = containerRef.value
  if (!container) return

  const initialWidth = container.offsetWidth
  const initialX = event.clientX
  const parentWidth = container.parentElement?.parentElement?.offsetWidth || 800

  const onMouseMove = (moveEvent: MouseEvent) => {
    const deltaX = direction === 'se' ? moveEvent.clientX - initialX : initialX - moveEvent.clientX
    const newWidthPx = Math.max(100, Math.min(parentWidth, initialWidth + deltaX))
    const newWidthPercent = Math.round((newWidthPx / parentWidth) * 100)
    props.updateAttributes({ width: `${newWidthPercent}%` })
  }

  const onMouseUp = () => {
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  }

  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}
</script>

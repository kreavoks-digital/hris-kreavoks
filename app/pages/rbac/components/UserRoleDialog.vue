<script setup lang="ts">
import { Loader2, Check } from 'lucide-vue-next'
import type { RbacUserItem, RoleItem } from '../types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { getRoleMascot } from '../utils/mascot'

const props = defineProps<{
  open: boolean
  user: RbacUserItem | null
  roles: RoleItem[]
  selectedRoleId: number | null
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void
  (e: 'update:selectedRoleId', val: number | null): void
  (e: 'save'): void
}>()

const currentSelectedId = computed({
  get: () => props.selectedRoleId,
  set: (val: number | null) => emit('update:selectedRoleId', val),
})
</script>

<template>
  <Dialog :open="open" @update:open="(val) => emit('update:open', val)">
    <DialogContent class="sm:max-w-[520px] rounded-3xl border-border bg-card p-6">
      <DialogHeader>
        <DialogTitle class="text-foreground text-lg font-semibold">
          Ubah Role User
        </DialogTitle>
        <DialogDescription class="text-muted-foreground text-sm">
          Pilih role baru untuk user ini.
        </DialogDescription>
      </DialogHeader>

      <!-- User Card Preview -->
      <div v-if="user" class="flex items-center gap-3 p-3.5 rounded-2xl border border-border bg-muted/30">
        <Avatar class="h-10 w-10 rounded-full border border-border">
          <AvatarImage :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fullName || user.email}`" />
          <AvatarFallback>{{ user.fullName ? user.fullName.charAt(0) : 'U' }}</AvatarFallback>
        </Avatar>
        <div class="flex flex-col min-w-0">
          <span class="font-medium text-foreground text-sm truncate">
            {{ user.fullName || 'User' }}
          </span>
          <span class="text-xs text-muted-foreground truncate">{{ user.email }}</span>
        </div>
      </div>

      <!-- Roles Selection List -->
      <div class="space-y-2.5 max-h-[45vh] overflow-y-auto py-2 pr-1">
        <div
          v-for="role in roles"
          :key="role.id"
          @click="currentSelectedId = role.id"
          class="flex items-start justify-between p-3.5 rounded-2xl border cursor-pointer transition-colors"
          :class="
            currentSelectedId === role.id
              ? 'border-kv-primary bg-kv-primary/5'
              : 'border-border bg-background hover:bg-muted/40'
          "
        >
          <div class="flex items-start gap-3 min-w-0">
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 overflow-hidden bg-muted/70 mt-0.5"
            >
              <img
                :src="getRoleMascot(role.name)"
                :alt="role.displayName"
                class="w-6 h-6 object-contain"
              />
            </div>

            <div class="flex flex-col min-w-0">
              <div class="flex items-center gap-2">
                <span class="font-medium text-sm text-foreground">
                  {{ role.displayName }}
                </span>
                <span class="text-xs text-muted-foreground">({{ role.name }})</span>
              </div>
              <p class="text-xs text-muted-foreground line-clamp-2 mt-1">
                {{ role.description || '-' }}
              </p>
              <div class="flex items-center gap-2 mt-2">
                <Badge variant="outline" class="rounded-xl text-xs py-0 px-2 border-border text-muted-foreground font-normal">
                  {{ role.app || 'HRIS' }}
                </Badge>
                <span class="text-xs text-muted-foreground">
                  {{ role.permissionsCount || role.permissions?.length || 0 }} permission
                </span>
              </div>
            </div>
          </div>

          <div
            v-if="currentSelectedId === role.id"
            class="w-5 h-5 rounded-full bg-kv-primary text-white flex items-center justify-center shrink-0 ml-2"
          >
            <Check class="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      <DialogFooter class="pt-3 border-t border-border">
        <Button
          type="button"
          variant="outline"
          @click="emit('update:open', false)"
          :disabled="loading"
        >
          Batal
        </Button>
        <Button
          type="button"
          @click="emit('save')"
          :disabled="loading || !currentSelectedId"
          class="bg-kv-primary hover:bg-kv-primary/90 text-white border-none"
        >
          <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
          Update Role
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

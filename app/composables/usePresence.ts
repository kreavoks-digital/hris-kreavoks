export type PresenceStatusType = 'AVAILABLE' | 'BUSY' | 'DND' | 'BE_RIGHT_BACK' | 'AWAY' | 'OFFLINE'

export interface PresenceData {
  effectiveStatus: PresenceStatusType
  customStatus: string | null
  statusMessage: string | null
  lastActiveAt: string | null
}

export interface StatusConfigItem {
  label: string
  color: string
  badgeBg: string
  text: string
}

export const STATUS_CONFIG: Record<PresenceStatusType, StatusConfigItem> = {
  AVAILABLE: {
    label: 'Available',
    color: 'bg-emerald-500',
    badgeBg: 'bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  BUSY: {
    label: 'Busy',
    color: 'bg-rose-500',
    badgeBg: 'bg-rose-500/10',
    text: 'text-rose-600 dark:text-rose-400',
  },
  DND: {
    label: 'Do not disturb',
    color: 'bg-rose-600',
    badgeBg: 'bg-rose-600/10',
    text: 'text-rose-700 dark:text-rose-300',
  },
  BE_RIGHT_BACK: {
    label: 'Be right back',
    color: 'bg-amber-500',
    badgeBg: 'bg-amber-500/10',
    text: 'text-amber-600 dark:text-amber-400',
  },
  AWAY: {
    label: 'Appear away',
    color: 'bg-amber-500',
    badgeBg: 'bg-amber-500/10',
    text: 'text-amber-600 dark:text-amber-400',
  },
  OFFLINE: {
    label: 'Appear offline',
    color: 'bg-muted-foreground/60',
    badgeBg: 'bg-muted',
    text: 'text-muted-foreground',
  },
}

export const getStatusConfig = (status?: string | null): StatusConfigItem => {
  if (status && status in STATUS_CONFIG) {
    return STATUS_CONFIG[status as PresenceStatusType]
  }
  return STATUS_CONFIG.OFFLINE
}

let heartbeatTimer: any = null
let isInitialized = false

export const usePresence = () => {
  const api = useApi()
  const { user } = useAuth()

  const presence = useState<PresenceData>('user_presence_state', () => ({
    effectiveStatus: 'AVAILABLE',
    customStatus: null,
    statusMessage: null,
    lastActiveAt: null,
  }))

  const isUpdating = useState<boolean>('user_presence_updating', () => false)

  const currentConfig = computed<StatusConfigItem>(() => {
    return getStatusConfig(presence.value.effectiveStatus)
  })

  const sendHeartbeat = async () => {
    if (!import.meta.client || !user.value) return
    if (document.visibilityState !== 'visible') return

    try {
      const res = await api('/users/presence/heartbeat', {
        method: 'POST',
      })
      if (res?.success && res.data) {
        presence.value = {
          effectiveStatus: res.data.effectiveStatus,
          customStatus: res.data.customStatus,
          statusMessage: res.data.statusMessage,
          lastActiveAt: res.data.lastActiveAt,
        }
      }
    } catch {
      // Silent error for background heartbeat
    }
  }

  const setStatus = async (status: string | null, message?: string | null) => {
    if (!user.value) return
    isUpdating.value = true
    try {
      const res = await api('/users/presence/status', {
        method: 'PATCH',
        body: {
          customStatus: status,
          statusMessage: message,
        },
      })
      if (res?.success && res.data) {
        presence.value = {
          effectiveStatus: res.data.effectiveStatus,
          customStatus: res.data.customStatus,
          statusMessage: res.data.statusMessage,
          lastActiveAt: res.data.lastActiveAt,
        }
      }
    } finally {
      isUpdating.value = false
    }
  }

  const resetStatus = async () => {
    await setStatus(null, null)
  }

  const initPresence = () => {
    if (!import.meta.client || isInitialized) return
    isInitialized = true

    // Initial heartbeat
    sendHeartbeat()

    // Heartbeat setiap 60 detik jika tab aktif
    heartbeatTimer = setInterval(() => {
      sendHeartbeat()
    }, 60000)

    // Trigger heartbeat saat tab kembali fokus/visible
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        sendHeartbeat()
      }
    })
  }

  return {
    presence,
    isUpdating,
    currentConfig,
    sendHeartbeat,
    setStatus,
    resetStatus,
    initPresence,
  }
}

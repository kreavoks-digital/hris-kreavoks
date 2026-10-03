export interface PublicProfileData {
  id: number
  email: string
  role: string
  status: string
  fullName: string
  phone: string | null
  institution: string | null
  department: string
  position: string
  npk: string
  startDate: string | null
  endDate: string | null
  lastActiveAt: string | null
  customStatus: string | null
  statusMessage: string | null
  effectiveStatus: 'AVAILABLE' | 'BUSY' | 'DND' | 'BE_RIGHT_BACK' | 'AWAY' | 'OFFLINE'
  todayAttendance: {
    status: 'PRESENT' | 'SICK' | 'PERMIT' | 'ABSENT'
    clockIn: string | null
    clockOut: string | null
    notes: string | null
  } | null
  mentors: Array<{
    id: number
    fullName: string
    position: string
    email: string
  }>
  interns: Array<{
    id: number
    fullName: string
    institution: string
    email: string
  }>
  isSelf: boolean
}

export const usePublicProfile = () => {
  const api = useApi()

  const profile = useState<PublicProfileData | null>('active_public_profile', () => null)
  const isLoading = useState<boolean>('loading_public_profile', () => false)
  const error = useState<string | null>('error_public_profile', () => null)

  const fetchProfile = async (userId: number) => {
    isLoading.value = true
    error.value = null
    try {
      const res = await api(`/users/${userId}/public-profile`)
      if (res?.success && res.data) {
        profile.value = res.data
      } else {
        error.value = 'Data profil tidak ditemukan'
      }
    } catch (err: any) {
      error.value = err?.data?.message || 'Gagal memuat profil karyawan'
      profile.value = null
    } finally {
      isLoading.value = false
    }
  }

  const clearProfile = () => {
    profile.value = null
    error.value = null
  }

  return {
    profile,
    isLoading,
    error,
    fetchProfile,
    clearProfile,
  }
}

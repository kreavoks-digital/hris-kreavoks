export interface ColleagueSearchResult {
  id: number
  email: string
  role: string
  fullName: string
  phone: string | null
  department: string
  position: string
  npk: string
  lastActiveAt: string | null
  customStatus: string | null
  statusMessage: string | null
  effectiveStatus: 'AVAILABLE' | 'BUSY' | 'DND' | 'BE_RIGHT_BACK' | 'AWAY' | 'OFFLINE'
  isSelf: boolean
}

let searchDebounceTimeout: any = null

export const useColleagueSearch = () => {
  const api = useApi()

  const searchQuery = useState<string>('colleague_search_query', () => '')
  const searchResults = useState<ColleagueSearchResult[]>('colleague_search_results', () => [])
  const isSearching = useState<boolean>('colleague_is_searching', () => false)
  const isSearchModalOpen = useState<boolean>('colleague_search_modal_open', () => false)

  const activeProfileUserId = useState<number | null>('active_profile_user_id', () => null)
  const isProfileModalOpen = useState<boolean>('colleague_profile_modal_open', () => false)

  const executeSearch = async (q: string) => {
    const trimmed = (q || '').trim()
    if (!trimmed) {
      searchResults.value = []
      isSearching.value = false
      return
    }

    isSearching.value = true
    try {
      const res = await api(`/users/search?q=${encodeURIComponent(trimmed)}`)
      if (res?.success && Array.isArray(res.data)) {
        searchResults.value = res.data
      }
    } catch {
      searchResults.value = []
    } finally {
      isSearching.value = false
    }
  }

  const handleQueryInput = (q: string) => {
    searchQuery.value = q
    if (searchDebounceTimeout) {
      clearTimeout(searchDebounceTimeout)
    }
    searchDebounceTimeout = setTimeout(() => {
      executeSearch(q)
    }, 300)
  }

  const openSearchModal = () => {
    isSearchModalOpen.value = true
  }

  const closeSearchModal = () => {
    isSearchModalOpen.value = false
  }

  const viewProfile = (userId: number) => {
    activeProfileUserId.value = userId
    isProfileModalOpen.value = true
    isSearchModalOpen.value = false
  }

  const closeProfileModal = () => {
    isProfileModalOpen.value = false
    activeProfileUserId.value = null
  }

  return {
    searchQuery,
    searchResults,
    isSearching,
    isSearchModalOpen,
    activeProfileUserId,
    isProfileModalOpen,
    handleQueryInput,
    executeSearch,
    openSearchModal,
    closeSearchModal,
    viewProfile,
    closeProfileModal,
  }
}

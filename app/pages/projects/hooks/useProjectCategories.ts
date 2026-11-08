import { ref, computed } from 'vue'

export interface ProjectCategoryItem {
  id: string
  key: string
  label: string
  description?: string
  color: string
  badgeBg: string
  badgeText: string
  isDefault?: boolean
}

const DEFAULT_CATEGORIES: ProjectCategoryItem[] = [
  {
    id: 'cat-web',
    key: 'WEB',
    label: 'Web Development',
    description: 'Aplikasi web, frontend portal, landing page, dan sistem REST API.',
    color: '#3b82f6',
    badgeBg: 'bg-blue-500/10',
    badgeText: 'text-blue-600',
    isDefault: true
  },
  {
    id: 'cat-mobile',
    key: 'MOBILE',
    label: 'Mobile SuperApp',
    description: 'Aplikasi Android & iOS, Flutter, React Native, dan Progressive Web Apps.',
    color: '#8b5cf6',
    badgeBg: 'bg-purple-500/10',
    badgeText: 'text-purple-600',
    isDefault: true
  },
  {
    id: 'cat-branding',
    key: 'BRANDING',
    label: 'Branding & Design',
    description: 'Identitas visual, desain UI/UX Figma, guideline brand, dan aset marketing.',
    color: '#f59e0b',
    badgeBg: 'bg-amber-500/10',
    badgeText: 'text-amber-600',
    isDefault: true
  },
  {
    id: 'cat-marketing',
    key: 'MARKETING',
    label: 'Digital Marketing',
    description: 'Kampanye SEO/SEM, media sosial, email blast, dan strategi pertumbuhan bisnis.',
    color: '#ec4899',
    badgeBg: 'bg-pink-500/10',
    badgeText: 'text-pink-600',
    isDefault: true
  },
  {
    id: 'cat-internal',
    key: 'INTERNAL',
    label: 'Internal HRIS & Ops',
    description: 'Sistem absensi, operasional internal, pipeline CI/CD, dan otomatisasi tools.',
    color: '#10b981',
    badgeBg: 'bg-emerald-500/10',
    badgeText: 'text-emerald-600',
    isDefault: true
  }
]

export const useProjectCategories = () => {
  const categories = useState<ProjectCategoryItem[]>('kv_shared_project_categories', () => {
    if (process.client) {
      try {
        const stored = localStorage.getItem('kv_project_categories')
        if (stored) {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed
          }
        }
      } catch {
        // fallback to default
      }
    }
    return [...DEFAULT_CATEGORIES]
  })

  // Sinkronisasi otomatis ke localStorage pada client side
  const persistCategories = (list: ProjectCategoryItem[]) => {
    categories.value = list
    if (process.client) {
      try {
        localStorage.setItem('kv_project_categories', JSON.stringify(list))
      } catch (err) {
        console.error('Failed to save project categories to localStorage:', err)
      }
    }
  }

  const addCategory = (payload: { label: string; key?: string; description?: string; color?: string }) => {
    const rawKey = payload.key?.trim()
      ? payload.key.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_')
      : payload.label.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_')

    // Hindari duplicate key
    let finalKey = rawKey
    let counter = 1
    while (categories.value.some(c => c.key === finalKey)) {
      finalKey = `${rawKey}_${counter}`
      counter++
    }

    const color = payload.color || '#6366f1'
    const newCat: ProjectCategoryItem = {
      id: `cat-${Date.now()}`,
      key: finalKey,
      label: payload.label.trim(),
      description: payload.description?.trim() || '',
      color,
      badgeBg: 'bg-primary/10',
      badgeText: 'text-primary',
      isDefault: false
    }

    persistCategories([...categories.value, newCat])
    return newCat
  }

  const updateCategory = (id: string, updates: Partial<Omit<ProjectCategoryItem, 'id' | 'isDefault'>>) => {
    const next = categories.value.map(cat => {
      if (cat.id === id) {
        return {
          ...cat,
          ...updates,
          label: updates.label?.trim() || cat.label,
          description: updates.description !== undefined ? updates.description.trim() : cat.description
        }
      }
      return cat
    })
    persistCategories(next)
  }

  const deleteCategory = (id: string): boolean => {
    const target = categories.value.find(c => c.id === id)
    if (!target) return false
    const next = categories.value.filter(c => c.id !== id)
    persistCategories(next)
    return true
  }

  const resetToDefaults = () => {
    persistCategories([...DEFAULT_CATEGORIES])
  }

  const getCategoryByKey = (key: string): ProjectCategoryItem | undefined => {
    return categories.value.find(c => c.key === key)
  }

  return {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    resetToDefaults,
    getCategoryByKey,
    defaultCategories: DEFAULT_CATEGORIES
  }
}


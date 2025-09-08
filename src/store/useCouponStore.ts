import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SearchFilters } from '@/types'

interface CouponStore {
  // State
  favorites: string[] // Array of coupon IDs
  searchFilters: SearchFilters
  recentSearches: string[]
  
  // Actions
  toggleFavorite: (couponId: string) => void
  setSearchFilters: (filters: Partial<SearchFilters>) => void
  addRecentSearch: (query: string) => void
  clearRecentSearches: () => void
  isFavorite: (couponId: string) => boolean
}

export const useCouponStore = create<CouponStore>()(
  persist(
    (set, get) => ({
      // Initial state
      favorites: [],
      searchFilters: {
        sortBy: 'newest',
        sortOrder: 'desc',
      },
      recentSearches: [],

      // Actions
      toggleFavorite: (couponId: string) => {
        const { favorites } = get()
        const newFavorites = favorites.includes(couponId)
          ? favorites.filter(id => id !== couponId)
          : [...favorites, couponId]
        
        set({ favorites: newFavorites })
      },

      setSearchFilters: (filters: Partial<SearchFilters>) => {
        set(state => ({
          searchFilters: { ...state.searchFilters, ...filters }
        }))
      },

      addRecentSearch: (query: string) => {
        if (!query.trim()) return
        
        set(state => {
          const newSearches = [query, ...state.recentSearches.filter(s => s !== query)].slice(0, 10)
          return { recentSearches: newSearches }
        })
      },

      clearRecentSearches: () => {
        set({ recentSearches: [] })
      },

      isFavorite: (couponId: string) => {
        return get().favorites.includes(couponId)
      },
    }),
    {
      name: 'coupon-store',
      partialize: (state) => ({
        favorites: state.favorites,
        recentSearches: state.recentSearches,
      }),
    }
  )
)

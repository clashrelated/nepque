'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { favoritesApi } from '@/lib/api-client'

// Global state to prevent multiple API calls
let globalFavorites: string[] = []
let isFetching = false
let lastUserId: string | null = null

export function useFavorites() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [favorites, setFavorites] = useState<string[]>(globalFavorites)
  const hasInitialized = useRef(false)

  // Only fetch favorites once when user logs in
  useEffect(() => {
    if (session?.user?.id && !hasInitialized.current && !isFetching) {
      fetchFavorites()
      hasInitialized.current = true
      lastUserId = session.user.id
    } else if (!session?.user?.id && hasInitialized.current) {
      // Clear when user logs out
      hasInitialized.current = false
      lastUserId = null
      globalFavorites = []
      setFavorites([])
    }
  }, [session?.user?.id])

  const fetchFavorites = async () => {
    if (!session?.user?.id || isFetching) return

    isFetching = true
    try {
      const data = await favoritesApi.list()
      
      if (data.success) {
        const favoriteIds = data.data.map((fav: { coupon: { id: string } }) => fav.coupon.id)
        globalFavorites = favoriteIds
        setFavorites(favoriteIds)
      }
    } catch (error) {
      console.error('Error fetching favorites:', error)
    } finally {
      isFetching = false
    }
  }

  const toggleFavorite = async (couponId: string) => {
    if (!session?.user?.id) {
      toast.error('Please sign in to save favorites')
      return false
    }

    setLoading(true)
    try {
      const isCurrentlyFavorite = globalFavorites.includes(couponId)
      
      if (isCurrentlyFavorite) {
        // Remove from favorites
        const data = await favoritesApi.remove(couponId)
        
        if (data.success) {
          globalFavorites = globalFavorites.filter(id => id !== couponId)
          setFavorites(globalFavorites)
          toast.success('Removed from favorites')
          return false
        } else {
          toast.error(data.message || 'Failed to remove from favorites')
          return isCurrentlyFavorite
        }
      } else {
        // Add to favorites
        const data = await favoritesApi.add(couponId)
        
        if (data.success) {
          globalFavorites = [...globalFavorites, couponId]
          setFavorites(globalFavorites)
          toast.success('Added to favorites')
          return true
        } else {
          toast.error(data.message || 'Failed to add to favorites')
          return isCurrentlyFavorite
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error(error instanceof Error ? error.message : 'An error occurred')
      return globalFavorites.includes(couponId)
    } finally {
      setLoading(false)
    }
  }

  const isFavorite = (couponId: string) => {
    return globalFavorites.includes(couponId)
  }

  return {
    favorites,
    loading,
    toggleFavorite,
    isFavorite,
    fetchFavorites
  }
}

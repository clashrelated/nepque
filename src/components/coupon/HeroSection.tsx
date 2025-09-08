'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Sparkles, TrendingUp, Users, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useCouponStore } from '@/store/useCouponStore'

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('')
  const { addRecentSearch } = useCouponStore()
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      addRecentSearch(searchQuery.trim())
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16 lg:py-24">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-50">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmM2Y0ZjYiIGZpbGwtb3BhY2l0eT0iMC40Ij48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')]"></div>
      </div>
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 mb-6">
            <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
              <Sparkles className="h-4 w-4 mr-2" />
              New: Get 10% Extra Cashback
            </Badge>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
            Save Money with
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Amazing Coupons
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover thousands of verified coupons, deals, and cashback offers from your favorite brands. 
            Start saving today!
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for coupons, brands, or deals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-32 py-4 text-lg h-14 rounded-full border-2 border-gray-200 focus:border-blue-500"
              />
              <Button 
                type="submit" 
                size="lg" 
                className="absolute right-2 top-2 h-10 px-6 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Search
              </Button>
            </div>
          </form>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">1K+</div>
              <div className="text-sm text-gray-600">Coupons Saved</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">100+</div>
              <div className="text-sm text-gray-600">Active Deals</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">5K+</div>
              <div className="text-sm text-gray-600">Happy Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-1">Rs500</div>
              <div className="text-sm text-gray-600">Avg. Savings</div>
            </div>
          </div>

          {/* CTA Buttons - removed per request */}

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-gray-500">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
              <span className="text-sm">4.9/5 Rating</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Verified Coupons</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm">24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

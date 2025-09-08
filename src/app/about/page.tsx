'use client'

import Layout from '@/components/layout/Layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShieldCheck, Sparkles, Users, Rocket, CheckCircle2, HandHeart, TrendingUp, Star } from 'lucide-react'

export default function AboutPage() {
  return (
    <Layout>
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-white/70 blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 backdrop-blur ring-1 ring-white/20 mb-5">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm">Verified coupons • Clean experience • Real savings</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">About NepQue</h1>
            <p className="text-white/90 text-lg max-w-3xl mx-auto">
              Smart savings made simple. Discover verified coupons and curated deals from top brands in Nepal and beyond.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-10 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="shadow-xl bg-white/70 backdrop-blur hover:shadow-2xl transition-all duration-200 ring-1 ring-black/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold">Our Mission</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Save people time and money through a fast, clean, and trustworthy coupon experience. We focus on real
                value, transparency, and a delightful, ad-light interface.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-xl bg-white/70 backdrop-blur hover:shadow-2xl transition-all duration-200 ring-1 ring-black/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Rocket className="h-5 w-5 text-purple-600" />
                <h2 className="text-xl font-semibold">How It Works</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                We collaborate with brands and the community to keep our library fresh. Sponsored placements are marked
                clearly. Users can submit brands and coupons for review from the submit page.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-xl bg-white/70 backdrop-blur hover:shadow-2xl transition-all duration-200 ring-1 ring-black/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Users className="h-5 w-5 text-pink-600" />
                <h2 className="text-xl font-semibold">Contact</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Have a partnership idea or found an issue? Reach out via our social links in the footer. We’re happy to help.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-5xl mx-auto mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow hover:shadow-lg transition-shadow bg-white/80 backdrop-blur ring-1 ring-black/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <h3 className="text-lg font-semibold">Verified & Fresh</h3>
              </div>
              <p className="text-gray-600">Active deals curated daily. Expired codes are pruned quickly.</p>
            </CardContent>
          </Card>
          <Card className="shadow hover:shadow-lg transition-shadow bg-white/80 backdrop-blur ring-1 ring-black/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-5 w-5 text-amber-500" />
                <h3 className="text-lg font-semibold">Clean Experience</h3>
              </div>
              <p className="text-gray-600">Fast UI, minimal clutter, and clear labels on sponsored placements.</p>
            </CardContent>
          </Card>
          <Card className="shadow hover:shadow-lg transition-shadow bg-white/80 backdrop-blur ring-1 ring-black/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <HandHeart className="h-5 w-5 text-rose-600" />
                <h3 className="text-lg font-semibold">Community Driven</h3>
              </div>
              <p className="text-gray-600">Users can submit brands and coupons; admins review for quality.</p>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-5xl mx-auto mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-sm hover:shadow-md transition-shadow bg-white/90 backdrop-blur ring-1 ring-black/5">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">1,000+</div>
              <div className="text-gray-600">Verified Coupons</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm hover:shadow-md transition-shadow bg-white/90 backdrop-blur ring-1 ring-black/5">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">100+</div>
              <div className="text-gray-600">Partner Brands</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm hover:shadow-md transition-shadow bg-white/90 backdrop-blur ring-1 ring-black/5">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">Rs 10L+</div>
              <div className="text-gray-600">Estimated Savings</div>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-5xl mx-auto mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow hover:shadow-lg transition-shadow bg-white/80 backdrop-blur ring-1 ring-black/5">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Why Trust NepQue?</h3>
              <ul className="list-disc pl-5 text-gray-600 space-y-1">
                <li>Clear disclosure of sponsored placements</li>
                <li>User-first design and consistent moderation</li>
                <li>Security best practices for accounts and data</li>
                <li>Transparent policies across the site</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="shadow hover:shadow-lg transition-shadow bg-white/80 backdrop-blur ring-1 ring-black/5">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Partner With Us</h3>
              <p className="text-gray-600 mb-3">Promote your offers with sponsored placements and featured rails.</p>
              <p className="text-gray-600">Contact us via the footer links to discuss partnerships and campaigns.</p>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-5xl mx-auto mt-12">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl">
            <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-5 w-5" />
                  <span className="uppercase tracking-wide text-xs text-white/80">For Brands</span>
                </div>
                <h3 className="text-2xl font-semibold">Get discovered by shoppers ready to save</h3>
                <p className="text-white/90 mt-1">Feature your offers with sponsored placements and performance-focused campaigns.</p>
              </div>
                    <Button asChild variant="secondary"><a href="/partner">Partner with NepQue</a></Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}



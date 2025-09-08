import Link from 'next/link'
import { Facebook, Twitter, Instagram, Mail, Phone } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl [font-family:var(--font-logo)]">NepQue</span>
            </div>
            <p className="text-gray-400 text-sm">
              Your ultimate destination for the best coupons, deals, and cashback offers. 
              Save money on your favorite brands with our verified discount codes.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
              <Twitter className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
              <Instagram className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/coupons" className="text-gray-400 hover:text-white transition-colors">
                  All Coupons
                </Link>
              </li>
              <li>
                <Link href="/brands" className="text-gray-400 hover:text-white transition-colors">
                  Popular Brands
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-gray-400 hover:text-white transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/deals" className="text-gray-400 hover:text-white transition-colors">
                  Hot Deals
                </Link>
              </li>
              <li>
                <Link href="/cashback" className="text-gray-400 hover:text-white transition-colors">
                  Cashback
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/category/electronics" className="text-gray-400 hover:text-white transition-colors">
                  Electronics
                </Link>
              </li>
              <li>
                <Link href="/category/fashion" className="text-gray-400 hover:text-white transition-colors">
                  Fashion
                </Link>
              </li>
              <li>
                <Link href="/category/home-garden" className="text-gray-400 hover:text-white transition-colors">
                  Home & Garden
                </Link>
              </li>
              <li>
                <Link href="/category/beauty" className="text-gray-400 hover:text-white transition-colors">
                  Beauty
                </Link>
              </li>
              <li>
                <Link href="/category/food" className="text-gray-400 hover:text-white transition-colors">
                  Food & Dining
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400">support@nepque.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400">+977 (982) 366 3833</span>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors block">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors block">
                Terms of Service
              </Link>
              <Link href="/about" className="text-gray-400 hover:text-white transition-colors block">
                About Us
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 NepQue. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm mt-2 md:mt-0">
              DISCLOSURE: We may earn a commission when you use one of our coupons/links to make a purchase.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

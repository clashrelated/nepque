'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Layout from '@/components/layout/Layout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Shield, Edit, Save, X } from 'lucide-react'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'

interface UserStats {
  favoriteCoupons: number
  usedCoupons: number
  totalSavings: number
}

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [stats, setStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || '')
      setEmail(session.user.email || '')
      fetchUserStats()
    }
  }, [session])

  const fetchUserStats = async () => {
    if (!session?.user?.id) return

    try {
      const response = await fetch(`/api/user/stats?userId=${session.user.id}`)
      const data = await response.json()
      
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
    }
  }

  const handleSave = async () => {
    if (!session?.user?.id) return

    setIsLoading(true)
    try {
      const data = await apiClient.put('/api/user/profile', { name, email })

      if ((data as any).success) {
        await update({ name })
        toast.success('Profile updated successfully')
        setIsEditing(false)
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const msg = (data as any).message || 'Failed to update profile'
        toast.error(msg)
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setName(session?.user?.name || '')
    setEmail(session?.user?.email || '')
    setIsEditing(false)
  }

  if (!session?.user) return null

  const userInitials = session.user.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'U'

  return (
    <ProtectedRoute>
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
              <p className="text-gray-600">Manage your account settings and preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Information */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription>
                          Update your personal information
                        </CardDescription>
                      </div>
                      {!isEditing ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditing(true)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      ) : (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={isLoading}
                          >
                            <Save className="h-4 w-4 mr-2" />
                            {isLoading ? 'Saving...' : 'Save'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancel}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={session.user.image || ''} />
                        <AvatarFallback className="text-lg">{userInitials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-semibold">{session.user.name}</h3>
                        <p className="text-gray-600">{session.user.email}</p>
                        <Badge variant="secondary" className="mt-2">
                          <Shield className="h-3 w-3 mr-1" />
                          {session.user.role?.toLowerCase() || 'user'}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Stats and Quick Actions */}
              <div className="space-y-6">
                {/* User Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>Your Activity</CardTitle>
                    <CardDescription>
                      Track your coupon usage and savings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {stats ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Favorite Coupons</span>
                          <span className="font-semibold">{stats.favoriteCoupons}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Used Coupons</span>
                          <span className="font-semibold">{stats.usedCoupons}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Estimated Savings</span>
                          <span className="font-semibold text-green-600">
                            Rs {stats.totalSavings.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <div className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href="/favorites">
                        <User className="h-4 w-4 mr-2" />
                        View Favorites
                      </a>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href="/coupons">
                        <Mail className="h-4 w-4 mr-2" />
                        Browse Coupons
                      </a>
                    </Button>
                    {(session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN') && (
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <a href="/admin">
                          <Shield className="h-4 w-4 mr-2" />
                          Admin Dashboard
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Layout from '@/components/layout/Layout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Database, 
  Trash2, 
  Download, 
  Save, 
  Eye,
  EyeOff,
  Moon,
  Sun,
  Monitor
} from 'lucide-react'
import { toast } from 'sonner'

interface UserSettings {
  // Account Settings
  name: string
  email: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
  
  // Notification Settings
  emailNotifications: boolean
  pushNotifications: boolean
  dealAlerts: boolean
  priceDrops: boolean
  newCoupons: boolean
  weeklyDigest: boolean
  
  // Privacy Settings
  profileVisibility: 'public' | 'private' | 'friends'
  showFavorites: boolean
  showActivity: boolean
  allowDataCollection: boolean
  
  // Appearance Settings
  theme: 'light' | 'dark' | 'system'
  language: string
  currency: string
  timezone: string
  
  // Data Settings
  exportData: boolean
  deleteAccount: boolean
}

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const [settings, setSettings] = useState<UserSettings>({
    // Account Settings
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    dealAlerts: true,
    priceDrops: false,
    newCoupons: true,
    weeklyDigest: true,
    
    // Privacy Settings
    profileVisibility: 'public',
    showFavorites: true,
    showActivity: false,
    allowDataCollection: true,
    
    // Appearance Settings
    theme: 'system',
    language: 'en',
    currency: 'NPR',
    timezone: 'UTC',
    
    // Data Settings
    exportData: false,
    deleteAccount: false,
  })
  
  const [loading, setLoading] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  useEffect(() => {
    if (session?.user) {
      setSettings(prev => ({
        ...prev,
        name: session.user.name || '',
        email: session.user.email || '',
      }))
      loadUserSettings()
    }
  }, [session])

  const loadUserSettings = async () => {
    try {
      const response = await fetch('/api/user/settings')
      const data = await response.json()
      
      if (data.success && data.data.settings) {
        const savedSettings = data.data.settings
        setSettings(prev => ({
          ...prev,
          ...savedSettings
        }))
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  const handleInputChange = (field: keyof UserSettings, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const saveSettings = async (settingsToSave: Partial<UserSettings>) => {
    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          settings: settingsToSave,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Settings saved successfully')
        return true
      } else {
        toast.error(data.message || 'Failed to save settings')
        return false
      }
    } catch (error) {
      toast.error('Failed to save settings')
      return false
    }
  }

  const handleSaveAccount = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: settings.name,
          email: settings.email,
        }),
      })

      const data = await response.json()

      if (data.success) {
        await update({ name: settings.name })
        toast.success('Account settings saved successfully')
      } else {
        toast.error(data.message || 'Failed to save account settings')
      }
    } catch (error) {
      toast.error('An error occurred while saving settings')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (settings.newPassword !== settings.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (settings.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/user/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: settings.currentPassword,
          newPassword: settings.newPassword,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Password changed successfully')
        setSettings(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }))
      } else {
        toast.error(data.message || 'Failed to change password')
      }
    } catch (error) {
      toast.error('Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const handleExportData = async () => {
    setLoading(true)
    try {
      // In a real implementation, you'd generate and download user data
      toast.success('Data export started. You will receive an email when ready.')
    } catch (error) {
      toast.error('Failed to export data')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }

    setLoading(true)
    try {
      // In a real implementation, you'd call a delete account API
      toast.success('Account deletion request submitted')
    } catch (error) {
      toast.error('Failed to delete account')
    } finally {
      setLoading(false)
    }
  }

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
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
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600">Manage your account settings and preferences</p>
            </div>

            <div className="space-y-8">
              {/* Account Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Account Settings
                  </CardTitle>
                  <CardDescription>
                    Manage your personal information and account details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={session.user.image || ''} />
                      <AvatarFallback className="text-lg">{userInitials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold">{session.user.name}</h3>
                      <p className="text-gray-600">{session.user.email}</p>
                      <Badge variant="secondary" className="mt-1">
                        {session.user.role?.toLowerCase() || 'user'}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={settings.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={settings.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <Button onClick={handleSaveAccount} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardContent>
              </Card>

              {/* Password Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Password & Security
                  </CardTitle>
                  <CardDescription>
                    Update your password and security settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPasswords.current ? 'text' : 'password'}
                        value={settings.currentPassword}
                        onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                        placeholder="Enter current password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => togglePasswordVisibility('current')}
                      >
                        {showPasswords.current ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPasswords.new ? 'text' : 'password'}
                        value={settings.newPassword}
                        onChange={(e) => handleInputChange('newPassword', e.target.value)}
                        placeholder="Enter new password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => togglePasswordVisibility('new')}
                      >
                        {showPasswords.new ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={settings.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        placeholder="Confirm new password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => togglePasswordVisibility('confirm')}
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button onClick={handleChangePassword} disabled={loading}>
                    <Shield className="h-4 w-4 mr-2" />
                    {loading ? 'Changing...' : 'Change Password'}
                  </Button>
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="h-5 w-5 mr-2" />
                    Notifications
                  </CardTitle>
                  <CardDescription>
                    Choose what notifications you want to receive
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-500">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => handleInputChange('emailNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-gray-500">
                        Receive push notifications in your browser
                      </p>
                    </div>
                    <Switch
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => handleInputChange('pushNotifications', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Notification Types</h4>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Deal Alerts</Label>
                        <p className="text-sm text-gray-500">
                          Get notified about new exclusive deals
                        </p>
                      </div>
                      <Switch
                        checked={settings.dealAlerts}
                        onCheckedChange={(checked) => handleInputChange('dealAlerts', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Price Drops</Label>
                        <p className="text-sm text-gray-500">
                          Get notified when prices drop on your favorite items
                        </p>
                      </div>
                      <Switch
                        checked={settings.priceDrops}
                        onCheckedChange={(checked) => handleInputChange('priceDrops', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>New Coupons</Label>
                        <p className="text-sm text-gray-500">
                          Get notified about new coupons from your favorite brands
                        </p>
                      </div>
                      <Switch
                        checked={settings.newCoupons}
                        onCheckedChange={(checked) => handleInputChange('newCoupons', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Weekly Digest</Label>
                        <p className="text-sm text-gray-500">
                          Receive a weekly summary of the best deals
                        </p>
                      </div>
                      <Switch
                        checked={settings.weeklyDigest}
                        onCheckedChange={(checked) => handleInputChange('weeklyDigest', checked)}
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={() => saveSettings({
                      emailNotifications: settings.emailNotifications,
                      pushNotifications: settings.pushNotifications,
                      dealAlerts: settings.dealAlerts,
                      priceDrops: settings.priceDrops,
                      newCoupons: settings.newCoupons,
                      weeklyDigest: settings.weeklyDigest,
                    })}
                    disabled={loading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Notification Settings'}
                  </Button>
                </CardContent>
              </Card>

              {/* Privacy Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Privacy & Security
                  </CardTitle>
                  <CardDescription>
                    Control your privacy and data sharing preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Profile Visibility</Label>
                    <Select
                      value={settings.profileVisibility}
                      onValueChange={(value) => handleInputChange('profileVisibility', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="friends">Friends Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Favorites</Label>
                      <p className="text-sm text-gray-500">
                        Allow others to see your favorite coupons
                      </p>
                    </div>
                    <Switch
                      checked={settings.showFavorites}
                      onCheckedChange={(checked) => handleInputChange('showFavorites', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Activity</Label>
                      <p className="text-sm text-gray-500">
                        Allow others to see your coupon usage activity
                      </p>
                    </div>
                    <Switch
                      checked={settings.showActivity}
                      onCheckedChange={(checked) => handleInputChange('showActivity', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Data Collection</Label>
                      <p className="text-sm text-gray-500">
                        Allow us to collect anonymous usage data to improve our service
                      </p>
                    </div>
                    <Switch
                      checked={settings.allowDataCollection}
                      onCheckedChange={(checked) => handleInputChange('allowDataCollection', checked)}
                    />
                  </div>

                  <Button 
                    onClick={() => saveSettings({
                      profileVisibility: settings.profileVisibility,
                      showFavorites: settings.showFavorites,
                      showActivity: settings.showActivity,
                      allowDataCollection: settings.allowDataCollection,
                    })}
                    disabled={loading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Privacy Settings'}
                  </Button>
                </CardContent>
              </Card>

              {/* Appearance Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Palette className="h-5 w-5 mr-2" />
                    Appearance
                  </CardTitle>
                  <CardDescription>
                    Customize the look and feel of your experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <Select
                      value={settings.theme}
                      onValueChange={(value) => handleInputChange('theme', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">
                          <div className="flex items-center">
                            <Sun className="h-4 w-4 mr-2" />
                            Light
                          </div>
                        </SelectItem>
                        <SelectItem value="dark">
                          <div className="flex items-center">
                            <Moon className="h-4 w-4 mr-2" />
                            Dark
                          </div>
                        </SelectItem>
                        <SelectItem value="system">
                          <div className="flex items-center">
                            <Monitor className="h-4 w-4 mr-2" />
                            System
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Language</Label>
                      <Select
                        value={settings.language}
                        onValueChange={(value) => handleInputChange('language', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="ne" disabled>Nepali (coming soon)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Currency</Label>
                      <Select
                        value={settings.currency}
                        onValueChange={(value) => handleInputChange('currency', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NPR">NPR (Rs)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    onClick={() => saveSettings({
                      theme: settings.theme,
                      language: settings.language,
                      currency: settings.currency,
                      timezone: settings.timezone,
                    })}
                    disabled={loading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Appearance Settings'}
                  </Button>
                </CardContent>
              </Card>

              {/* Data Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="h-5 w-5 mr-2" />
                    Data Management
                  </CardTitle>
                  <CardDescription>
                    Manage your data and account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Export Data</Label>
                      <p className="text-sm text-gray-500">
                        Download a copy of your data
                      </p>
                    </div>
                    <Button variant="outline" onClick={handleExportData} disabled={loading}>
                      <Download className="h-4 w-4 mr-2" />
                      Export Data
                    </Button>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-red-600">Delete Account</Label>
                      <p className="text-sm text-gray-500">
                        Permanently delete your account and all data
                      </p>
                    </div>
                    <Button 
                      variant="destructive" 
                      onClick={handleDeleteAccount} 
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
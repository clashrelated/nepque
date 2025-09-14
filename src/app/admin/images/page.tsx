'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Upload, 
  Copy, 
  Trash2, 
  Download, 
  Filter,
  Grid3X3,
  List,
  Loader2,
  Image as ImageIcon,
  Folder,
  Calendar,
  FileText,
  X
} from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import ImageUpload from '@/components/admin/ImageUpload'

interface ImageData {
  url: string
  filename: string
  size: number
  uploadedAt: string
  contentType: string
}

interface PaginationData {
  hasMore: boolean
  nextCursor: string | null
}

export default function AdminImagesPage() {
  const [images, setImages] = useState<ImageData[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFolder, setSelectedFolder] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [pagination, setPagination] = useState<PaginationData>({ hasMore: false, nextCursor: null })
  const [showUpload, setShowUpload] = useState(false)

  const folders = [
    { value: '', label: 'All Folders' },
    { value: 'general', label: 'General' },
    { value: 'brands', label: 'Brands' },
    { value: 'categories', label: 'Categories' },
    { value: 'coupons', label: 'Coupons' },
    { value: 'banners', label: 'Banners' }
  ]

  useEffect(() => {
    fetchImages()
  }, [selectedFolder])

  const fetchImages = async (cursor?: string) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedFolder) params.append('folder', selectedFolder)
      if (cursor) params.append('cursor', cursor)
      params.append('limit', '20')

      const response = await fetch(`/api/admin/images?${params}`)
      const data = await response.json()

      if (data.success) {
        if (cursor) {
          setImages(prev => [...prev, ...data.data.images])
        } else {
          setImages(data.data.images)
        }
        setPagination(data.data.pagination)
      } else {
        toast.error(data.error || 'Failed to fetch images')
      }
    } catch (error) {
      console.error('Error fetching images:', error)
      toast.error('Failed to fetch images')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (imageUrl: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return

    try {
      const response = await fetch(`/api/admin/images/delete?url=${encodeURIComponent(imageUrl)}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        setImages(prev => prev.filter(img => img.url !== imageUrl))
        toast.success('Image deleted successfully')
      } else {
        toast.error(data.error || 'Failed to delete image')
      }
    } catch (error) {
      console.error('Error deleting image:', error)
      toast.error('Failed to delete image')
    }
  }

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('URL copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy URL')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredImages = images.filter(img => 
    img.filename.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleImageUploaded = (url: string) => {
    setShowUpload(false)
    fetchImages() // Refresh the list
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Image Management</h1>
          <p className="text-gray-600">Upload, manage, and organize your images</p>
        </div>
        <Button onClick={() => setShowUpload(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Image
        </Button>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Upload New Image</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowUpload(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <ImageUpload onImageUploaded={handleImageUploaded} />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search images..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedFolder} onValueChange={setSelectedFolder}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Select folder" />
              </SelectTrigger>
              <SelectContent>
                {folders.map(folder => (
                  <SelectItem key={folder.value} value={folder.value}>
                    {folder.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Images Grid/List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : filteredImages.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No images found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery ? 'Try adjusting your search terms' : 'Upload your first image to get started'}
            </p>
            <Button onClick={() => setShowUpload(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Image
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredImages.map((image) => (
                <Card key={image.url} className="overflow-hidden">
                  <div className="aspect-square relative">
                    <Image
                      src={image.url}
                      alt={image.filename}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => copyToClipboard(image.url)}
                        className="h-8 w-8 p-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(image.url)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <p className="text-sm font-medium text-gray-900 truncate mb-1">
                      {image.filename.split('/').pop()}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{formatFileSize(image.size)}</span>
                      <span>{formatDate(image.uploadedAt)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Image
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Filename
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Size
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Uploaded
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredImages.map((image) => (
                        <tr key={image.url}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-16 h-16 relative">
                              <Image
                                src={image.url}
                                alt={image.filename}
                                fill
                                className="object-cover rounded"
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {image.filename.split('/').pop()}
                            </div>
                            <div className="text-sm text-gray-500">
                              {image.filename.split('/').slice(0, -1).join('/') || 'Root'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatFileSize(image.size)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(image.uploadedAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyToClipboard(image.url)}
                              >
                                <Copy className="h-4 w-4 mr-1" />
                                Copy
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(image.url)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Load More */}
          {pagination.hasMore && (
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => fetchImages(pagination.nextCursor || undefined)}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Load More
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

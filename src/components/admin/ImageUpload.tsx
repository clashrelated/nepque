'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Upload, X, Check, Copy, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

interface ImageUploadProps {
  onImageUploaded?: (url: string) => void
  folder?: string
  className?: string
}

export default function ImageUpload({ onImageUploaded, folder = 'general', className }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState(folder)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', selectedFolder)

    try {
      const response = await fetch('/api/admin/images/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setUploadedImage(data.data.url)
        onImageUploaded?.(data.data.url)
        toast.success('Image uploaded successfully!')
      } else {
        toast.error(data.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
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

  const resetUpload = () => {
    setUploadedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Upload Image</CardTitle>
      </CardHeader>
      <CardContent>
        {!uploadedImage ? (
          <div className="space-y-4">
            {/* Folder Selection */}
            <div className="space-y-2">
              <Label htmlFor="folder">Upload to folder</Label>
              <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                <SelectTrigger>
                  <SelectValue placeholder="Select folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="brands">Brands</SelectItem>
                  <SelectItem value="categories">Categories</SelectItem>
                  <SelectItem value="coupons">Coupons</SelectItem>
                  <SelectItem value="banners">Banners</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
            >
              {uploading ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Uploading...
                  </p>
                </div>
              ) : (
                <>
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Drop your image here, or click to browse
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    PNG, JPG, WEBP, GIF, SVG up to 10MB
                  </p>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    disabled={uploading}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    Choose File
                  </Button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <Image
                src={uploadedImage}
                alt="Uploaded image"
                width={300}
                height={200}
                className="rounded-lg object-cover w-full"
              />
              <Button
                size="sm"
                variant="destructive"
                className="absolute top-2 right-2"
                onClick={resetUpload}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label>Image URL</Label>
              <div className="flex gap-2">
                <Input
                  value={uploadedImage}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(uploadedImage)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={resetUpload} variant="outline" className="flex-1">
                Upload Another
              </Button>
              <Button onClick={() => copyToClipboard(uploadedImage)} className="flex-1">
                <Copy className="h-4 w-4 mr-2" />
                Copy URL
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

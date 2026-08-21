'use client'

import React, { useState, useRef } from 'react'
import {
  Sparkles,
  Upload,
  User,
  Check,
  Image as ImageIcon,
  RotateCcw,
  AlertCircle,
  Stethoscope,
  Heart,
} from 'lucide-react'
import {
  AvatarPreset,
  PATIENT_AVATARS,
  DOCTOR_AVATARS,
} from '@/lib/avatars/avatarPresets'
import { Avatar } from '@/components/ui/Avatar'

interface AvatarPickerProps {
  currentAvatar?: string
  name: string
  role: 'PATIENT' | 'DOCTOR'
  onSelect: (avatarUrl: string) => void
  allowDeviceUpload?: boolean
}

// Client-side image compression for device uploads
async function compressImageFile(file: File, maxSize = 240, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Failed to read file from device.'))
    reader.onload = (e) => {
      const img = new Image()
      img.onerror = () => reject(new Error('Invalid image file format.'))
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // Calculate aspect ratio fit into maxSize x maxSize square
        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width)
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height)
            height = maxSize
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('Canvas context unavailable'))

        ctx.drawImage(img, 0, 0, width, height)
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality)
        resolve(compressedBase64)
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

export function AvatarPicker({
  currentAvatar,
  name,
  role,
  onSelect,
  allowDeviceUpload = true,
}: AvatarPickerProps) {
  const [selectedUrl, setSelectedUrl] = useState<string>(currentAvatar || '')
  const [genderFilter, setGenderFilter] = useState<'all' | 'female' | 'male'>('all')
  const [activeTab, setActiveTab] = useState<'presets' | 'device'>('presets')
  const [uploadError, setUploadError] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const presets = role === 'DOCTOR' ? DOCTOR_AVATARS : PATIENT_AVATARS
  const filteredPresets = presets.filter((p) => {
    if (genderFilter === 'all') return true
    return p.gender === genderFilter
  })

  const handlePresetSelect = (dataUri: string) => {
    setSelectedUrl(dataUri)
    onSelect(dataUri)
    setUploadError('')
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WebP).')
      return
    }

    // Limit original file size to 10MB
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image is too large. Please select an image under 10MB.')
      return
    }

    try {
      setIsProcessing(true)
      setUploadError('')
      const compressedDataUri = await compressImageFile(file)
      setSelectedUrl(compressedDataUri)
      onSelect(compressedDataUri)
    } catch (err: any) {
      setUploadError(err?.message || 'Error processing uploaded image.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRemoveAvatar = () => {
    setSelectedUrl('')
    onSelect('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="space-y-4">
      {/* Current Preview Banner */}
      <div className="flex items-center gap-4 p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
        <Avatar src={selectedUrl} name={name} size="xl" className="shadow-sm ring-2 ring-white" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-slate-800 truncate">
            {name || (role === 'DOCTOR' ? 'Doctor Profile' : 'Patient Profile')}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {selectedUrl ? 'Custom avatar chosen' : 'Using initials avatar placeholder'}
          </p>

          {selectedUrl && (
            <button
              type="button"
              onClick={handleRemoveAvatar}
              className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:text-red-700 hover:underline"
            >
              <RotateCcw className="h-3 w-3" />
              Reset to initials
            </button>
          )}
        </div>
      </div>

      {/* Tabs: System Presets vs Upload from Device */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'presets'
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Built-in Avatars
          </button>

          {allowDeviceUpload && (
            <button
              type="button"
              onClick={() => setActiveTab('device')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'device'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Upload className="h-3.5 w-3.5" />
              Upload from Device
            </button>
          )}
        </div>

        {activeTab === 'presets' && (
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
            {(['all', 'female', 'male'] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGenderFilter(g)}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold capitalize transition-all ${
                  genderFilter === g
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Preset Grid */}
      {activeTab === 'presets' && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 max-h-56 overflow-y-auto p-1">
          {filteredPresets.map((preset) => {
            const isSelected = selectedUrl === preset.dataUri
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetSelect(preset.dataUri)}
                className={`group relative p-1.5 rounded-2xl border transition-all flex flex-col items-center gap-1 text-center ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'
                }`}
              >
                <div className="relative w-12 h-12 rounded-full overflow-hidden">
                  <img
                    src={preset.dataUri}
                    alt={preset.label}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-blue-600/30 flex items-center justify-center backdrop-blur-[0.5px]">
                      <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-medium text-slate-600 line-clamp-1">
                  {preset.label}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* Device Upload Panel */}
      {activeTab === 'device' && (
        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp, image/gif"
            onChange={handleFileUpload}
            className="hidden"
            id="device-avatar-input"
          />

          <label
            htmlFor="device-avatar-input"
            className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/60 hover:bg-blue-50/30 transition-all rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer text-center group"
          >
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 group-hover:text-blue-600 group-hover:scale-105 transition-all mb-2">
              <Upload className="h-6 w-6" />
            </div>

            <p className="text-xs font-bold text-slate-800">
              {isProcessing ? 'Processing image...' : 'Choose image from your computer or phone'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Supports PNG, JPG, or WebP. Automatically optimized & compressed for fast loading.
            </p>
          </label>

          {uploadError && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

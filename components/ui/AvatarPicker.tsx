'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  Sparkles,
  Upload,
  User,
  Check,
  RotateCcw,
  RotateCw,
  AlertCircle,
  ZoomIn,
  ZoomOut,
  Crop,
  X,
  Camera,
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

// ─────────────────────────────────────────────────────────────────────────────
// Interactive Avatar Crop Modal
// ─────────────────────────────────────────────────────────────────────────────
interface ImageCropModalProps {
  imageSrc: string
  isOpen: boolean
  onClose: () => void
  onCropComplete: (croppedDataUrl: string) => void
}

function ImageCropModal({ imageSrc, isOpen, onClose, onCropComplete }: ImageCropModalProps) {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Reset controls when a new image is loaded
  useEffect(() => {
    if (isOpen) {
      setZoom(1)
      setRotation(0)
      setPosition({ x: 0, y: 0 })
    }
  }, [isOpen, imageSrc])

  // Mouse & Touch Drag Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false)
    try {
      ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {}
  }

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  // Export cropped circle using HTML5 Canvas
  const handleApplyCrop = () => {
    const img = imageRef.current
    if (!img) return

    const outputSize = 400
    const canvas = document.createElement('canvas')
    canvas.width = outputSize
    canvas.height = outputSize
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    // Smooth quality
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    // Create circular clip path
    ctx.beginPath()
    ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()

    // Move origin to center of canvas
    ctx.translate(outputSize / 2, outputSize / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.scale(zoom, zoom)

    // Calculate crop offset scale ratio
    const viewportSize = 240 // The preview diameter in DOM
    const scaleRatio = outputSize / viewportSize

    const drawX = position.x * scaleRatio
    const drawY = position.y * scaleRatio

    // Draw scaled image centered
    const imgWidth = (img.naturalWidth / img.naturalHeight >= 1 ? viewportSize * (img.naturalWidth / img.naturalHeight) : viewportSize) * scaleRatio
    const imgHeight = (img.naturalHeight / img.naturalWidth >= 1 ? viewportSize * (img.naturalHeight / img.naturalWidth) : viewportSize) * scaleRatio

    ctx.drawImage(img, -imgWidth / 2 + drawX, -imgHeight / 2 + drawY, imgWidth, imgHeight)

    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.9)
    onCropComplete(croppedDataUrl)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Crop className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Crop & Adjust Avatar</h3>
              <p className="text-[11px] text-slate-500">Drag to reposition, slider to zoom</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Cropping Canvas Viewport */}
        <div className="relative p-6 bg-slate-900 flex items-center justify-center overflow-hidden select-none">
          {/* Circular Crop Frame (240x240) */}
          <div
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="relative w-60 h-60 rounded-full border-4 border-white/90 shadow-[0_0_0_9999px_rgba(15,23,42,0.75)] overflow-hidden cursor-grab active:cursor-grabbing touch-none z-10"
          >
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop target"
              draggable={false}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
              }}
              className="w-full h-full object-cover pointer-events-none"
            />
          </div>

          {/* Grid lines overlay for alignment */}
          <div className="absolute w-60 h-60 rounded-full pointer-events-none z-20 border border-white/20">
            <div className="absolute inset-x-0 top-1/3 border-b border-white/20" />
            <div className="absolute inset-x-0 top-2/3 border-b border-white/20" />
            <div className="absolute inset-y-0 left-1/3 border-r border-white/20" />
            <div className="absolute inset-y-0 left-2/3 border-r border-white/20" />
          </div>
        </div>

        {/* Controls Toolbar */}
        <div className="p-5 space-y-4 bg-white">
          {/* Zoom Slider */}
          <div className="flex items-center gap-3">
            <ZoomOut className="h-4 w-4 text-slate-400 flex-shrink-0" />
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1 accent-blue-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
            />
            <ZoomIn className="h-4 w-4 text-slate-400 flex-shrink-0" />
            <span className="text-xs font-mono font-bold text-slate-600 w-9 text-right">
              {zoom.toFixed(1)}x
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-1 gap-2">
            <button
              type="button"
              onClick={handleRotate}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
            >
              <RotateCw className="h-3.5 w-3.5" />
              <span>Rotate 90°</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-600 text-xs font-bold hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleApplyCrop}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold transition-all shadow-sm"
              >
                <Check className="h-3.5 w-3.5 stroke-[3]" />
                <span>Save Avatar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main AvatarPicker Component
// ─────────────────────────────────────────────────────────────────────────────
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
  const [cropModalOpen, setCropModalOpen] = useState(false)
  const [rawImageSrc, setRawImageSrc] = useState<string>('')
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WebP).')
      return
    }

    if (file.size > 15 * 1024 * 1024) {
      setUploadError('Image is too large. Please select an image under 15MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setRawImageSrc(event.target.result as string)
        setCropModalOpen(true)
        setUploadError('')
      }
    }
    reader.readAsDataURL(file)
  }

  const handleCroppedImage = (croppedDataUrl: string) => {
    setSelectedUrl(croppedDataUrl)
    onSelect(croppedDataUrl)
    setUploadError('')
  }

  const handleRemoveAvatar = () => {
    setSelectedUrl('')
    onSelect('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="space-y-4">
      {/* Interactive Crop Modal */}
      <ImageCropModal
        isOpen={cropModalOpen}
        imageSrc={rawImageSrc}
        onClose={() => {
          setCropModalOpen(false)
          if (fileInputRef.current) fileInputRef.current.value = ''
        }}
        onCropComplete={handleCroppedImage}
      />

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
              Upload & Crop Image
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
            onChange={handleFileChange}
            className="hidden"
            id="device-avatar-input"
          />

          <label
            htmlFor="device-avatar-input"
            className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/60 hover:bg-blue-50/30 transition-all rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer text-center group"
          >
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 group-hover:text-blue-600 group-hover:scale-105 transition-all mb-2">
              <Camera className="h-6 w-6" />
            </div>

            <p className="text-xs font-bold text-slate-800">
              Select Photo to Crop & Position
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Supports mobile camera & file upload. Zoom, drag, and rotate your circular avatar.
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

'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Video, X, Loader2, ShieldCheck, Maximize2, Minimize2 } from 'lucide-react'

interface VideoConsultationModalProps {
  isOpen: boolean
  onClose: () => void
  appointmentId: string | number
  patientName: string
  doctorName: string
  userRole: 'DOCTOR' | 'PATIENT'
  userEmail?: string
  onCallEnd?: () => void
}

declare global {
  interface Window {
    JitsiMeetExternalAPI?: any
  }
}

export default function VideoConsultationModal({
  isOpen,
  onClose,
  appointmentId,
  patientName,
  doctorName,
  userRole,
  userEmail,
  onCallEnd,
}: VideoConsultationModalProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const apiRef = useRef<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Generate safe deterministic room name
  const roomName = `medbook-consultation-${appointmentId}`
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '')

  const displayName =
    userRole === 'DOCTOR'
      ? doctorName.startsWith('Dr.')
        ? doctorName
        : `Dr. ${doctorName}`
      : patientName

  useEffect(() => {
    if (!isOpen) return

    let isMounted = true
    setLoading(true)
    setError(null)

    // Load Jitsi Meet External API script dynamically
    const loadJitsiScript = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (window.JitsiMeetExternalAPI) {
          resolve()
          return
        }

        const existingScript = document.getElementById('jitsi-meet-script')
        if (existingScript) {
          existingScript.addEventListener('load', () => resolve())
          existingScript.addEventListener('error', () =>
            reject(new Error('Failed to load video service'))
          )
          return
        }

        const script = document.createElement('script')
        script.id = 'jitsi-meet-script'
        script.src = 'https://meet.jit.si/external_api.js'
        script.async = true
        script.onload = () => resolve()
        script.onerror = () =>
          reject(new Error('Failed to connect to video consultation server'))
        document.body.appendChild(script)
      })
    }

    loadJitsiScript()
      .then(() => {
        if (!isMounted || !containerRef.current) return

        try {
          // Dispose previous instance if any
          if (apiRef.current) {
            apiRef.current.dispose()
            apiRef.current = null
          }

          const domain = 'meet.jit.si'
          const options = {
            roomName: roomName,
            width: '100%',
            height: '100%',
            parentNode: containerRef.current,
            userInfo: {
              displayName: displayName,
              email: userEmail || '',
            },
            configOverwrite: {
              startWithAudioMuted: false,
              startWithVideoMuted: false,
              prejoinPageEnabled: false,
              disableDeepLinking: true,
              enableWelcomePage: false,
              enableClosePage: false,
              hideConferenceSubject: true,
              hideConferenceTimer: false,
              toolbarButtons: [
                'microphone',
                'camera',
                'closedcaptions',
                'desktop',
                'fullscreen',
                'fodeviceselection',
                'hangup',
                'chat',
                'raisehand',
                'videoquality',
                'tileview',
                'settings',
              ],
            },
            interfaceConfigOverwrite: {
              SHOW_JITSI_WATERMARK: false,
              SHOW_WATERMARK_FOR_GUESTS: false,
              SHOW_BRAND_WATERMARK: false,
              BRAND_WATERMARK_LINK: '',
              DEFAULT_BACKGROUND: '#0f172a',
              MOBILE_APP_PROMO: false,
              HIDE_DEEP_LINKING_LOGO: true,
            },
          }

          const api = new window.JitsiMeetExternalAPI(domain, options)
          apiRef.current = api

          api.addEventListener('videoConferenceJoined', () => {
            if (isMounted) setLoading(false)
          })

          api.addEventListener('readyToClose', () => {
            if (onCallEnd) onCallEnd()
            onClose()
          })
        } catch (err: any) {
          console.error('Jitsi init error:', err)
          if (isMounted) {
            setError(
              'Could not initialize video consultation. Please check your camera permissions.'
            )
            setLoading(false)
          }
        }
      })
      .catch((err) => {
        console.error('Jitsi script error:', err)
        if (isMounted) {
          setError(
            'Failed to connect to video service. Please check your internet connection.'
          )
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
      if (apiRef.current) {
        try {
          apiRef.current.dispose()
        } catch (e) {
          // ignore
        }
        apiRef.current = null
      }
    }
  }, [isOpen, roomName, displayName, userEmail])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-4 animate-in fade-in">
      <div
        className={`w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all ${
          isFullscreen
            ? 'fixed inset-0 rounded-none border-none'
            : 'max-w-5xl h-[88vh] max-h-[850px]'
        }`}
      >
        {/* Top Telehealth Header */}
        <div className="px-4 py-3 bg-slate-900 border-b border-slate-800/80 flex items-center justify-between gap-3 text-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
              <Video className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-bold text-slate-100">
                  {userRole === 'DOCTOR'
                    ? `Patient: ${patientName}`
                    : `Consultation with ${doctorName}`}
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                  <ShieldCheck className="h-3 w-3" />
                  Encrypted Visit
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                MedBook HD Telehealth &middot; Appointment #{appointmentId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                if (apiRef.current) {
                  try {
                    apiRef.current.executeCommand('hangup')
                  } catch {}
                }
                onClose()
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-sm"
              title="End consultation and leave room"
            >
              <X className="h-3.5 w-3.5" />
              <span>Leave Call</span>
            </button>
          </div>
        </div>

        {/* Video Canvas Container */}
        <div className="relative flex-1 bg-slate-950 overflow-hidden flex items-center justify-center">
          {loading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950 text-white gap-3 p-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-slate-200">
                  Connecting to secure medical room...
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Please allow camera and microphone access when prompted
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950 text-white gap-3 p-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center">
                <X className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold text-red-400 max-w-md">{error}</p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors"
              >
                Close Room
              </button>
            </div>
          )}

          <div ref={containerRef} className="w-full h-full" />
        </div>
      </div>
    </div>
  )
}

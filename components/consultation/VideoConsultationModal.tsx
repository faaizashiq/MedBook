'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
  Video,
  X,
  Loader2,
  ShieldCheck,
  Maximize2,
  Minimize2,
  Clock,
  AlertTriangle,
  CheckCircle2,
  PhoneOff,
} from 'lucide-react'
import { getAppointmentTimeWindow } from '@/lib/utils/appointmentTime'

interface VideoConsultationModalProps {
  isOpen: boolean
  onClose: () => void
  appointmentId: string | number
  patientName: string
  doctorName: string
  userRole: 'DOCTOR' | 'PATIENT'
  userEmail?: string
  appointmentDate?: string
  appointmentTime?: string
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
  appointmentDate,
  appointmentTime,
  onCallEnd,
}: VideoConsultationModalProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const apiRef = useRef<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [hasEnded, setHasEnded] = useState(false)

  // Countdown timer calculation
  const [secondsRemaining, setSecondsRemaining] = useState<number>(30 * 60)
  const [showFiveMinWarning, setShowFiveMinWarning] = useState(false)

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

  // Timer effect for 30-minute session and 5-min warning
  useEffect(() => {
    if (!isOpen) return

    const timeWindow = getAppointmentTimeWindow(appointmentDate, appointmentTime, 30)
    const targetEndTime = timeWindow.sessionEndTime
      ? timeWindow.sessionEndTime.getTime()
      : Date.now() + 30 * 60 * 1000

    const updateTimer = () => {
      const nowMs = Date.now()
      const diffSecs = Math.max(0, Math.floor((targetEndTime - nowMs) / 1000))
      setSecondsRemaining(diffSecs)

      if (diffSecs <= 300 && diffSecs > 0) {
        setShowFiveMinWarning(true)
      } else if (diffSecs <= 0) {
        setShowFiveMinWarning(false)
      }
    }

    updateTimer()
    const timerInterval = setInterval(updateTimer, 1000)

    return () => clearInterval(timerInterval)
  }, [isOpen, appointmentDate, appointmentTime])

  // Handle immediate clean exit without showing Jitsi promo / 8x8 post-call page
  const handleExitCall = () => {
    if (hasEnded) return
    setHasEnded(true)

    if (apiRef.current) {
      try {
        apiRef.current.executeCommand('hangup')
        apiRef.current.dispose()
      } catch (e) {
        // ignore
      }
      apiRef.current = null
    }

    if (containerRef.current) {
      containerRef.current.innerHTML = ''
    }

    if (onCallEnd) onCallEnd()
    onClose()
  }

  useEffect(() => {
    if (!isOpen) return

    let isMounted = true
    setLoading(true)
    setError(null)
    setHasEnded(false)

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
            try {
              apiRef.current.dispose()
            } catch {}
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
              prejoinConfig: { enabled: false },
              disableDeepLinking: true,
              enableWelcomePage: false,
              enableClosePage: false, // Prevents 8x8 promotional close page
              hideConferenceSubject: true,
              hideConferenceTimer: true, // We provide MedBook's precision countdown
              hideRecordingLabel: true,
              disableThirdPartyRequests: true,
              defaultRemoteDisplayName: 'Consultation Participant',
              disableInviteFunctions: true,
              doNotStoreRoom: true,
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
              SHOW_POWERED_BY: false,
              SHOW_PROMOTIONAL_CLOSE_PAGE: false,
              GENERATE_ROOMNAMES_ON_WELCOME_PAGE: false,
              DISPLAY_WELCOME_PAGE_CONTENT: false,
              DISPLAY_WELCOME_PAGE_TOOLBAR_ADDITIONAL_CONTENT: false,
              DEFAULT_BACKGROUND: '#0f172a',
              MOBILE_APP_PROMO: false,
              HIDE_DEEP_LINKING_LOGO: true,
              DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
              ENABLE_FEEDBACK_ANIMATION: false,
              APP_NAME: 'MedBook Telehealth',
              NATIVE_APP_NAME: 'MedBook',
              PROVIDER_NAME: 'MedBook',
            },
          }

          const api = new window.JitsiMeetExternalAPI(domain, options)
          apiRef.current = api

          const clearLoadingState = () => {
            if (isMounted) setLoading(false)
          }

          // Listen for join & stream events to instantly clear loading
          api.addEventListener('videoConferenceJoined', clearLoadingState)
          api.addEventListener('participantJoined', clearLoadingState)
          api.addEventListener('audioMuteStatusChanged', clearLoadingState)
          api.addEventListener('videoMuteStatusChanged', clearLoadingState)

          // Short safety timer to clear loading overlay and allow user interaction
          const safetyTimer = setTimeout(clearLoadingState, 1200)

          // LISTEN FOR HANGUP & CLOSE EVENTS TO PREVENT PROMOTIONAL REDIRECTS
          api.addEventListener('videoConferenceLeft', () => {
            clearTimeout(safetyTimer)
            handleExitCall()
          })

          api.addEventListener('readyToClose', () => {
            clearTimeout(safetyTimer)
            handleExitCall()
          })

          api.addEventListener('toolbarButtonClicked', (e: any) => {
            if (e?.key === 'hangup') {
              clearTimeout(safetyTimer)
              handleExitCall()
            }
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

  // Format timer
  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60)
    const secs = totalSecs % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const isFiveMinOrLess = secondsRemaining <= 300 && secondsRemaining > 0
  const isTimeConcluded = secondsRemaining === 0

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-1.5 sm:p-4 animate-in fade-in">
      <div
        className={`w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all ${
          isFullscreen
            ? 'fixed inset-0 rounded-none border-none'
            : 'max-w-5xl h-[90vh] max-h-[880px]'
        }`}
      >
        {/* Top Telehealth Header Bar */}
        <div className="px-4 py-3 bg-slate-900 border-b border-slate-800/80 flex items-center justify-between gap-3 text-white flex-shrink-0">
          {/* Left: Info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
              <Video className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xs sm:text-sm font-bold text-slate-100 truncate">
                  {userRole === 'DOCTOR'
                    ? `Patient: ${patientName}`
                    : `Consultation with ${doctorName}`}
                </h3>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                  <ShieldCheck className="h-3 w-3" />
                  Encrypted Visit
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                MedBook HD Telehealth &middot; 30-Minute Session
              </p>
            </div>
          </div>

          {/* Center/Right: Session Countdown Timer */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all ${
                isTimeConcluded
                  ? 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse'
                  : isFiveMinOrLess
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                  : 'bg-slate-800 text-slate-200 border-slate-700'
              }`}
              title="Remaining consultation time"
            >
              <Clock className={`h-3.5 w-3.5 ${isFiveMinOrLess ? 'text-amber-400' : 'text-slate-400'}`} />
              <span>
                {isTimeConcluded ? 'Session Time Ended' : `${formatTimer(secondsRemaining)} remaining`}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors hidden sm:block"
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
              onClick={handleExitCall}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold transition-colors shadow-sm"
              title="End consultation and leave room"
            >
              <PhoneOff className="h-3.5 w-3.5" />
              <span>Leave Call</span>
            </button>
          </div>
        </div>

        {/* 5-Minute Warning Toast / Banner */}
        {showFiveMinWarning && (
          <div className="bg-amber-500/90 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-between gap-3 shadow-md animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>
                ⚠️ Consultation ending soon — {formatTimer(secondsRemaining)} remaining in this 30-minute session.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowFiveMinWarning(false)}
              className="text-slate-900 hover:text-slate-950 font-extrabold text-xs px-2 py-0.5 rounded hover:bg-amber-400"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Time Concluded Warning Banner */}
        {isTimeConcluded && (
          <div className="bg-red-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between gap-3 shadow-md animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span>
                ⏰ Scheduled 30-minute consultation time has concluded. Please wrap up and leave the call when ready.
              </span>
            </div>
            <button
              type="button"
              onClick={handleExitCall}
              className="px-2.5 py-1 bg-white text-red-600 rounded-lg text-xs font-bold hover:bg-slate-100"
            >
              Finish Consultation
            </button>
          </div>
        )}

        {/* Video Canvas Container */}
        <div className="relative flex-1 bg-slate-950 overflow-hidden flex items-center justify-center">
          {loading && (
            <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center bg-slate-950/75 backdrop-blur-sm text-white gap-3 p-4 transition-opacity duration-300">
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
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950 text-white gap-3 p-6 text-center">
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

          <div
            ref={containerRef}
            className="w-full h-full [&_iframe]:w-full [&_iframe]:h-full [&_iframe]:border-0"
          />
        </div>
      </div>
    </div>
  )
}

'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  ScreenShare,
  ShieldCheck,
  Maximize2,
  Minimize2,
  Clock,
  AlertTriangle,
  Loader2,
  Users,
  RefreshCw,
  Camera,
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
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const peerRef = useRef<any>(null)
  const activeCallRef = useRef<any>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const screenStreamRef = useRef<MediaStream | null>(null)
  const retryIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [isPeerConnected, setIsPeerConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [permissionPrompt, setPermissionPrompt] = useState(false)

  // Media Controls
  const [isAudioMuted, setIsAudioMuted] = useState(false)
  const [isVideoMuted, setIsVideoMuted] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [hasEnded, setHasEnded] = useState(false)

  // Countdown timer calculation
  const [secondsRemaining, setSecondsRemaining] = useState<number>(30 * 60)
  const [showFiveMinWarning, setShowFiveMinWarning] = useState(false)

  // Clean room identifier
  const safeApptId = String(appointmentId).replace(/[^a-zA-Z0-9]/g, '').slice(0, 24)
  const myPeerId = userRole === 'DOCTOR' ? `mb-doc-${safeApptId}` : `mb-pat-${safeApptId}`
  const targetPeerId = userRole === 'DOCTOR' ? `mb-pat-${safeApptId}` : `mb-doc-${safeApptId}`

  const otherPersonTitle =
    userRole === 'DOCTOR'
      ? patientName || 'Patient'
      : doctorName.startsWith('Dr.')
      ? doctorName
      : `Dr. ${doctorName || 'Specialist'}`

  // ─── 30-Minute Timer ────────────────────────────────────────────────────────
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

  // ─── Bind stream to Video element safely (iOS/Android compatible) ────────────
  const attachStreamToVideo = useCallback((videoEl: HTMLVideoElement | null, stream: MediaStream | null, isMuted = false) => {
    if (!videoEl || !stream) return
    try {
      videoEl.srcObject = stream
      videoEl.muted = isMuted
      videoEl.defaultMuted = isMuted
      videoEl.setAttribute('playsinline', 'true')
      videoEl.setAttribute('webkit-playsinline', 'true')
      const playPromise = videoEl.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Auto-play was prevented; ignore or wait for user interaction
        })
      }
    } catch (e) {
      console.warn('Video attach notice:', e)
    }
  }, [])

  // ─── Acquire Camera and Microphone with Mobile Fallbacks ────────────────────
  const startCamera = async (): Promise<MediaStream | null> => {
    try {
      // 1. Try standard front-camera constraints
      return await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: true,
      })
    } catch (err1: any) {
      console.warn('Front camera standard failed, trying generic constraints:', err1)
      try {
        // 2. Fallback: Generic video + audio
        return await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        })
      } catch (err2: any) {
        console.warn('Video + Audio failed, trying video only:', err2)
        try {
          // 3. Fallback: Video only
          return await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          })
        } catch (finalErr: any) {
          console.error('All camera attempts failed:', finalErr)
          throw finalErr
        }
      }
    }
  }

  // ─── Initialize WebRTC Peer Connection ──────────────────────────────────────
  const initializeCall = async () => {
    setIsConnecting(true)
    setError(null)
    setPermissionPrompt(false)
    setHasEnded(false)

    try {
      // Step 1: Open Camera
      const stream = await startCamera()
      if (!stream) return

      localStreamRef.current = stream
      setLocalStream(stream)
      setIsConnecting(false)

      if (localVideoRef.current) {
        attachStreamToVideo(localVideoRef.current, stream, true)
      }

      // Step 2: Initialize PeerJS
      const { default: Peer } = await import('peerjs')

      // Clean up previous peer if existing
      if (peerRef.current) {
        try {
          peerRef.current.destroy()
        } catch {}
      }

      const peer = new Peer(myPeerId, {
        debug: 1,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' },
          ],
        },
      })

      peerRef.current = peer

      // Handle Peer server open
      peer.on('open', () => {
        // Attempt initial call
        callTargetPeer(peer, stream)

        // Polling loop to auto-connect as soon as the other person enters
        if (retryIntervalRef.current) clearInterval(retryIntervalRef.current)
        retryIntervalRef.current = setInterval(() => {
          if (!isPeerConnected && peer && !peer.destroyed) {
            callTargetPeer(peer, stream)
          }
        }, 2500)
      })

      // Handle Incoming Call
      peer.on('call', (incomingCall: any) => {
        activeCallRef.current = incomingCall
        incomingCall.answer(stream)

        incomingCall.on('stream', (remoteMediaStream: MediaStream) => {
          setRemoteStream(remoteMediaStream)
          setIsPeerConnected(true)
          if (remoteVideoRef.current) {
            attachStreamToVideo(remoteVideoRef.current, remoteMediaStream, false)
          }
        })

        incomingCall.on('close', () => {
          setRemoteStream(null)
          setIsPeerConnected(false)
        })

        incomingCall.on('error', () => {
          setRemoteStream(null)
          setIsPeerConnected(false)
        })
      })

      peer.on('error', (err: any) => {
        if (err.type === 'unavailable-id') {
          // ID in use; attempt to connect as caller
          callTargetPeer(peer, stream)
        }
      })
    } catch (err: any) {
      console.error('Call initialization error:', err)
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionPrompt(true)
        setError('Camera & Microphone access is required. Please tap "Enable Camera" below and allow permissions.')
      } else {
        setError('Could not access camera/microphone on this device. Please check permissions.')
      }
      setIsConnecting(false)
    }
  }

  const callTargetPeer = (peer: any, stream: MediaStream) => {
    if (!peer || peer.destroyed || isPeerConnected) return

    try {
      const call = peer.call(targetPeerId, stream)
      if (call) {
        activeCallRef.current = call
        call.on('stream', (remoteMediaStream: MediaStream) => {
          setRemoteStream(remoteMediaStream)
          setIsPeerConnected(true)
          if (remoteVideoRef.current) {
            attachStreamToVideo(remoteVideoRef.current, remoteMediaStream, false)
          }
        })

        call.on('close', () => {
          setRemoteStream(null)
          setIsPeerConnected(false)
        })

        call.on('error', () => {
          // Target not ready yet
        })
      }
    } catch {
      // Target peer offline
    }
  }

  useEffect(() => {
    if (isOpen) {
      initializeCall()
    }

    return () => {
      if (retryIntervalRef.current) clearInterval(retryIntervalRef.current)
      cleanupMedia()
    }
  }, [isOpen])

  // Sync video streams to elements on state changes
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      attachStreamToVideo(localVideoRef.current, localStream, true)
    }
  }, [localStream, attachStreamToVideo])

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      attachStreamToVideo(remoteVideoRef.current, remoteStream, false)
    }
  }, [remoteStream, attachStreamToVideo])

  // ─── Clean Media Streams & Exit Call ────────────────────────────────────────
  const cleanupMedia = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop())
      localStreamRef.current = null
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop())
      screenStreamRef.current = null
    }
    if (activeCallRef.current) {
      try {
        activeCallRef.current.close()
      } catch {}
      activeCallRef.current = null
    }
    if (peerRef.current) {
      try {
        peerRef.current.destroy()
      } catch {}
      peerRef.current = null
    }
  }

  const handleExitCall = () => {
    if (hasEnded) return
    setHasEnded(true)
    cleanupMedia()
    if (onCallEnd) onCallEnd()
    onClose()
  }

  // ─── Toggle Audio ────────────────────────────────────────────────────────────
  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks()
      const nextState = !isAudioMuted
      audioTracks.forEach((track) => {
        track.enabled = !nextState
      })
      setIsAudioMuted(nextState)
    }
  }

  // ─── Toggle Video ────────────────────────────────────────────────────────────
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks()
      const nextState = !isVideoMuted
      videoTracks.forEach((track) => {
        track.enabled = !nextState
      })
      setIsVideoMuted(nextState)
    }
  }

  // ─── Toggle Screen Share ─────────────────────────────────────────────────────
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop())
        screenStreamRef.current = null
      }
      try {
        const camStream = await startCamera()
        if (camStream) {
          const camTrack = camStream.getVideoTracks()[0]
          if (localStreamRef.current) {
            const oldTrack = localStreamRef.current.getVideoTracks()[0]
            if (oldTrack) {
              localStreamRef.current.removeTrack(oldTrack)
              oldTrack.stop()
            }
            localStreamRef.current.addTrack(camTrack)
          }
        }
        setIsScreenSharing(false)
      } catch {}
    } else {
      try {
        if (!navigator.mediaDevices.getDisplayMedia) {
          alert('Screen sharing is not supported on mobile devices.')
          return
        }
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true })
        screenStreamRef.current = screenStream
        const screenTrack = screenStream.getVideoTracks()[0]

        if (localStreamRef.current) {
          const oldTrack = localStreamRef.current.getVideoTracks()[0]
          if (oldTrack) {
            localStreamRef.current.removeTrack(oldTrack)
            oldTrack.stop()
          }
          localStreamRef.current.addTrack(screenTrack)
        }

        screenTrack.onended = () => {
          setIsScreenSharing(false)
        }

        setIsScreenSharing(true)
      } catch {
        // User cancelled screen share prompt
      }
    }
  }

  if (!isOpen) return null

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60)
    const secs = totalSecs % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const isFiveMinOrLess = secondsRemaining <= 300 && secondsRemaining > 0
  const isTimeConcluded = secondsRemaining === 0

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-1.5 sm:p-4 animate-in fade-in">
      <div
        className={`w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all ${
          isFullscreen
            ? 'fixed inset-0 rounded-none border-none'
            : 'max-w-5xl h-[92vh] max-h-[860px]'
        }`}
      >
        {/* ─── Top Telehealth Header Bar ──────────────────────────────────────── */}
        <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 bg-slate-900 border-b border-slate-800/80 flex items-center justify-between gap-2 text-white flex-shrink-0">
          {/* Left: Consultation Identity */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
              <Video className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xs sm:text-sm font-bold text-slate-100 truncate">
                  {userRole === 'DOCTOR' ? `Patient: ${patientName}` : `Consultation with ${doctorName}`}
                </h3>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                  <ShieldCheck className="h-3 w-3" />
                  Encrypted Visit
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                MedBook HD Telehealth &middot; 30-Min Session
              </p>
            </div>
          </div>

          {/* Right: Controls & Timer */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl border text-[11px] sm:text-xs font-mono font-bold transition-all ${
                isTimeConcluded
                  ? 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse'
                  : isFiveMinOrLess
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                  : 'bg-slate-800 text-slate-200 border-slate-700'
              }`}
              title="Remaining consultation time"
            >
              <Clock className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${isFiveMinOrLess ? 'text-amber-400' : 'text-slate-400'}`} />
              <span>{isTimeConcluded ? 'Time Ended' : `${formatTimer(secondsRemaining)}`}</span>
            </div>

            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors hidden sm:block"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>

            <button
              type="button"
              onClick={handleExitCall}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold transition-colors shadow-sm"
              title="End consultation and leave room"
            >
              <PhoneOff className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Leave</span>
            </button>
          </div>
        </div>

        {/* ─── 5-Minute Warning Toast / Banner ────────────────────────────────── */}
        {showFiveMinWarning && (
          <div className="bg-amber-500/90 text-slate-950 px-4 py-1.5 text-xs font-bold flex items-center justify-between gap-3 shadow-md animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>
                ⚠️ Consultation ending soon — {formatTimer(secondsRemaining)} remaining in this session.
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

        {/* ─── Main Video Call Stage ──────────────────────────────────────────── */}
        <div className="relative flex-1 bg-slate-950 overflow-hidden flex items-center justify-center p-2 sm:p-4">
          {/* Loading Overlay */}
          {isConnecting && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950 text-white gap-3 p-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              </div>
              <p className="text-sm font-bold text-slate-200">Opening Camera & Microphone...</p>
              <p className="text-xs text-slate-400">Please allow browser permissions</p>
            </div>
          )}

          {/* Error Message with Re-enable button for Mobile */}
          {error && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950 text-white gap-3 p-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold text-red-400 max-w-md">{error}</p>
              <div className="flex gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={initializeCall}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition-colors flex items-center gap-1.5 shadow-btn"
                >
                  <Camera className="h-4 w-4" />
                  <span>Enable Camera / Retry</span>
                </button>
                <button
                  type="button"
                  onClick={handleExitCall}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors"
                >
                  Close Window
                </button>
              </div>
            </div>
          )}

          {/* Connected State: Remote Participant (Main View) */}
          {isPeerConnected && remoteStream ? (
            <div className="relative w-full h-full rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover rounded-2xl"
              />
              <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 text-white text-xs font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>{otherPersonTitle}</span>
              </div>
            </div>
          ) : (
            /* Waiting State: Show Local Stream in Center with Waiting Notice */
            <div className="relative w-full h-full max-w-3xl rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-cover ${isVideoMuted ? 'hidden' : ''}`}
              />

              {isVideoMuted && (
                <div className="flex flex-col items-center justify-center text-slate-500 gap-3">
                  <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                    <VideoOff className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-sm font-semibold">Your Camera is Off</p>
                </div>
              )}

              {/* Waiting Badge overlay */}
              {!error && !isConnecting && (
                <div className="absolute top-4 left-4 right-4 sm:right-auto bg-slate-950/85 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-800 text-white flex items-center gap-3 shadow-xl">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                    <Users className="h-4 w-4 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-100">
                      Waiting for {otherPersonTitle} to join...
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Your video is live. Connection will link up automatically.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Picture-in-Picture: Local Video Preview when Connected */}
          {isPeerConnected && (
            <div className="absolute bottom-20 right-4 sm:bottom-24 sm:right-6 w-32 h-24 sm:w-48 sm:h-32 rounded-2xl overflow-hidden border-2 border-blue-500/50 shadow-2xl bg-slate-900 z-10">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-cover ${isVideoMuted ? 'hidden' : ''}`}
              />
              {isVideoMuted && (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400 text-xs">
                  <VideoOff className="h-5 w-5 mb-1" />
                  <span>Camera Off</span>
                </div>
              )}
              <div className="absolute bottom-1.5 left-1.5 bg-slate-950/80 px-2 py-0.5 rounded text-[9px] font-bold text-white">
                You ({userRole === 'DOCTOR' ? 'Doctor' : 'Patient'})
              </div>
            </div>
          )}

          {/* ─── Bottom Floating Controls Toolbar ─────────────────────────────── */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-xl border border-slate-700/70 px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl shadow-2xl flex items-center gap-2.5 sm:gap-3 z-30">
            {/* Mute Audio */}
            <button
              type="button"
              onClick={toggleAudio}
              className={`p-2.5 sm:p-3 rounded-xl font-bold transition-all ${
                isAudioMuted
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
              }`}
              title={isAudioMuted ? 'Unmute Microphone' : 'Mute Microphone'}
            >
              {isAudioMuted ? <MicOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Mic className="h-4 w-4 sm:h-5 sm:w-5" />}
            </button>

            {/* Mute Video */}
            <button
              type="button"
              onClick={toggleVideo}
              className={`p-2.5 sm:p-3 rounded-xl font-bold transition-all ${
                isVideoMuted
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
              }`}
              title={isVideoMuted ? 'Turn Camera On' : 'Turn Camera Off'}
            >
              {isVideoMuted ? <VideoOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Video className="h-4 w-4 sm:h-5 sm:w-5" />}
            </button>

            {/* Screen Share (Desktop only) */}
            <button
              type="button"
              onClick={toggleScreenShare}
              className={`p-2.5 sm:p-3 rounded-xl font-bold transition-all hidden sm:block ${
                isScreenSharing
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
              }`}
              title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
            >
              <ScreenShare className="h-5 w-5" />
            </button>

            {/* Leave / Hangup */}
            <button
              type="button"
              onClick={handleExitCall}
              className="px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold transition-all shadow-btn flex items-center gap-1.5"
              title="Leave Consultation"
            >
              <PhoneOff className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              <span className="hidden sm:inline">End Visit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

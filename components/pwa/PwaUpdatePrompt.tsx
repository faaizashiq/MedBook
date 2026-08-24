'use client'

import React, { useState, useEffect } from 'react'
import { RefreshCw, X, Sparkles } from 'lucide-react'

export function PwaUpdatePrompt() {
  const [showUpdate, setShowUpdate] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      (window.location.protocol !== 'https:' &&
        window.location.hostname !== 'localhost' &&
        window.location.hostname !== '127.0.0.1')
    ) {
      return
    }

    let refreshing = false

    // When the new service worker takes over, reload the window once
    const handleControllerChange = () => {
      if (!refreshing) {
        refreshing = true
        window.location.reload()
      }
    }

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange)

    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) return

      // 1. Check if an update is already waiting to be activated
      if (reg.waiting) {
        setWaitingWorker(reg.waiting)
        setShowUpdate(true)
      }

      // 2. Listen for when a new service worker is being installed
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing
        if (!newWorker) return

        newWorker.addEventListener('statechange', () => {
          // If state is 'installed' and there was an existing active worker, a new version is ready!
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setWaitingWorker(newWorker)
            setShowUpdate(true)
          }
        })
      })

      // 3. Proactive update check when app becomes visible (e.g. user unlocks phone or switches tab)
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          reg.update().catch(() => {
            // Ignore offline update check errors
          })
        }
      }

      document.addEventListener('visibilitychange', handleVisibilityChange)

      // 4. Periodic check every 30 minutes
      const interval = setInterval(() => {
        reg.update().catch(() => {})
      }, 1000 * 60 * 30)

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange)
        clearInterval(interval)
      }
    })

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange)
    }
  }, [])

  const handleUpdateClick = () => {
    if (waitingWorker) {
      setIsUpdating(true)
      waitingWorker.postMessage({ type: 'SKIP_WAITING' })
    } else {
      window.location.reload()
    }
  }

  const handleDismiss = () => {
    setShowUpdate(false)
  }

  if (!showUpdate) return null

  return (
    <div className="fixed bottom-5 right-5 left-5 sm:left-auto sm:max-w-sm z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900/95 text-white p-4 rounded-3xl shadow-2xl border border-slate-700/60 backdrop-blur-xl flex items-center justify-between gap-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center flex-shrink-0 shadow-md">
            <Sparkles className="h-5 w-5 text-white animate-pulse" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-white truncate">Update Available</p>
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                New
              </span>
            </div>
            <p className="text-[11px] text-slate-300 truncate mt-0.5">
              Reload to get the latest features
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={handleUpdateClick}
            disabled={isUpdating}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5 disabled:opacity-70 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
            <span>{isUpdating ? 'Updating...' : 'Reload'}</span>
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Dismiss update"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

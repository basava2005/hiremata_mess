import React, { useState, useEffect } from 'react'
import { Download, Smartphone, X, Sparkles, CheckCircle2 } from 'lucide-react'
import { Button } from './Button'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export const InstallAppBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showInstructionsModal, setShowInstructionsModal] = useState(false)

  useEffect(() => {
    // Check if app is already running standalone / installed
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true

    if (isStandalone) {
      setIsInstalled(true)
      return
    }

    // Check if dismissed in this session
    const isDismissed = sessionStorage.getItem('hiremat_install_banner_dismissed')
    if (isDismissed) return

    // Listen for browser install prompt (Android Chrome, Edge, etc.)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowBanner(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Show banner after 2 seconds on mobile/desktop
    const timer = setTimeout(() => {
      if (!isStandalone) {
        setShowBanner(true)
      }
    }, 2000)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      clearTimeout(timer)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Trigger native browser install dialog
      await deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice
      if (choice.outcome === 'accepted') {
        setShowBanner(false)
        setIsInstalled(true)
      }
      setDeferredPrompt(null)
    } else {
      // If native prompt is not available, show helpful instructions
      setShowInstructionsModal(true)
    }
  }

  const handleDismiss = () => {
    setShowBanner(false)
    sessionStorage.setItem('hiremat_install_banner_dismissed', 'true')
  }

  if (isInstalled || !showBanner) return null

  return (
    <>
      {/* Floating Bottom App Install Notification Banner */}
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 animate-in slide-in-from-bottom-5">
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-[#064e3b] to-emerald-900 text-white shadow-2xl border border-emerald-500/40 backdrop-blur-lg flex items-center justify-between gap-3">
          {/* App Logo */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-[#15803d] flex items-center justify-center text-white shadow-md border border-emerald-400/30 flex-shrink-0">
            <Smartphone className="w-6 h-6 text-emerald-200" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.2 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Official Android App
              </span>
            </div>
            <h4 className="font-extrabold text-sm text-white mt-0.5 truncate">
              Install Hiremat Mess App
            </h4>
            <p className="text-[11px] text-emerald-200 leading-tight truncate">
              Fast 1-tap meals pass & real-time updates!
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={handleInstallClick}
              className="bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl shadow-md transition-all flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
            <button
              onClick={handleDismiss}
              className="p-1.5 text-emerald-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Manual Install Instructions Modal (For browsers where prompt didn't fire) */}
      {showInstructionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-slate-100 text-slate-900 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-[#15803d] text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-900/20">
              <Smartphone className="w-7 h-7" />
            </div>

            <div>
              <h3 className="font-black text-lg text-slate-900">
                Install Hiremat Mess on Your Phone
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Follow these simple steps in your mobile Chrome browser:
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl text-left text-xs space-y-2 border border-slate-200/80">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  Tap the <strong>three dots (⋮)</strong> in the top right corner of Chrome.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  Tap <strong>"Install app"</strong> or <strong>"Add to Home Screen"</strong>.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  The <strong>Hiremat Mess</strong> app will be installed on your phone home screen!
                </span>
              </div>
            </div>

            <Button
              onClick={() => setShowInstructionsModal(false)}
              className="w-full bg-[#15803d] hover:bg-[#166534] text-white font-bold text-xs h-10 rounded-xl"
            >
              Got it!
            </Button>
          </div>
        </div>
      )}
    </>
  )
}


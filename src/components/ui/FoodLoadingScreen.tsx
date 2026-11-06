import React, { useState, useEffect } from 'react'
import { Utensils, Sparkles, Heart } from 'lucide-react'

interface FoodLoadingScreenProps {
  message?: string
  subMessage?: string
  fullScreen?: boolean
}

export const FoodLoadingScreen: React.FC<FoodLoadingScreenProps> = ({
  message = 'Serving hot homestyle meals...',
  subMessage = 'Hiremat Mess Davangere • 100% Pure Veg',
  fullScreen = true,
}) => {
  const foodTips = [
    'Cooking up soft whole-wheat chapatis...',
    'Tossing fresh Davanagere Mandakki Mirchi...',
    'Simmering authentic Kat Saaru & Dal Tadka...',
    'Garnishing today’s special palya with fresh coconut...',
    'Preparing Sunday Holige feast with pure desi ghee...',
  ]

  const [tipIndex, setTipIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % foodTips.length)
    }, 2200)
    return () => clearInterval(interval)
  }, [foodTips.length])

  const content = (
    <div className="flex flex-col items-center justify-center text-center p-6 max-w-sm mx-auto select-none">
      {/* Animated Spoon & Fork Plate (Swiggy / Zomato style) */}
      <div className="relative mb-6 flex items-center justify-center">
        {/* Soft glowing ambient pulse */}
        <div className="absolute w-28 h-28 rounded-full bg-emerald-400/20 blur-xl animate-pulse" />

        {/* Outer Plate Ring */}
        <div className="relative w-24 h-24 rounded-full bg-white border-4 border-emerald-600/30 shadow-xl flex items-center justify-center">
          {/* Inner Plate Rim */}
          <div className="w-18 h-18 rounded-full bg-gradient-to-br from-emerald-50 via-amber-50/40 to-emerald-100/50 border-2 border-dashed border-emerald-400/50 flex items-center justify-center relative overflow-hidden">
            {/* Animated Rising Steam Particles */}
            <div className="absolute top-1 flex gap-1.5 opacity-70 animate-bounce">
              <span className="text-[10px] text-emerald-600 font-bold">~</span>
              <span className="text-[12px] text-amber-600 font-bold -mt-0.5">~</span>
              <span className="text-[10px] text-emerald-600 font-bold">~</span>
            </div>

            {/* Crossed Spoon and Fork Clinking Animation */}
            <div className="relative flex items-center justify-center">
              {/* Fork (Left Tilt) */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-600 to-[#15803d] text-white flex items-center justify-center shadow-md transform -rotate-12 hover:rotate-0 transition-transform animate-[spin_3s_ease-in-out_infinite]">
                <Utensils className="w-4 h-4 text-emerald-100" />
              </div>
            </div>
          </div>

          {/* Saffron Spice Star Badge */}
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-md border-2 border-white animate-bounce">
            <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
          </div>
        </div>
      </div>

      {/* Brand Identity */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#15803d] text-[10px] font-extrabold uppercase tracking-wider">
          <Heart className="w-3 h-3 fill-emerald-600 text-emerald-600" />
          <span>Hiremat Mess • ಹಿರೇಮಠ್ ಮೆಸ್</span>
        </div>

        <h3 className="font-black text-slate-900 text-base sm:text-lg tracking-tight">
          {message}
        </h3>

        {/* Dynamic foodie cycling tip */}
        <p className="text-xs text-emerald-800 font-semibold min-h-[1.25rem] transition-all animate-fade-in">
          {foodTips[tipIndex]}
        </p>

        <p className="text-[11px] text-slate-400 font-medium">
          {subMessage}
        </p>
      </div>

      {/* Swiggy-like smooth mini progress line */}
      <div className="w-32 h-1 bg-slate-100 rounded-full mt-5 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-[#15803d] rounded-full animate-pulse w-3/4 mx-auto" />
      </div>
    </div>
  )

  if (!fullScreen) {
    return content
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-[#fafcf7] via-white to-emerald-50/30 p-4">
      {content}
    </div>
  )
}


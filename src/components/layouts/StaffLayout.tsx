import React from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Utensils, LogOut, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { NotificationBell } from '../ui/NotificationBell'

export const StaffLayout: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Full-width Responsive Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-[#15803d] flex items-center justify-center text-white shadow-md shadow-emerald-900/20">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg text-slate-900 tracking-tight">
                  Hiremat Mess
                </span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Staff Verification
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  ಹಿರೇಮಠ್ ಮೆಸ್
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Dining Hall Student Meal Entry Verification Desk • BIET Road
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <NotificationBell />
            <div className="hidden sm:block text-right pr-2">
              <p className="text-xs font-bold text-slate-900 leading-tight">{user?.name || 'Mess Staff'}</p>
              <p className="text-[10px] text-slate-500 font-mono leading-tight">{user?.mobile}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container - Full-width max-w-7xl */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
    </div>
  )
}

import React from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Utensils, LogOut } from 'lucide-react'
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
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#15803d] flex items-center justify-center text-white shadow-sm">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-2">
                Hiremat Mess
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  Staff
                </span>
              </span>
              <p className="text-xs text-slate-500">Student Entry Verification</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <NotificationBell />
            <div className="hidden sm:block text-right pr-1">
              <p className="text-xs font-semibold text-slate-800">{user?.name}</p>
              <p className="text-[10px] text-slate-500">{user?.mobile}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6">
        <Outlet />
      </main>
    </div>
  )
}


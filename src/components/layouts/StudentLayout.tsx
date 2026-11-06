import React from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Home, IndianRupee, CalendarOff, Sparkles, User, LogOut, Utensils } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { NotificationBell } from '../ui/NotificationBell'

export const StudentLayout: React.FC = () => {
  const { user, student, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const navItems = [
    { label: 'Home', path: '/student', icon: Home, end: true },
    { label: 'Payments', path: '/student/payments', icon: IndianRupee },
    { label: 'Leave', path: '/student/leaves', icon: CalendarOff },
    { label: 'Extensions', path: '/student/extensions', icon: Sparkles },
    { label: 'Profile', path: '/student/profile', icon: User },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 pb-20 md:pb-0">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-[#15803d] flex items-center justify-center text-white shadow-sm shadow-emerald-900/20">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base text-slate-900 tracking-tight">
                  Hiremat Mess
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#15803d] border border-emerald-200">
                  ಹಿರೇಮಠ್ ಮೆಸ್
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
                Davangere Pure Veg • BIET Road
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-[#15803d] shadow-xs border border-emerald-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <NotificationBell />
            <div className="hidden sm:flex flex-col text-right pr-1">
              <span className="text-xs font-bold text-slate-900 leading-tight">
                {student?.name || user?.name}
              </span>
              <span className="text-[10px] text-slate-500 font-mono leading-tight">
                +91 {user?.mobile || student?.mobile}
              </span>
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

      {/* Main Outlet Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        <Outlet />
      </main>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 safe-bottom">
        <div className="grid grid-cols-5 h-16 max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 transition-colors relative py-1 ${
                    isActive
                      ? 'text-[#15803d] font-semibold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={`p-1 rounded-xl transition-all ${
                        isActive ? 'bg-emerald-100/70 scale-105' : ''
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] tracking-tight">{item.label}</span>
                    {isActive && (
                      <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#15803d]" />
                    )}
                  </>
                )}
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}


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
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#15803d] flex items-center justify-center text-white shadow-sm shadow-emerald-900/20">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-base text-slate-900 tracking-tight flex items-center gap-1.5">
                Hiremat Mess
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-[#15803d] border border-emerald-200">
                  Student
                </span>
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-[#15803d] font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <NotificationBell />
            <div className="hidden sm:flex flex-col text-right pr-1">
              <span className="text-xs font-semibold text-slate-800 leading-tight">
                {student?.name || user?.name}
              </span>
              <span className="text-[10px] text-slate-500 leading-tight">
                {user?.mobile}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Outlet Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6">
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


import React, { useState, useEffect, useRef } from 'react'
import { Bell, Check, CheckCheck, Info, AlertTriangle, AlertCircle, CheckCircle2, Flame, Smartphone } from 'lucide-react'
import type { Notification } from '../../types'
import { notificationsApi } from '../../api/notifications'
import { useAuth } from '../../context/AuthContext'
import { formatDate } from '../../lib/dates'
import { requestFirebaseNotificationPermission } from '../../lib/firebase'

export const NotificationBell: React.FC = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [fcmEnabled, setFcmEnabled] = useState(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  )
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleEnablePush = async () => {
    const token = await requestFirebaseNotificationPermission()
    if (token) {
      setFcmEnabled(true)
    }
  }

  const loadNotifications = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const list = await notificationsApi.getNotifications(user.id)
      setNotifications(list)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [user?.id])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await notificationsApi.markAsRead(id)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
  }

  const handleMarkAllRead = async () => {
    if (!user) return
    await notificationsApi.markAllAsRead(user.id)
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const renderIcon = (type: Notification['type']) => {
    switch (type) {
      case 'SUCCESS':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
      case 'ALERT':
        return <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
      case 'INFO':
      default:
        return <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-in zoom-in">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white border border-slate-200 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-800">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[11px] bg-emerald-100 text-[#15803d] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-slate-500 hover:text-[#15803d] flex items-center gap-1 font-medium"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* Firebase Push Notifications Strip */}
          <div className="px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-amber-900 font-medium">
              <Smartphone className="w-3.5 h-3.5 text-amber-600" />
              <span>Firebase Push Alerts</span>
            </div>
            {fcmEnabled ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Active
              </span>
            ) : (
              <button
                onClick={handleEnablePush}
                className="font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer"
              >
                Enable Push Alerts
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {isLoading ? (
              <div className="p-4 text-center text-xs text-slate-400">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">No notifications right now</div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3.5 flex items-start gap-3 transition-colors ${
                    notif.isRead ? 'bg-white hover:bg-slate-50' : 'bg-emerald-50/40 hover:bg-emerald-50/70'
                  }`}
                >
                  {renderIcon(notif.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs font-semibold ${notif.isRead ? 'text-slate-800' : 'text-[#15803d]'}`}>
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-slate-400 flex-shrink-0">
                        {formatDate(notif.created_at, 'dd MMM')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{notif.message}</p>
                  </div>
                  {!notif.isRead && (
                    <button
                      onClick={(e) => handleMarkAsRead(notif.id, e)}
                      title="Mark as read"
                      className="text-slate-400 hover:text-[#15803d] p-1 rounded-md"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}


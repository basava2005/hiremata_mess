import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Megaphone,
  Plus,
  Calendar,
  AlertCircle,
  Share2,
  Trash2,
  Sparkles,
  CalendarOff,
  Bell,
  CheckCircle2,
  Info,
  Clock,
  Send,
} from 'lucide-react'
import { toast } from 'sonner'
import { announcementsApi, CreateAnnouncementPayload } from '../../api/announcements'
import { studentsApi } from '../../api/students'
import { Announcement, AnnouncementType } from '../../types'
import { formatDate } from '../../lib/dates'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import { TableSkeleton } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'

export const AdminAnnouncementsPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [type, setType] = useState<AnnouncementType>('NOTICE')
  const [effectiveDate, setEffectiveDate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Fetch announcements
  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['adminAnnouncements'],
    queryFn: () => announcementsApi.getAnnouncements(),
  })

  // Fetch students for WhatsApp broadcast count
  const { data: students = [] } = useQuery({
    queryKey: ['adminStudents'],
    queryFn: () => studentsApi.getStudents(),
  })
  const activeStudents = students.filter((s) => s.isActive)

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!title.trim() || !message.trim()) {
      setFormError('Please enter both announcement title and message.')
      return
    }

    setIsSubmitting(true)
    try {
      const payload: CreateAnnouncementPayload = {
        title: title.trim(),
        message: message.trim(),
        type,
        effectiveDate: effectiveDate || undefined,
        createdBy: 'Admin Ramesh Sharma',
      }
      await announcementsApi.createAnnouncement(payload)
      queryClient.invalidateQueries({ queryKey: ['adminAnnouncements'] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })

      toast.success('Announcement published successfully!', {
        description: `Dispatched in-app notifications to ${activeStudents.length} active mess students.`,
      })

      // Reset
      setTitle('')
      setMessage('')
      setType('NOTICE')
      setEffectiveDate('')
      setIsCreateModalOpen(false)
    } catch (err: any) {
      setFormError(err.response?.data?.detail || err.message || 'Failed to publish announcement.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return
    try {
      await announcementsApi.deleteAnnouncement(id)
      queryClient.invalidateQueries({ queryKey: ['adminAnnouncements'] })
      toast.success('Announcement removed.')
    } catch (err: any) {
      toast.error('Failed to delete announcement: ' + (err.message || 'Error'))
    }
  }

  const handleWhatsAppBroadcast = (ann: Announcement) => {
    const typeLabel = {
      MESS_OFF: '🔴 *MESS OFF / HOLIDAY NOTICE*',
      SPECIAL_DINNER: '🌟 *SPECIAL DINNER / HOLIGE FEAST*',
      NOTICE: '📢 *MESS ANNOUNCEMENT*',
    }[ann.type]

    const text =
      `${typeLabel}\n` +
      `*Hiremat Mess Davangere (BIET Road)*\n\n` +
      `*${ann.title}*\n` +
      `${ann.message}\n` +
      (ann.effectiveDate ? `\n📅 *Effective Date:* ${formatDate(ann.effectiveDate)}\n` : '\n') +
      `📍 *Location:* Anjaneya Layout 5th Cross, BIET Rd, Davangere\n` +
      `📞 *Contact Admin Ramesh Sharma:* 9353198281`

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  const getTypeBadge = (annType: AnnouncementType) => {
    switch (annType) {
      case 'MESS_OFF':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <CalendarOff className="w-3.5 h-3.5 text-rose-600" />
            Mess Off / Holiday
          </span>
        )
      case 'SPECIAL_DINNER':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Special Dinner / Feast
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Megaphone className="w-3.5 h-3.5 text-emerald-600" />
            General Notice
          </span>
        )
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            Announcements & Notices
            <span className="text-xs bg-emerald-100 text-[#15803d] font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
              ಪ್ರಕಟಣೆಗಳು
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Notify students about Mess Holidays, Special Holige Feasts, and important notices with in-app alerts and WhatsApp.
          </p>
        </div>

        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#15803d] hover:bg-[#166534] text-white text-xs font-bold h-9 px-4 rounded-xl shadow-sm shadow-emerald-900/10 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Post Announcement</span>
        </Button>
      </div>

      {/* Quick Action Presets Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => {
            setType('MESS_OFF')
            setTitle('Mess Off / Holiday Notice')
            setMessage('Dear members, Hiremat Mess will remain closed on this date. Normal service resumes the following morning.')
            setIsCreateModalOpen(true)
          }}
          className="p-4 rounded-2xl bg-white border border-rose-200 hover:border-rose-400 hover:shadow-md transition-all text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold mb-2 group-hover:scale-105 transition-transform">
            <CalendarOff className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Post Mess Holiday</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Inform students of mess off days or cleaning holidays
          </p>
        </button>

        <button
          type="button"
          onClick={() => {
            setType('SPECIAL_DINNER')
            setTitle('Sunday Special Holige Feast (ಹೋಳಿಗೆ ಊಟ)')
            setMessage('Special dinner alert: All members are welcome to enjoy hot authentic Holige with pure desi ghee, chana saaru, and special rice tonight!')
            setIsCreateModalOpen(true)
          }}
          className="p-4 rounded-2xl bg-white border border-amber-200 hover:border-amber-400 hover:shadow-md transition-all text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold mb-2 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-amber-600" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Special Dinner / Holige</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Announce Sunday feasts, festivals, or special sweets
          </p>
        </button>

        <button
          type="button"
          onClick={() => {
            setType('NOTICE')
            setTitle('Mess Timing & Service Notice')
            setMessage('Please note the updated mess timings. Lunch: 12:30 PM - 2:30 PM, Dinner: 7:30 PM - 9:30 PM.')
            setIsCreateModalOpen(true)
          }}
          className="p-4 rounded-2xl bg-white border border-emerald-200 hover:border-emerald-400 hover:shadow-md transition-all text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#15803d] flex items-center justify-center font-bold mb-2 group-hover:scale-105 transition-transform">
            <Megaphone className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">General Notice</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Broadcast operational updates or reminders
          </p>
        </button>
      </div>

      {/* Announcements List */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-900 text-sm">
          Active Announcements ({announcements.length})
        </h3>

        {isLoading ? (
          <div className="p-4 bg-white rounded-2xl border border-slate-200">
            <TableSkeleton rows={3} />
          </div>
        ) : announcements.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
            <EmptyState
              icon={<Megaphone className="w-8 h-8 text-slate-400" />}
              title="No announcements published yet"
              description="Post a notice or upcoming special feast to broadcast in-app notifications to all active students."
              actionLabel="Create Announcement"
              onAction={() => setIsCreateModalOpen(true)}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    {getTypeBadge(ann.type)}
                    {ann.effectiveDate && (
                      <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        Date: {formatDate(ann.effectiveDate)}
                      </span>
                    )}
                  </div>

                  <h4 className="font-extrabold text-slate-900 text-base leading-snug">
                    {ann.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed whitespace-pre-line">
                    {ann.message}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>
                    Posted by <strong className="text-slate-700">{ann.createdBy}</strong>
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleWhatsAppBroadcast(ann)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#1ebe5b] font-bold text-[11px] transition-colors"
                      title="Share to WhatsApp Groups / Broadcast"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(ann.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Announcement"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Announcement Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 my-auto text-slate-900 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#15803d] flex items-center justify-center font-bold">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Create New Announcement</h3>
                  <p className="text-[10px] text-slate-500">
                    Dispatches in-app notification to all active students
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-3.5 pt-3 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Announcement Type Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  Category / Event Type
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setType('MESS_OFF')}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      type === 'MESS_OFF'
                        ? 'bg-rose-50 border-rose-400 text-rose-800 font-bold shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    🔴 Mess Off
                  </button>

                  <button
                    type="button"
                    onClick={() => setType('SPECIAL_DINNER')}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      type === 'SPECIAL_DINNER'
                        ? 'bg-amber-50 border-amber-400 text-amber-900 font-bold shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    🌟 Special Feast
                  </button>

                  <button
                    type="button"
                    onClick={() => setType('NOTICE')}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      type === 'NOTICE'
                        ? 'bg-emerald-50 border-emerald-400 text-[#15803d] font-bold shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    📢 Notice
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Announcement Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sunday Holige Feast / Diwali Mess Holiday"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:border-[#15803d] focus:ring-2 focus:ring-[#15803d]/15 font-semibold"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Message / Details
                </label>
                <textarea
                  rows={3}
                  placeholder="Write clear instructions for mess members..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:border-[#15803d] focus:ring-2 focus:ring-[#15803d]/15"
                />
              </div>

              {/* Effective Date (Optional) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Effective / Event Date (Optional)
                </label>
                <input
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:border-[#15803d]"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-[#15803d] flex items-center gap-2">
                <Bell className="w-4 h-4 flex-shrink-0" />
                <span>
                  Posting will instantly broadcast in-app push alerts to all <strong>{activeStudents.length} active students</strong>.
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="w-1/2 text-xs h-9 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  className="w-1/2 bg-[#15803d] hover:bg-[#166534] text-white text-xs h-9 font-bold rounded-xl flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish Alert</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

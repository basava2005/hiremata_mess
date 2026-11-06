import React, { useState, useMemo } from 'react'
import {
  MessageSquare,
  X,
  Copy,
  Check,
  Users,
  AlertTriangle,
  Clock,
  Sparkles,
  ExternalLink,
  RotateCcw,
  Play,
  CheckCircle2,
  PhoneCall,
  Edit3
} from 'lucide-react'
import { Student, Subscription } from '../../types'
import { formatDate, getDaysRemaining } from '../../lib/dates'
import { Button } from '../ui/Button'
import { toast } from 'sonner'

interface BulkWaReminderModalProps {
  open: boolean
  onClose: () => void
  students: Student[]
  subscriptions: Subscription[]
}

export const BulkWaReminderModal: React.FC<BulkWaReminderModalProps> = ({
  open,
  onClose,
  students,
  subscriptions,
}) => {
  const [filterType, setFilterType] = useState<'EXPIRING_SOON' | 'EXPIRED' | 'ALL'>('EXPIRING_SOON')
  const [sentStudentIds, setSentStudentIds] = useState<Set<string>>(new Set())
  const [hasCopiedNumbers, setHasCopiedNumbers] = useState(false)
  const [hasCopiedMessage, setHasCopiedMessage] = useState(false)
  const [showTemplateEditor, setShowTemplateEditor] = useState(false)
  const [customNote, setCustomNote] = useState('')

  // Subscriptions lookup map
  const subMap = useMemo(() => {
    const map = new Map<string, Subscription>()
    subscriptions.forEach((sub) => {
      map.set(sub.studentId, sub)
    })
    return map
  }, [subscriptions])

  // Filtered target list
  const targetStudents = useMemo(() => {
    return students.filter((s) => {
      if (!s.isActive) return false
      const sub = subMap.get(s.id)

      if (filterType === 'EXPIRING_SOON') {
        if (!sub) return false
        const days = getDaysRemaining(sub.lastDate)
        return days <= 3 && days >= 0
      }

      if (filterType === 'EXPIRED') {
        if (!sub) return true
        const days = getDaysRemaining(sub.lastDate)
        return days < 0
      }

      return true // ALL
    })
  }, [students, subMap, filterType])

  // Next unsent student in sequence
  const nextUnsentStudent = useMemo(() => {
    return targetStudents.find((s) => !sentStudentIds.has(s.id))
  }, [targetStudents, sentStudentIds])

  if (!open) return null

  // Build message for a specific student
  const getStudentMessage = (student: Student) => {
    const sub = subMap.get(student.id)
    const days = sub ? getDaysRemaining(sub.lastDate) : 0
    const lastDateStr = sub ? formatDate(sub.lastDate) : 'Not Active'

    const noteLine = customNote.trim() ? `\n\n📢 Note: ${customNote.trim()}` : ''

    if (!sub || days < 0) {
      return `ನಮಸ್ಕಾರ ${student.name},\n\nYour Hiremat Mess Davangere monthly pass has expired.\n\nPlease renew via Direct UPI to *hirematmess@upi* (₹3,500 / 30 Days) to resume your hot meals.\n\n📍 Hiremat Mess, BIET Road, Davangere\n📞 Contact Admin Ramesh Sharma: 9876543210${noteLine}`
    }

    return `ನಮಸ್ಕಾರ ${student.name},\n\nYour Hiremat Mess Davangere subscription expires in *${days} days* (on ${lastDateStr}).\n\nPlease renew via Direct UPI to *hirematmess@upi* (₹3,500 / 30 Days) to ensure uninterrupted meals.\n\n📍 Hiremat Mess, BIET Road, Davangere\n📞 Contact Admin Ramesh Sharma: 9876543210${noteLine}`
  }

  // Open WhatsApp for single student
  const handleSendWhatsapp = (student: Student) => {
    const msg = getStudentMessage(student)
    const cleanMobile = student.mobile.replace(/\D/g, '').slice(-10)
    const url = `https://api.whatsapp.com/send?phone=91${cleanMobile}&text=${encodeURIComponent(msg)}`

    window.open(url, '_blank')
    setSentStudentIds((prev) => new Set(prev).add(student.id))
    toast.success(`WhatsApp opened for ${student.name}`)
  }

  // Send to next student in sequence
  const handleSendNext = () => {
    if (nextUnsentStudent) {
      handleSendWhatsapp(nextUnsentStudent)
    }
  }

  // Reset sent tracking
  const handleResetSent = () => {
    setSentStudentIds(new Set())
    toast.info('Sent tracking reset')
  }

  // Copy all phone numbers for WhatsApp Broadcast list
  const handleCopyAllNumbers = () => {
    const numbers = targetStudents
      .map((s) => s.mobile.replace(/\D/g, '').slice(-10))
      .filter((m) => m.length === 10)
      .join(', ')

    navigator.clipboard.writeText(numbers)
    setHasCopiedNumbers(true)
    toast.success(`Copied ${targetStudents.length} phone numbers!`, {
      description: 'You can paste them into a WhatsApp Broadcast list or contact group.',
    })
    setTimeout(() => setHasCopiedNumbers(false), 2500)
  }

  // Copy generic template message
  const handleCopyTemplateMessage = () => {
    const noteLine = customNote.trim() ? `\n\n📢 Note: ${customNote.trim()}` : ''
    const templateMsg = `ನಮಸ್ಕಾರ [Student Name],\n\nYour Hiremat Mess Davangere monthly pass is expiring soon.\n\nPlease renew via Direct UPI to *hirematmess@upi* (₹3,500 / 30 Days) to continue your hot meals.\n\n📍 Hiremat Mess, BIET Road, Davangere\n📞 Contact Admin Ramesh Sharma: 9876543210${noteLine}`
    navigator.clipboard.writeText(templateMsg)
    setHasCopiedMessage(true)
    toast.success('Copied reminder message template!')
    setTimeout(() => setHasCopiedMessage(false), 2500)
  }

  const sentCount = targetStudents.filter((s) => sentStudentIds.has(s.id)).length
  const totalCount = targetStudents.length
  const progressPercent = totalCount > 0 ? Math.round((sentCount / totalCount) * 100) : 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shadow-md flex-shrink-0">
              <MessageSquare className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                Bulk WhatsApp Reminders
                <span className="text-[10px] bg-emerald-800 text-emerald-200 border border-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                  ಬೃಹತ್ ವಾಟ್ಸಾಪ್
                </span>
              </h3>
              <p className="text-xs text-emerald-300">
                1-Click renewal reminders sent directly via student WhatsApp with ₹0 gateway fee
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Send Progress Banner */}
        {totalCount > 0 && (
          <div className="bg-emerald-50/80 border-b border-emerald-200 px-4 py-3 flex-shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <div className="text-xs">
                  <span className="font-bold text-emerald-950">
                    Progress: {sentCount} of {totalCount} Sent
                  </span>
                  <span className="text-emerald-700 ml-1.5 font-semibold">({progressPercent}%)</span>
                </div>
                {sentCount > 0 && (
                  <button
                    onClick={handleResetSent}
                    title="Reset sent status"
                    className="text-[11px] text-slate-500 hover:text-slate-800 underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                )}
              </div>

              {nextUnsentStudent ? (
                <button
                  type="button"
                  onClick={handleSendNext}
                  className="bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition-transform active:scale-98 flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Send Next: {nextUnsentStudent.name} (1-Click) 🚀</span>
                </button>
              ) : (
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>All {totalCount} Reminders Dispatched!</span>
                </div>
              )}
            </div>

            {/* Progress bar */}
            <div className="w-full bg-emerald-200/60 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-[#25D366] h-full transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Filter Pills & Quick Tools */}
        <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
          {/* Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilterType('EXPIRING_SOON')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filterType === 'EXPIRING_SOON'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Expiring Soon (≤ 3 Days)</span>
            </button>

            <button
              onClick={() => setFilterType('EXPIRED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filterType === 'EXPIRED'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Expired Passes</span>
            </button>

            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filterType === 'ALL'
                  ? 'bg-[#15803d] text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>All Active ({students.filter((s) => s.isActive).length})</span>
            </button>
          </div>

          {/* Quick Copy Buttons & Template toggle */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <button
              type="button"
              onClick={() => setShowTemplateEditor(!showTemplateEditor)}
              className={`text-xs px-2.5 py-1.5 rounded-xl border flex items-center gap-1 font-semibold transition-colors ${
                showTemplateEditor
                  ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
              title="Add custom notice to message"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Custom Note</span>
            </button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyAllNumbers}
              className="text-xs h-8 flex items-center gap-1 border-slate-300"
              title="Copy all phone numbers comma-separated for WhatsApp Broadcast"
            >
              {hasCopiedNumbers ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Numbers ({targetStudents.length})</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyTemplateMessage}
              className="text-xs h-8 flex items-center gap-1 border-slate-300"
              title="Copy message text to clipboard"
            >
              {hasCopiedMessage ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Message</span>
            </Button>
          </div>
        </div>

        {/* Custom Note Input */}
        {showTemplateEditor && (
          <div className="p-3 bg-amber-50/70 border-b border-amber-200 flex-shrink-0 animate-in fade-in">
            <div className="text-[11px] font-semibold text-amber-900 mb-1 flex items-center justify-between">
              <span>Optional announcement appended to WhatsApp reminders:</span>
              <button
                type="button"
                onClick={() => setShowTemplateEditor(false)}
                className="text-amber-700 hover:text-amber-900"
              >
                Close
              </button>
            </div>
            <input
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="e.g. Special Holige Feast this weekend, pay today to reserve your seat!"
              className="w-full text-xs p-2 rounded-xl border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
          </div>
        )}

        {/* Student List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 sm:p-4">
          {targetStudents.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs space-y-2">
              <Sparkles className="w-8 h-8 text-amber-500 mx-auto" />
              <p className="font-bold text-sm text-slate-700">No students match this filter!</p>
              <p className="text-slate-400">
                {filterType === 'EXPIRING_SOON'
                  ? 'No subscriptions expiring within the next 3 days.'
                  : 'All registered students have active memberships.'}
              </p>
            </div>
          ) : (
            targetStudents.map((student) => {
              const sub = subMap.get(student.id)
              const days = sub ? getDaysRemaining(sub.lastDate) : 0
              const isSent = sentStudentIds.has(student.id)

              return (
                <div
                  key={student.id}
                  className={`p-3 sm:p-3.5 rounded-xl transition-colors flex items-center justify-between gap-3 ${
                    isSent ? 'bg-emerald-50/40 hover:bg-emerald-50/70' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-slate-900">{student.name}</span>
                      {sub ? (
                        days <= 3 && days >= 0 ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                            Expires in {days}d ({formatDate(sub.lastDate)})
                          </span>
                        ) : days < 0 ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                            Expired ({formatDate(sub.lastDate)})
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            {days} days left
                          </span>
                        )
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          No Active Pass
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                      <span>+91 {student.mobile}</span>
                      {student.address && (
                        <span className="text-[11px] text-slate-400 truncate max-w-[200px]">
                          • {student.address}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isSent && (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 border border-emerald-300 px-2 py-1 rounded-lg flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                        Sent
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleSendWhatsapp(student)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition-transform active:scale-95 flex items-center gap-1.5 ${
                        isSent
                          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                          : 'bg-[#25D366] hover:bg-[#20ba5a] text-white'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5 fill-current" />
                      <span>{isSent ? 'Resend' : 'Send WhatsApp'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span>
              Target: <strong>{targetStudents.length}</strong> students • Sent:{' '}
              <strong className="text-emerald-700">{sentCount}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://web.whatsapp.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-[#25D366] hover:underline font-semibold hidden sm:inline"
            >
              Open WhatsApp Web ↗
            </a>
            <Button size="sm" variant="outline" onClick={onClose} className="text-xs h-8">
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

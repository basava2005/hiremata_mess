import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  KeyRound,
  X,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Eye,
  EyeOff,
  MessageSquare,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react'
import { authApi } from '../../api/auth'
import { PasswordResetRequest } from '../../types'
import { formatDate } from '../../lib/dates'
import { Button } from '../ui/Button'
import { toast } from 'sonner'

interface PasswordResetRequestsModalProps {
  open: boolean
  onClose: () => void
}

export const PasswordResetRequestsModal: React.FC<PasswordResetRequestsModalProps> = ({
  open,
  onClose,
}) => {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<'PENDING' | 'APPROVED' | 'ALL'>('PENDING')
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({})

  // Fetch reset requests
  const { data: requests = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ['adminPasswordResetRequests'],
    queryFn: () => authApi.getPasswordResetRequests(),
    enabled: open,
    refetchInterval: open ? 5000 : false, // auto-refresh while modal is open
  })

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: ({ id, newPassword }: { id: string; newPassword?: string }) =>
      authApi.approvePasswordResetRequest(id, newPassword),
    onSuccess: (res, vars) => {
      toast.success(res.message || 'Password reset approved & updated!')
      queryClient.invalidateQueries({ queryKey: ['adminPasswordResetRequests'] })
      queryClient.invalidateQueries({ queryKey: ['adminStudents'] })

      if (res.whatsappUrl) {
        toast('Send confirmation to student?', {
          action: {
            label: 'Open WhatsApp',
            onClick: () => window.open(res.whatsappUrl, '_blank'),
          },
        })
      }
    },
    onError: (err: any) => {
      toast.error('Failed to approve request: ' + (err.response?.data?.detail || err.message))
    },
  })

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, adminNote }: { id: string; adminNote?: string }) =>
      authApi.rejectPasswordResetRequest(id, adminNote),
    onSuccess: () => {
      toast.info('Password reset request rejected.')
      queryClient.invalidateQueries({ queryKey: ['adminPasswordResetRequests'] })
    },
    onError: (err: any) => {
      toast.error('Failed to reject request: ' + (err.response?.data?.detail || err.message))
    },
  })

  if (!open) return null

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const pendingRequests = requests.filter((r) => r.status === 'PENDING')
  const approvedRequests = requests.filter((r) => r.status === 'APPROVED')

  const filteredRequests = requests.filter((r) => {
    if (filter === 'PENDING') return r.status === 'PENDING'
    if (filter === 'APPROVED') return r.status === 'APPROVED'
    return true // ALL
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md flex-shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                Password Reset Requests
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-semibold">
                  {pendingRequests.length} Pending
                </span>
              </h3>
              <p className="text-xs text-emerald-300">
                Verify student identity and approve password changes before activation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => refetch()}
              className="text-slate-300 hover:text-white p-1.5 rounded-lg transition-colors"
              title="Refresh requests"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setFilter('PENDING')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filter === 'PENDING'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pending Verification ({pendingRequests.length})</span>
            </button>

            <button
              onClick={() => setFilter('APPROVED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filter === 'APPROVED'
                  ? 'bg-[#15803d] text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approved History ({approvedRequests.length})</span>
            </button>

            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filter === 'ALL'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>All ({requests.length})</span>
            </button>
          </div>
        </div>

        {/* Request List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 sm:p-4">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading requests...</div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs space-y-2">
              <Sparkles className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="font-bold text-sm text-slate-700">No requests in this view!</p>
              <p className="text-slate-400">
                {filter === 'PENDING'
                  ? 'There are no pending password reset requests from students.'
                  : 'No requests found.'}
              </p>
            </div>
          ) : (
            filteredRequests.map((req) => {
              const isVisible = !!visiblePasswords[req.id]
              const isPending = req.status === 'PENDING'
              const isApproved = req.status === 'APPROVED'
              const isRejected = req.status === 'REJECTED'

              return (
                <div
                  key={req.id}
                  className={`p-3.5 sm:p-4 rounded-xl transition-colors space-y-3 ${
                    isPending
                      ? 'bg-amber-50/50 hover:bg-amber-50/80 border border-amber-200/80'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900">{req.studentName}</span>
                        {isPending && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Pending Verification
                          </span>
                        )}
                        {isApproved && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Approved & Active
                          </span>
                        )}
                        {isRejected && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            Rejected
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>+91 {req.mobile}</span>
                        <span>•</span>
                        <span className="text-slate-400 font-sans text-[11px]">
                          Requested: {req.createdAt ? formatDate(req.createdAt.split('T')[0]) : 'Recent'}
                        </span>
                      </div>

                      {/* Requested Password */}
                      {req.requestedPassword && (
                        <div className="flex items-center gap-2 pt-1 text-xs">
                          <span className="font-semibold text-slate-700">Requested Password:</span>
                          <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-900 font-bold">
                            {isVisible ? req.requestedPassword : '••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(req.id)}
                            className="text-slate-400 hover:text-slate-600 p-0.5"
                            title={isVisible ? 'Hide password' : 'View password'}
                          >
                            {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      )}

                      {req.adminNote && (
                        <p className="text-[11px] text-slate-500 italic">
                          Note: "{req.adminNote}"
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isPending && (
                        <>
                          <Button
                            size="sm"
                            onClick={() =>
                              approveMutation.mutate({
                                id: req.id,
                                newPassword: req.requestedPassword,
                              })
                            }
                            isLoading={approveMutation.isPending}
                            className="bg-[#15803d] hover:bg-[#166534] text-white text-xs h-8 font-bold rounded-xl flex items-center gap-1 shadow-xs"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Verify & Accept</span>
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => rejectMutation.mutate({ id: req.id })}
                            isLoading={rejectMutation.isPending}
                            className="text-rose-700 hover:bg-rose-50 border-rose-200 text-xs h-8 rounded-xl"
                          >
                            <span>Reject</span>
                          </Button>
                        </>
                      )}

                      {/* WhatsApp Student Direct Button */}
                      <a
                        href={`https://api.whatsapp.com/send?phone=91${req.mobile.replace(/\D/g, '').slice(-10)}&text=${encodeURIComponent(
                          isApproved
                            ? `ನಮಸ್ಕಾರ ${req.studentName},\nYour Hiremat Mess account password reset request has been APPROVED by Mess Admin.\nYour active password is: ${req.requestedPassword}\n\n📍 BIET Rd, Davangere\n📞 9353198281`
                            : `ನಮಸ್ಕಾರ ${req.studentName},\nRegarding your Hiremat Mess account password reset request (+91 ${req.mobile})...\n\n📍 BIET Rd, Davangere\n📞 Mess Admin: 9353198281`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold px-2.5 py-1.5 rounded-xl shadow-xs inline-flex items-center gap-1 transition-transform active:scale-95"
                        title="Chat with Student on WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5 fill-white" />
                        <span className="hidden sm:inline">WhatsApp</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 flex-shrink-0">
          <div>
            <span>
              Pending Requests: <strong className="text-amber-700">{pendingRequests.length}</strong> • Total:{' '}
              <strong>{requests.length}</strong>
            </span>
          </div>

          <Button size="sm" variant="outline" onClick={onClose} className="text-xs h-8">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}


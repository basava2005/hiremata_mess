import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Sparkles, Calendar, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { extensionsApi } from '../../api/extensions'
import { formatDate } from '../../lib/dates'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'
import { TableSkeleton } from '../../components/ui/Skeleton'

export const StudentExtensionsPage: React.FC = () => {
  const { user, student } = useAuth()
  const studentId = student?.id || user?.studentId || 'stud-01'

  const { data: extensions = [], isLoading } = useQuery({
    queryKey: ['studentExtensions', studentId],
    queryFn: () => extensionsApi.getExtensions({ studentId }),
  })

  return (
    <div className="space-y-5 max-w-lg mx-auto pb-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Extension History
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Official validity extensions granted for consecutive leave days
        </p>
      </div>

      {/* Info Card */}
      <div className="p-4 rounded-xl bg-slate-900 text-white shadow-md space-y-1.5">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>Fair Extension Policy</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          When you take $\ge$ 10 consecutive approved leave days, your mess admin reviews and adds those days to extend your meal subscription at no extra cost.
        </p>
      </div>

      {/* Extensions List */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900">
            Granted Extensions ({extensions.length})
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Records of added days and adjusted subscription end dates
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0 divide-y divide-slate-100">
          {isLoading ? (
            <TableSkeleton rows={2} />
          ) : extensions.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<Sparkles className="w-6 h-6" />}
                title="No extensions granted yet"
                description="Once you have 10+ consecutive approved leave days, your branch admin will credit the extension days here."
              />
            </div>
          ) : (
            extensions.map((ext) => (
              <div
                key={ext.id}
                className="p-4 space-y-2 hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-[#15803d] bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg">
                      +{ext.daysAdded} Days Added
                    </span>
                    <StatusBadge variant={ext.status}>{ext.status}</StatusBadge>
                  </div>
                  <span className="text-xs text-slate-400">
                    {formatDate(ext.created_at)}
                  </span>
                </div>

                {/* Old vs New Date comparison */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl text-xs border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Original End Date
                    </span>
                    <span className="font-medium text-slate-600 line-through">
                      {formatDate(ext.oldLastDate)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-emerald-800 uppercase font-semibold block">
                      Extended New End Date
                    </span>
                    <span className="font-bold text-[#15803d]">
                      {formatDate(ext.newLastDate)}
                    </span>
                  </div>
                </div>

                {ext.note && (
                  <p className="text-xs text-slate-600 italic">
                    <strong>Admin Note:</strong> {ext.note}
                  </p>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

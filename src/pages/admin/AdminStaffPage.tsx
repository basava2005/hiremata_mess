import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  UserCheck,
  UserPlus,
  Phone,
  KeyRound,
  Trash2,
  Check,
  Copy,
  Sparkles,
  Shield,
  Eye,
  EyeOff,
  AlertCircle,
  X,
  Share2,
} from 'lucide-react'
import { staffApi, CreateStaffPayload } from '../../api/staff'
import { User } from '../../types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { TableSkeleton } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'

export const AdminStaffPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [staffName, setStaffName] = useState('')
  const [staffMobile, setStaffMobile] = useState('')
  const [staffPassword, setStaffPassword] = useState('Staff@2026')
  const [showPassword, setShowPassword] = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)
  const [createdCredentials, setCreatedCredentials] = useState<{ name: string; mobile: string; pass: string } | null>(null)
  const [copied, setCopied] = useState(false)

  // Fetch staff
  const { data: staffList = [], isLoading } = useQuery({
    queryKey: ['adminStaff'],
    queryFn: () => staffApi.getStaff(),
  })

  // Create staff mutation
  const createMutation = useMutation({
    mutationFn: (payload: CreateStaffPayload) => staffApi.createStaff(payload),
    onSuccess: (newStaff) => {
      queryClient.invalidateQueries({ queryKey: ['adminStaff'] })
      setCreatedCredentials({
        name: newStaff.name,
        mobile: newStaff.mobile,
        pass: staffPassword,
      })
      setStaffName('')
      setStaffMobile('')
      setStaffPassword('Staff@2026')
    },
    onError: (err: any) => {
      setModalError(err.response?.data?.detail || err.message || 'Failed to create staff member.')
    },
  })

  // Delete staff mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => staffApi.deleteStaff(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminStaff'] })
    },
  })

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
    let pass = 'Staff@'
    for (let i = 0; i < 4; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setStaffPassword(pass)
  }

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault()
    setModalError(null)

    if (!staffName.trim()) {
      setModalError('Please enter the staff member name.')
      return
    }

    if (!staffMobile.trim() || staffMobile.length !== 10) {
      setModalError('Please enter a valid 10-digit mobile number.')
      return
    }

    createMutation.mutate({
      name: staffName.trim(),
      mobile: staffMobile.trim(),
      password: staffPassword.trim(),
    })
  }

  const handleCopyCredentials = () => {
    if (!createdCredentials) return
    const text = `*Hiremat Mess Staff Login Details*\nName: ${createdCredentials.name}\nMobile (Login ID): ${createdCredentials.mobile}\nPassword: ${createdCredentials.pass}\nLogin at: https://hiremat-mess.web.app/login`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            Mess Staff Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Create and manage staff accounts for dining hall meal entry verification
          </p>
        </div>

        <Button
          onClick={() => {
            setModalError(null)
            setCreatedCredentials(null)
            setIsAddModalOpen(true)
          }}
          className="bg-[#15803d] hover:bg-[#166534] text-xs font-bold h-10 px-4 rounded-xl shadow-sm flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Staff Member</span>
        </Button>
      </div>

      {/* Staff Table Card */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#15803d]" />
              <span>Registered Mess Staff Team</span>
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Staff can sign in to verify student meal status with touch-optimized search
            </CardDescription>
          </div>
          <span className="text-xs font-bold bg-emerald-50 text-[#15803d] px-2.5 py-1 rounded-lg border border-emerald-200">
            {staffList.length} Active Staff
          </span>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4">
              <TableSkeleton rows={3} />
            </div>
          ) : staffList.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={<UserCheck className="w-6 h-6" />}
                title="No staff members registered"
                description="Click 'Add New Staff Member' above to create login credentials for your mess staff."
                actionLabel="Create Staff Account"
                onAction={() => {
                  setModalError(null)
                  setCreatedCredentials(null)
                  setIsAddModalOpen(true)
                }}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3.5">Staff Name</th>
                    <th className="px-5 py-3.5">Mobile (Login ID)</th>
                    <th className="px-5 py-3.5">Assigned Role</th>
                    <th className="px-5 py-3.5">Permissions</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {staffList.map((staff) => (
                    <tr key={staff.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-slate-900 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#15803d] flex items-center justify-center font-bold text-xs">
                          {staff.name.charAt(0)}
                        </div>
                        <span>{staff.name}</span>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-slate-700">
                        +91 {staff.mobile}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          MESS STAFF
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 text-[11px]">
                        Meal entry verifier (No payment access)
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to remove staff member ${staff.name}?`)) {
                              deleteMutation.mutate(staff.id)
                            }
                          }}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Remove Staff"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100">
            {/* Header */}
            <div className="p-4 bg-emerald-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#15803d] flex items-center justify-center text-white">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Add New Staff Member</h3>
                  <p className="text-[11px] text-emerald-300">Hiremat Mess Staff Access</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 text-xs">
              {createdCredentials ? (
                /* Created Success Card */
                <div className="space-y-4 text-center py-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#15803d] flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Staff Member Created!</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Share these login credentials with the staff member:
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-left space-y-1 font-mono text-xs">
                    <p><span className="text-slate-400 font-sans">Name:</span> <strong className="text-slate-800">{createdCredentials.name}</strong></p>
                    <p><span className="text-slate-400 font-sans">Mobile:</span> <strong className="text-slate-800">{createdCredentials.mobile}</strong></p>
                    <p><span className="text-slate-400 font-sans">Password:</span> <strong className="text-[#15803d]">{createdCredentials.pass}</strong></p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleCopyCredentials}
                      variant="outline"
                      className="w-1/2 text-xs h-9 font-semibold flex items-center justify-center gap-1.5"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied!' : 'Copy Info'}</span>
                    </Button>
                    <Button
                      onClick={() => {
                        const url = `https://api.whatsapp.com/send?phone=91${createdCredentials.mobile}&text=${encodeURIComponent(
                          `Hiremat Mess Staff Login\nMobile: ${createdCredentials.mobile}\nPassword: ${createdCredentials.pass}`
                        )}`
                        window.open(url, '_blank')
                      }}
                      className="w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 font-bold flex items-center justify-center gap-1.5"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </Button>
                  </div>

                  <Button
                    onClick={() => setIsAddModalOpen(false)}
                    className="w-full bg-slate-900 hover:bg-black text-white text-xs h-9 font-bold rounded-xl mt-2"
                  >
                    Done
                  </Button>
                </div>
              ) : (
                /* Form */
                <form onSubmit={handleAddStaff} className="space-y-3.5">
                  {modalError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2 text-xs">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{modalError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Staff Full Name
                    </label>
                    <input
                      type="text"
                      value={staffName}
                      onChange={(e) => setStaffName(e.target.value)}
                      placeholder="e.g. Suresh Patil"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:border-[#15803d] focus:ring-2 focus:ring-[#15803d]/20"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      10-Digit Mobile Number (Login ID)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-slate-400">
                        +91
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        value={staffMobile}
                        onChange={(e) => setStaffMobile(e.target.value.replace(/\D/g, ''))}
                        placeholder="9876543211"
                        className="w-full pl-11 text-xs p-2.5 rounded-xl border border-slate-300 focus:border-[#15803d] focus:ring-2 focus:ring-[#15803d]/20 font-mono font-bold"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Login Password
                      </label>
                      <button
                        type="button"
                        onClick={handleGeneratePassword}
                        className="text-[10px] font-bold text-[#15803d] hover:underline flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        Auto-Generate
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={staffPassword}
                        onChange={(e) => setStaffPassword(e.target.value)}
                        placeholder="Staff login password"
                        className="w-full text-xs p-2.5 pr-10 rounded-xl border border-slate-300 focus:border-[#15803d] focus:ring-2 focus:ring-[#15803d]/20 font-mono font-bold"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddModalOpen(false)}
                      className="text-xs h-9"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      isLoading={createMutation.isPending}
                      className="bg-[#15803d] hover:bg-[#166534] text-white text-xs h-9 font-bold px-4 rounded-xl"
                    >
                      Create Staff Account
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

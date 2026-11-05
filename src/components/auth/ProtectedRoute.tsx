import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { UserRole } from '../../types'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  allowedRoles?: UserRole[]
  children?: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { user, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <Loader2 className="w-8 h-8 text-[#15803d] animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading MessPro...</p>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to user's assigned role home
    switch (user.role) {
      case 'BRANCH_ADMIN':
        return <Navigate to="/admin" replace />
      case 'MESS_STAFF':
        return <Navigate to="/staff" replace />
      case 'STUDENT':
      default:
        return <Navigate to="/student" replace />
    }
  }

  return children ? <>{children}</> : <Outlet />
}


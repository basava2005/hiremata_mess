import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { UserRole } from '../../types'
import { FoodLoadingScreen } from '../ui/FoodLoadingScreen'

interface ProtectedRouteProps {
  allowedRoles?: UserRole[]
  children?: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { user, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <FoodLoadingScreen message="Loading Hiremat Mess..." />
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to user's assigned role home
    switch (user.role) {
      case 'BRANCH_ADMIN':
        return <Navigate to="/admin" replace />
      case 'STUDENT':
      default:
        return <Navigate to="/student" replace />
    }
  }

  return children ? <>{children}</> : <Outlet />
}


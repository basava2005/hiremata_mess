import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { LandingPage } from './pages/public/LandingPage'
import { LoginPage } from './pages/auth/LoginPage'

// Layouts
import { StudentLayout } from './components/layouts/StudentLayout'
import { AdminLayout } from './components/layouts/AdminLayout'
import { StaffLayout } from './components/layouts/StaffLayout'

// Student Pages
import { StudentHomePage } from './pages/student/StudentHomePage'
import { StudentPaymentsPage } from './pages/student/StudentPaymentsPage'
import { StudentLeavesPage } from './pages/student/StudentLeavesPage'
import { StudentExtensionsPage } from './pages/student/StudentExtensionsPage'
import { StudentProfilePage } from './pages/student/StudentProfilePage'

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { AdminStudentsPage } from './pages/admin/AdminStudentsPage'
import { AdminPaymentsPage } from './pages/admin/AdminPaymentsPage'
import { AdminLeavesPage } from './pages/admin/AdminLeavesPage'
import { AdminExtensionsPage } from './pages/admin/AdminExtensionsPage'
import { AdminStaffPage } from './pages/admin/AdminStaffPage'
import { AdminAnnouncementsPage } from './pages/admin/AdminAnnouncementsPage'

// Staff Pages
import { StaffCheckStatusPage } from './pages/staff/StaffCheckStatusPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Landing Page at root `/` */}
            <Route path="/" element={<LandingPage />} />

            {/* Public Login Route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Student Portal Routes */}
            <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
              <Route path="/student" element={<StudentLayout />}>
                <Route index element={<StudentHomePage />} />
                <Route path="payments" element={<StudentPaymentsPage />} />
                <Route path="leaves" element={<StudentLeavesPage />} />
                <Route path="extensions" element={<StudentExtensionsPage />} />
                <Route path="profile" element={<StudentProfilePage />} />
              </Route>
            </Route>

            {/* Branch Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['BRANCH_ADMIN']} />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="students" element={<AdminStudentsPage />} />
                <Route path="staff" element={<AdminStaffPage />} />
                <Route path="payments" element={<AdminPaymentsPage />} />
                <Route path="leaves" element={<AdminLeavesPage />} />
                <Route path="extensions" element={<AdminExtensionsPage />} />
                <Route path="announcements" element={<AdminAnnouncementsPage />} />
              </Route>
            </Route>

            {/* Mess Staff Routes */}
            <Route element={<ProtectedRoute allowedRoles={['MESS_STAFF']} />}>
              <Route path="/staff" element={<StaffLayout />}>
                <Route index element={<StaffCheckStatusPage />} />
              </Route>
            </Route>

            {/* Fallback to Landing Page */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App

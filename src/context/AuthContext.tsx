import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Student, UserRole, AuthResponse } from '../types'
import { authApi, LoginCredentials } from '../api/auth'
import { studentsApi } from '../api/students'
import { tokenStorage } from '../api/client'

interface AuthContextType {
  user: User | null
  student: Student | null
  role: UserRole | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<AuthResponse>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [student, setStudent] = useState<Student | null>(null)
  const [token, setToken] = useState<string | null>(tokenStorage.get())
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const loadUserData = async () => {
    try {
      const storedToken = tokenStorage.get()
      if (!storedToken) {
        setUser(null)
        setStudent(null)
        setToken(null)
        setIsLoading(false)
        return
      }

      setToken(storedToken)
      const currentUser = await authApi.getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
        if (currentUser.studentId) {
          const s = await studentsApi.getStudentById(currentUser.studentId)
          setStudent(s || null)
        } else {
          setStudent(null)
        }
      } else {
        tokenStorage.clear()
        setUser(null)
        setStudent(null)
        setToken(null)
      }
    } catch (err) {
      console.error('Failed to restore auth session:', err)
      tokenStorage.clear()
      setUser(null)
      setStudent(null)
      setToken(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUserData()
  }, [])

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setIsLoading(true)
    try {
      const res = await authApi.login(credentials)
      setUser(res.user)
      setStudent(res.student || null)
      setToken(res.token)
      return res
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await authApi.logout()
      setUser(null)
      setStudent(null)
      setToken(null)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshUser = async () => {
    await loadUserData()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        student,
        role: user?.role || null,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}


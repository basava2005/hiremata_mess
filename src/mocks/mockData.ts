import { Plan, Student, Subscription, User, Payment, LeaveRequest, LeaveExtension, Notification } from '../types'

export const BRANCH_ID = 'branch-main-01'

export const mockPlan: Plan = {
  id: 'plan-standard-30',
  branch_id: BRANCH_ID,
  name: 'Davangere Pure Veg Monthly Plan',
  price: 3500,
  durationDays: 30,
  mealsLabel: 'Breakfast + Tea + Chapati Meals + Chapati Dinner',
  description: '100% Pure Veg Karnataka homestyle meals: Morning Mandakki Mirchi/Normal Dosa & Tea, Homestyle Chapati Meals, and Chapati Dinner with Holige Feast.',
  isActive: true,
}

export const mockUsers: User[] = [
  {
    id: 'admin-chandan',
    branch_id: BRANCH_ID,
    mobile: '8431413551',
    name: 'Chandan Hiremat',
    role: 'BRANCH_ADMIN',
    created_at: '2026-01-01',
  },
  {
    id: 'admin-punith',
    branch_id: BRANCH_ID,
    mobile: '8073113562',
    name: 'Punith Hiremat',
    role: 'BRANCH_ADMIN',
    created_at: '2026-01-01',
  },
  {
    id: 'admin-basavaraj',
    branch_id: BRANCH_ID,
    mobile: '9353198281',
    name: 'Basavaraj H A',
    role: 'BRANCH_ADMIN',
    created_at: '2026-01-01',
  },
]

// Zero dummy/mock data - all real data comes from live Render + Neon database
export const mockStudents: Student[] = []
export const mockSubscriptions: Subscription[] = []
export const mockPayments: Payment[] = []
export const mockLeaves: LeaveRequest[] = []
export const mockExtensions: LeaveExtension[] = []
export const mockNotifications: Notification[] = []

import { Plan, Student, Subscription, User, Payment, LeaveRequest, LeaveExtension, Notification } from '../types'
import { calculateLastDate, getSubscriptionStatus } from '../lib/dates'

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

// Generate 20 students
interface StudentRaw {
  id: string
  name: string
  mobile: string
  address: string
  subStart: string
  subEnd?: string
  leaves?: Array<{ start: string; end: string; status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'CANCELLED'; reason: string }>
}

const rawStudentConfigs: StudentRaw[] = [
  {
    id: 'stud-01',
    name: 'Rahul Verma',
    mobile: '9876543201',
    address: 'Room 204, Ganga Boys Hostel, FC Road, Pune',
    subStart: '2026-10-20', // Ends 2026-11-18 (Active, ~14 days left)
    leaves: [
      {
        start: '2026-10-31',
        end: '2026-11-05', // 6 days elapsed so far (today is 2026-11-05) -> "6 of 10 leave days"
        status: 'APPROVED',
        reason: 'Diwali break visit to hometown',
      },
      {
        start: '2026-11-12',
        end: '2026-11-14',
        status: 'PENDING',
        reason: 'College symposium trip to Mumbai',
      },
    ],
  },
  {
    id: 'stud-02',
    name: 'Ananya Deshmukh',
    mobile: '9876543202',
    address: 'Flat 302, Saraswati Heights, Model Colony, Pune',
    subStart: '2026-10-01',
    subEnd: '2026-11-08', // Active, with 12 approved consecutive leave days in past
    leaves: [
      {
        start: '2026-10-10',
        end: '2026-10-21', // 12 consecutive days! Fully eligible for extension
        status: 'APPROVED',
        reason: 'Medical recovery & home rest',
      },
    ],
  },
  {
    id: 'stud-03',
    name: 'Aditya Kulkarni',
    mobile: '9876543203',
    address: 'Room 105, Shivaji Boys Hostel, Pune',
    subStart: '2026-10-05',
    subEnd: '2026-11-10', // Active
    leaves: [
      {
        start: '2026-10-12',
        end: '2026-10-16', // 5 days
        status: 'APPROVED',
        reason: 'Family wedding phase 1',
      },
      {
        start: '2026-10-17', // Back to back!
        end: '2026-10-22', // 6 days -> Merged 11 consecutive days! Fully eligible!
        status: 'APPROVED',
        reason: 'Family wedding phase 2',
      },
    ],
  },
  {
    id: 'stud-04',
    name: 'Pooja Iyer',
    mobile: '9876543204',
    address: 'B-12, Green View Apartments, Aundh, Pune',
    subStart: '2026-10-08', // Ends 2026-11-06 (1 day left -> EXPIRING_SOON)
    leaves: [
      {
        start: '2026-10-18',
        end: '2026-10-20',
        status: 'APPROVED',
        reason: 'Weekend trek',
      },
    ],
  },
  {
    id: 'stud-05',
    name: 'Karthik Rao',
    mobile: '9876543205',
    address: 'Room 310, Kaveri Hostel, Pune',
    subStart: '2026-10-09', // Ends 2026-11-07 (2 days left -> EXPIRING_SOON)
  },
  {
    id: 'stud-06',
    name: 'Sneha Patil',
    mobile: '9876543206',
    address: 'Plot 45, Vidyanagar, Pune',
    subStart: '2026-10-10', // Ends 2026-11-08 (3 days left -> EXPIRING_SOON)
    leaves: [
      {
        start: '2026-11-06',
        end: '2026-11-08',
        status: 'PENDING',
        reason: 'Visiting grandparents',
      },
    ],
  },
  {
    id: 'stud-07',
    name: 'Vikas Sharma',
    mobile: '9876543207',
    address: 'Flat 101, Om Sai Residency, Kothrud, Pune',
    subStart: '2026-09-25', // Ends 2026-10-24 (EXPIRED)
  },
  {
    id: 'stud-08',
    name: 'Neha Gupta',
    mobile: '9876543208',
    address: 'Room 402, Priyadarshini PG, Shivajinagar, Pune',
    subStart: '2026-09-30', // Ends 2026-10-29 (EXPIRED)
  },
  {
    id: 'stud-09',
    name: 'Rohan Joshi',
    mobile: '9876543209',
    address: 'Flat 401, Sneh Bandhan, Karve Nagar, Pune',
    subStart: '2026-10-02', // Ends 2026-10-31 (EXPIRED)
  },
  {
    id: 'stud-10',
    name: 'Tanvi Shinde',
    mobile: '9876543212',
    address: 'Wing C-202, Silver Oak, Baner, Pune',
    subStart: '2026-10-18', // Ends 2026-11-16 (ACTIVE)
    leaves: [
      {
        start: '2026-10-22',
        end: '2026-10-25',
        status: 'APPROVED',
        reason: 'Semester project workshop',
      },
    ],
  },
  {
    id: 'stud-11',
    name: 'Manish Pandey',
    mobile: '9876543213',
    address: 'Room 12, Tilak Bhavan, Sadashiv Peth, Pune',
    subStart: '2026-10-22', // Ends 2026-11-20 (ACTIVE)
  },
  {
    id: 'stud-12',
    name: 'Deepika Nair',
    mobile: '9876543214',
    address: 'Flat 503, Lakeview Enclave, Pashan, Pune',
    subStart: '2026-10-25', // Ends 2026-11-23 (ACTIVE)
    leaves: [
      {
        start: '2026-11-08',
        end: '2026-11-11',
        status: 'PENDING',
        reason: 'Attending cousin wedding in Kerala',
      },
    ],
  },
  {
    id: 'stud-13',
    name: 'Arjun Reddy',
    mobile: '9876543215',
    address: 'Room 214, Narmada Hostel, Pune',
    subStart: '2026-10-28', // Ends 2026-11-26 (ACTIVE)
  },
  {
    id: 'stud-14',
    name: 'Meera Menon',
    mobile: '9876543216',
    address: 'Flat 204, Nilgiri Heights, Viman Nagar, Pune',
    subStart: '2026-11-01', // Ends 2026-11-30 (ACTIVE)
  },
  {
    id: 'stud-15',
    name: 'Siddharth Chawla',
    mobile: '9876543217',
    address: 'House 88, Lane 5, Kalyani Nagar, Pune',
    subStart: '2026-10-15', // Ends 2026-11-13 (ACTIVE)
  },
  {
    id: 'stud-16',
    name: 'Priyanka Ghosh',
    mobile: '9876543218',
    address: 'Room 303, Maitri Girls Hostel, Deccan, Pune',
    subStart: '2026-10-04', // Ends 2026-11-02 (EXPIRED)
  },
  {
    id: 'stud-17',
    name: 'Gaurav Mehta',
    mobile: '9876543219',
    address: 'Flat 12, Sunita Towers, Senapati Bapat Road, Pune',
    subStart: '2026-10-12', // Ends 2026-11-10 (ACTIVE, 5 days left)
  },
  {
    id: 'stud-18',
    name: 'Divya Bhat',
    mobile: '9876543220',
    address: 'Room 108, Pragati Bhavan, Pune',
    subStart: '2026-10-26', // Ends 2026-11-24 (ACTIVE)
  },
  {
    id: 'stud-19',
    name: 'Sameer Sheikh',
    mobile: '9876543221',
    address: 'Flat 6, Gulmohar Court, Camp, Pune',
    subStart: '2026-10-14', // Ends 2026-11-12 (ACTIVE)
  },
  {
    id: 'stud-20',
    name: 'Harshita Sen',
    mobile: '9876543222',
    address: 'Room 405, Kalpataru PG, Kothrud, Pune',
    subStart: '2026-10-16', // Ends 2026-11-14 (ACTIVE)
  },
]

export const mockStudents: Student[] = []
export const mockSubscriptions: Subscription[] = []
export const mockPayments: Payment[] = []
export const mockLeaves: LeaveRequest[] = []
export const mockExtensions: LeaveExtension[] = []
export const mockNotifications: Notification[] = []

// Populate structured mocks
rawStudentConfigs.forEach((cfg, idx) => {
  const userId = `user-${cfg.id}`
  const subId = `sub-${cfg.id}`
  const lastDate = cfg.subEnd || calculateLastDate(cfg.subStart, 30)
  const status = getSubscriptionStatus(cfg.subStart, lastDate, '2026-11-05')

  // User
  mockUsers.push({
    id: userId,
    branch_id: BRANCH_ID,
    mobile: cfg.mobile,
    name: cfg.name,
    role: 'STUDENT',
    studentId: cfg.id,
    created_at: cfg.subStart,
  })

  // Student
  mockStudents.push({
    id: cfg.id,
    branch_id: BRANCH_ID,
    userId,
    name: cfg.name,
    mobile: cfg.mobile,
    address: cfg.address,
    isActive: true,
    currentSubscriptionId: subId,
    created_at: cfg.subStart,
  })

  // Subscription
  mockSubscriptions.push({
    id: subId,
    branch_id: BRANCH_ID,
    studentId: cfg.id,
    planId: mockPlan.id,
    startDate: cfg.subStart,
    lastDate,
    status,
    plan: mockPlan,
    created_at: cfg.subStart,
  })

  // Payment
  const paymentMethods: Array<'CASH' | 'UPI' | 'ONLINE'> = ['UPI', 'CASH', 'ONLINE']
  mockPayments.push({
    id: `pay-${cfg.id}-01`,
    branch_id: BRANCH_ID,
    studentId: cfg.id,
    studentName: cfg.name,
    subscriptionId: subId,
    amount: 3500,
    paymentMethod: paymentMethods[idx % paymentMethods.length],
    referenceNumber: idx % 2 === 0 ? `UPI${100000000 + idx * 773}` : `CASH-${idx + 100}`,
    status: 'SUCCESS',
    date: cfg.subStart,
    receiptNumber: `RCP-2026-${(100 + idx).toString()}`,
    notes: 'Monthly mess subscription plan payment',
    created_at: cfg.subStart,
  })

  // Leaves
  if (cfg.leaves && cfg.leaves.length > 0) {
    cfg.leaves.forEach((l, lIdx) => {
      mockLeaves.push({
        id: `leave-${cfg.id}-${lIdx + 1}`,
        branch_id: BRANCH_ID,
        studentId: cfg.id,
        studentName: cfg.name,
        startDate: l.start,
        endDate: l.end,
        daysCount: 0, // Computed dynamically
        reason: l.reason,
        status: l.status,
        created_at: l.start,
      })
    })
  }
})

// Add an existing past extension for history demonstration
mockExtensions.push({
  id: 'ext-01',
  branch_id: BRANCH_ID,
  studentId: 'stud-01',
  studentName: 'Rahul Verma',
  subscriptionId: 'sub-stud-01',
  oldLastDate: '2026-10-18',
  newLastDate: '2026-10-23',
  daysAdded: 5,
  approvedByUserId: 'user-admin',
  status: 'APPROVED',
  note: 'Granted 5 days extension for approved leave during Ganesh festival',
  created_at: '2026-10-17',
})

// Add initial notifications
mockNotifications.push(
  {
    id: 'notif-01',
    branch_id: BRANCH_ID,
    userId: 'user-stud-01', // Rahul Verma
    title: 'Leave Approved',
    message: 'Your leave request for 31 Oct to 05 Nov has been approved by Mess Admin.',
    type: 'SUCCESS',
    isRead: false,
    created_at: '2026-10-30',
  },
  {
    id: 'notif-02',
    branch_id: BRANCH_ID,
    userId: 'user-stud-01',
    title: 'Diwali Special Feast',
    message: 'Join us for a grand festive dinner this Saturday at 7:30 PM with sweets and special items!',
    type: 'INFO',
    isRead: true,
    created_at: '2026-10-28',
  },
  {
    id: 'notif-03',
    branch_id: BRANCH_ID,
    userId: 'user-admin',
    title: 'Leave Extension Eligible',
    message: 'Ananya Deshmukh is eligible for leave extension (12 consecutive days approved).',
    type: 'ALERT',
    isRead: false,
    created_at: '2026-11-04',
  },
  {
    id: 'notif-04',
    branch_id: BRANCH_ID,
    userId: 'user-admin',
    title: 'Expiring Soon Alert',
    message: '3 students have subscriptions expiring within the next 3 days.',
    type: 'WARNING',
    isRead: false,
    created_at: '2026-11-05',
  }
)


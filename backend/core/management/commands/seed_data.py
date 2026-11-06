from django.core.management.base import BaseCommand
from datetime import date, timedelta
from core.models import Branch, UserAccount, Student, Plan, Subscription, Payment, LeaveRequest, LeaveExtension, Notification
from core.dates import calculate_last_date, get_subscription_status, inclusive_days

class Command(BaseCommand):
    help = 'Seeds initial realistic data for MessPro backend'

    def handle(self, *args, **options):
        self.stdout.write('Clearing existing records...')
        Notification.objects.all().delete()
        LeaveExtension.objects.all().delete()
        LeaveRequest.objects.all().delete()
        Payment.objects.all().delete()
        Subscription.objects.all().delete()
        Student.objects.all().delete()
        UserAccount.objects.all().delete()
        Plan.objects.all().delete()
        Branch.objects.all().delete()

        self.stdout.write('Creating branch and plan...')
        branch = Branch.objects.create(
            id='branch-main-01',
            name='Hiremat Mess Davangere',
            location='Anjaneya Layout 5th Cross, BIET Rd, Davangere, Karnataka 577004'
        )

        plan = Plan.objects.create(
            id='plan-standard-30',
            branch_id=branch.id,
            name='Davangere Pure Veg Monthly Plan',
            price=3500,
            duration_days=30,
            meals_label='Breakfast + Tea + Chapati Meals + Chapati Dinner',
            description='100% Pure Veg Karnataka homestyle meals: Mandakki Mirchi/Normal Dosa & Tea, Homestyle Chapati Meals, and Chapati Dinner with Special Holige Feast.',
            is_active=True
        )

        self.stdout.write('Creating Official Branch Admins...')
        UserAccount.objects.create(
            id='admin-chandan',
            branch_id=branch.id,
            mobile='8431413551',
            name='Chandan Hiremat',
            role='BRANCH_ADMIN',
            password='Chandu@143'
        )

        UserAccount.objects.create(
            id='admin-punith',
            branch_id=branch.id,
            mobile='8073113562',
            name='Punith Hiremat',
            role='BRANCH_ADMIN',
            password='Punith@143'
        )

        UserAccount.objects.create(
            id='admin-basavaraj',
            branch_id=branch.id,
            mobile='9353198281',
            name='Basavaraj H A',
            role='BRANCH_ADMIN',
            password='Basava@143'
        )

        raw_students = [
            {
                'id': 'stud-01',
                'name': 'Rahul Verma',
                'mobile': '9876543201',
                'address': 'Room 204, Ganga Boys Hostel, FC Road, Pune',
                'sub_start': date.fromisoformat('2026-10-20'),
                'leaves': [
                    {'start': date.fromisoformat('2026-10-31'), 'end': date.fromisoformat('2026-11-05'), 'status': 'APPROVED', 'reason': 'Diwali break visit to hometown'},
                    {'start': date.fromisoformat('2026-11-12'), 'end': date.fromisoformat('2026-11-14'), 'status': 'PENDING', 'reason': 'College symposium trip to Mumbai'},
                ]
            },
            {
                'id': 'stud-02',
                'name': 'Ananya Deshmukh',
                'mobile': '9876543202',
                'address': 'Flat 302, Saraswati Heights, Model Colony, Pune',
                'sub_start': date.fromisoformat('2026-10-01'),
                'leaves': [
                    {'start': date.fromisoformat('2026-10-10'), 'end': date.fromisoformat('2026-10-21'), 'status': 'APPROVED', 'reason': 'Medical recovery & home rest'},
                ]
            },
            {
                'id': 'stud-03',
                'name': 'Aditya Kulkarni',
                'mobile': '9876543203',
                'address': 'Room 105, Shivaji Boys Hostel, Pune',
                'sub_start': date.fromisoformat('2026-10-05'),
                'leaves': [
                    {'start': date.fromisoformat('2026-10-12'), 'end': date.fromisoformat('2026-10-16'), 'status': 'APPROVED', 'reason': 'Family wedding phase 1'},
                    {'start': date.fromisoformat('2026-10-17'), 'end': date.fromisoformat('2026-10-22'), 'status': 'APPROVED', 'reason': 'Family wedding phase 2'},
                ]
            },
            {
                'id': 'stud-04',
                'name': 'Pooja Iyer',
                'mobile': '9876543204',
                'address': 'B-12, Green View Apartments, Aundh, Pune',
                'sub_start': date.fromisoformat('2026-10-08'), # Ends 2026-11-06 (1 day left)
                'leaves': []
            },
            {
                'id': 'stud-05',
                'name': 'Karthik Rao',
                'mobile': '9876543205',
                'address': 'Room 310, Kaveri Hostel, Pune',
                'sub_start': date.fromisoformat('2026-10-09'), # Ends 2026-11-07 (2 days left)
                'leaves': []
            },
            {
                'id': 'stud-06',
                'name': 'Sneha Patil',
                'mobile': '9876543206',
                'address': 'Plot 45, Vidyanagar, Pune',
                'sub_start': date.fromisoformat('2026-10-10'), # Ends 2026-11-08 (3 days left)
                'leaves': [
                    {'start': date.fromisoformat('2026-11-06'), 'end': date.fromisoformat('2026-11-08'), 'status': 'PENDING', 'reason': 'Visiting grandparents'}
                ]
            },
            {
                'id': 'stud-07',
                'name': 'Vikas Sharma',
                'mobile': '9876543207',
                'address': 'Flat 101, Om Sai Residency, Kothrud, Pune',
                'sub_start': date.fromisoformat('2026-09-25'), # EXPIRED
                'leaves': []
            },
            {
                'id': 'stud-08',
                'name': 'Neha Gupta',
                'mobile': '9876543208',
                'address': 'Room 402, Priyadarshini PG, Shivajinagar, Pune',
                'sub_start': date.fromisoformat('2026-09-30'), # EXPIRED
                'leaves': []
            },
            {
                'id': 'stud-09',
                'name': 'Rohan Joshi',
                'mobile': '9876543209',
                'address': 'Flat 401, Sneh Bandhan, Karve Nagar, Pune',
                'sub_start': date.fromisoformat('2026-10-02'), # EXPIRED
                'leaves': []
            },
            {
                'id': 'stud-10',
                'name': 'Tanvi Shinde',
                'mobile': '9876543212',
                'address': 'Wing C-202, Silver Oak, Baner, Pune',
                'sub_start': date.fromisoformat('2026-10-18'), # ACTIVE
                'leaves': []
            },
            {
                'id': 'stud-11',
                'name': 'Manish Pandey',
                'mobile': '9876543213',
                'address': 'Room 12, Tilak Bhavan, Pune',
                'sub_start': date.fromisoformat('2026-10-22'),
                'leaves': []
            },
            {
                'id': 'stud-12',
                'name': 'Deepika Nair',
                'mobile': '9876543214',
                'address': 'Flat 503, Lakeview Enclave, Pashan, Pune',
                'sub_start': date.fromisoformat('2026-10-25'),
                'leaves': []
            },
            {
                'id': 'stud-13',
                'name': 'Arjun Reddy',
                'mobile': '9876543215',
                'address': 'Room 214, Narmada Hostel, Pune',
                'sub_start': date.fromisoformat('2026-10-28'),
                'leaves': []
            },
            {
                'id': 'stud-14',
                'name': 'Meera Menon',
                'mobile': '9876543216',
                'address': 'Flat 204, Nilgiri Heights, Pune',
                'sub_start': date.fromisoformat('2026-11-01'),
                'leaves': []
            },
            {
                'id': 'stud-15',
                'name': 'Siddharth Chawla',
                'mobile': '9876543217',
                'address': 'House 88, Lane 5, Pune',
                'sub_start': date.fromisoformat('2026-10-15'),
                'leaves': []
            },
            {
                'id': 'stud-16',
                'name': 'Priyanka Ghosh',
                'mobile': '9876543218',
                'address': 'Room 303, Maitri Hostel, Pune',
                'sub_start': date.fromisoformat('2026-10-04'), # EXPIRED
                'leaves': []
            },
            {
                'id': 'stud-17',
                'name': 'Gaurav Mehta',
                'mobile': '9876543219',
                'address': 'Flat 12, Sunita Towers, Pune',
                'sub_start': date.fromisoformat('2026-10-12'),
                'leaves': []
            },
            {
                'id': 'stud-18',
                'name': 'Divya Bhat',
                'mobile': '9876543220',
                'address': 'Room 108, Pragati Bhavan, Pune',
                'sub_start': date.fromisoformat('2026-10-26'),
                'leaves': []
            },
            {
                'id': 'stud-19',
                'name': 'Sameer Sheikh',
                'mobile': '9876543221',
                'address': 'Flat 6, Gulmohar Court, Camp, Pune',
                'sub_start': date.fromisoformat('2026-10-14'),
                'leaves': []
            },
            {
                'id': 'stud-20',
                'name': 'Harshita Sen',
                'mobile': '9876543222',
                'address': 'Room 405, Kalpataru PG, Pune',
                'sub_start': date.fromisoformat('2026-10-16'),
                'leaves': []
            },
        ]

        for idx, item in enumerate(raw_students):
            user_id = f"user-{item['id']}"
            sub_id = f"sub-{item['id']}"
            last_date = calculate_last_date(item['sub_start'], plan.duration_days)

            # User account
            UserAccount.objects.create(
                id=user_id,
                branch_id=branch.id,
                mobile=item['mobile'],
                name=item['name'],
                role='STUDENT',
                student_id=item['id'],
                password='password123'
            )

            # Student record
            student = Student.objects.create(
                id=item['id'],
                branch_id=branch.id,
                user_id=user_id,
                name=item['name'],
                mobile=item['mobile'],
                address=item['address'],
                is_active=True,
                current_subscription_id=sub_id
            )

            # Subscription
            Subscription.objects.create(
                id=sub_id,
                branch_id=branch.id,
                student=student,
                plan=plan,
                start_date=item['sub_start'],
                last_date=last_date,
                status=get_subscription_status(item['sub_start'], last_date)
            )

            # Payment record
            Payment.objects.create(
                id=f"pay-{item['id']}-01",
                branch_id=branch.id,
                student=student,
                subscription_id=sub_id,
                amount=3500,
                payment_method=['UPI', 'CASH', 'ONLINE'][idx % 3],
                reference_number=f"UPI{100000000 + idx * 773}" if idx % 2 == 0 else f"CASH-{idx + 100}",
                status='SUCCESS',
                date=item['sub_start'],
                receipt_number=f"RCP-2026-{100 + idx}",
                notes='Monthly mess fee plan payment'
            )

            # Leaves
            for l_idx, l in enumerate(item['leaves']):
                days = inclusive_days(l['start'], l['end'])
                LeaveRequest.objects.create(
                    id=f"leave-{item['id']}-{l_idx + 1}",
                    branch_id=branch.id,
                    student=student,
                    start_date=l['start'],
                    end_date=l['end'],
                    days_count=days,
                    reason=l['reason'],
                    status=l['status']
                )

        # Existing extension for demo history
        stud1 = Student.objects.get(id='stud-01')
        LeaveExtension.objects.create(
            id='ext-01',
            branch_id=branch.id,
            student=stud1,
            subscription_id='sub-stud-01',
            old_last_date=date.fromisoformat('2026-10-18'),
            new_last_date=date.fromisoformat('2026-10-23'),
            days_added=5,
            approved_by_user_id='user-admin',
            status='APPROVED',
            note='Granted 5 days extension for approved leave during Ganesh festival'
        )

        # Notifications
        Notification.objects.create(
            id='notif-01',
            branch_id=branch.id,
            user_id='user-stud-01',
            title='Leave Approved',
            message='Your leave request for 31 Oct to 05 Nov has been approved by Mess Admin.',
            type='SUCCESS',
            is_read=False
        )

        Notification.objects.create(
            id='notif-02',
            branch_id=branch.id,
            user_id='user-admin',
            title='Leave Extension Eligible',
            message='Ananya Deshmukh is eligible for leave extension (12 consecutive days approved).',
            type='ALERT',
            is_read=False
        )

        self.stdout.write(self.style.SUCCESS('Successfully seeded MessPro database with 20 students, admin, staff, and leaves!'))


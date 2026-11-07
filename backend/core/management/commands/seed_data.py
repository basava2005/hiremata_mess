from django.core.management.base import BaseCommand
from core.models import Branch, UserAccount, Student, Plan, Subscription, Payment, LeaveRequest, LeaveExtension, Notification

class Command(BaseCommand):
    help = 'Ensures branch, plan, and 3 admins exist, and purges all mock/dummy students'

    def handle(self, *args, **options):
        self.stdout.write('Initializing clean production database...')

        # 1. Branch
        branch, _ = Branch.objects.get_or_create(
            id='branch-main-01',
            defaults={
                'name': 'Hiremat Mess Davangere',
                'location': 'Anjaneya Layout 5th Cross, BIET Rd, Davangere, Karnataka 577004'
            }
        )

        # 2. Plan (Rs. 3500 Pure Veg)
        plan, _ = Plan.objects.get_or_create(
            id='plan-standard-30',
            defaults={
                'branch_id': branch.id,
                'name': 'Davangere Pure Veg Monthly Plan',
                'price': 3500,
                'duration_days': 30,
                'meals_label': 'Breakfast + Tea + Chapati Meals + Chapati Dinner',
                'description': '100% Pure Veg Karnataka homestyle meals: Mandakki Mirchi/Normal Dosa & Tea, Homestyle Chapati Meals, and Chapati Dinner with Special Holige Feast.',
                'is_active': True
            }
        )

        # 3. Admins
        admins_data = [
            ('admin-chandan', '8431413551', 'Chandan Hiremat', 'Chandu@143'),
            ('admin-punith', '8073113562', 'Punith Hiremat', 'Punith@143'),
            ('admin-basavaraj', '9353198281', 'Basavaraj H A', 'Basava@143'),
        ]

        for adm_id, mobile, name, pwd in admins_data:
            admin_user = UserAccount.objects.filter(mobile=mobile).first()
            if not admin_user:
                UserAccount.objects.create(
                    id=adm_id,
                    branch_id=branch.id,
                    mobile=mobile,
                    name=name,
                    role='BRANCH_ADMIN',
                    password=pwd
                )
            else:
                admin_user.role = 'BRANCH_ADMIN'
                admin_user.password = pwd
                admin_user.name = name
                admin_user.save()

        # 4. Permanently Purge all dummy students (stud-01 to stud-20) and their dummy records
        dummy_ids = [f"stud-{i:02d}" for i in range(1, 21)]
        dummy_user_ids = [f"user-stud-{i:02d}" for i in range(1, 21)]

        Notification.objects.filter(user_id__in=dummy_user_ids).delete()
        LeaveExtension.objects.filter(student_id__in=dummy_ids).delete()
        LeaveRequest.objects.filter(student_id__in=dummy_ids).delete()
        Payment.objects.filter(student_id__in=dummy_ids).delete()
        Subscription.objects.filter(student_id__in=dummy_ids).delete()
        Student.objects.filter(id__in=dummy_ids).delete()
        UserAccount.objects.filter(id__in=dummy_user_ids).delete()

        # Also purge any legacy dummy Ramesh Sharma user
        UserAccount.objects.filter(mobile='9876543210').delete()

        remaining_count = Student.objects.count()
        self.stdout.write(self.style.SUCCESS(f'Database clean! Total real students in DB: {remaining_count}'))

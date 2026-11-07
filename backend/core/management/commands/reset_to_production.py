from django.core.management.base import BaseCommand
from core.models import Branch, UserAccount, Student, Plan, Subscription, Payment, LeaveRequest, LeaveExtension, Notification

class Command(BaseCommand):
    help = 'Purges all dummy students and ensures 3 admins exist'

    def handle(self, *args, **options):
        self.stdout.write("Purging all dummy data for clean production setup...")

        dummy_ids = [f"stud-{i:02d}" for i in range(1, 21)]
        dummy_user_ids = [f"user-stud-{i:02d}" for i in range(1, 21)]

        Notification.objects.filter(user_id__in=dummy_user_ids).delete()
        LeaveExtension.objects.filter(student_id__in=dummy_ids).delete()
        LeaveRequest.objects.filter(student_id__in=dummy_ids).delete()
        Payment.objects.filter(student_id__in=dummy_ids).delete()
        Subscription.objects.filter(student_id__in=dummy_ids).delete()
        Student.objects.filter(id__in=dummy_ids).delete()
        UserAccount.objects.filter(id__in=dummy_user_ids).delete()
        UserAccount.objects.filter(mobile='9876543210').delete()

        # Branch
        branch, _ = Branch.objects.get_or_create(
            id='branch-main-01',
            defaults={
                'name': 'Hiremat Mess Davangere',
                'location': 'Anjaneya Layout 5th Cross, BIET Rd, Davangere, Karnataka 577004'
            }
        )

        # Plan
        Plan.objects.get_or_create(
            id='plan-standard-30',
            defaults={
                'branch_id': branch.id,
                'name': 'Standard Monthly Plan (Pure Veg)',
                'price': 3500,
                'duration_days': 30,
                'meals_label': 'Breakfast + Tea + Lunch + Dinner',
                'description': 'Mandakki Mirchi, Homestyle Dosa, Paddu, Pulao, Avalakki, Kadak Chai/Tea, Unlimited Hot Whole-Wheat Chapati Meals, and Holige feast.',
                'is_active': True
            }
        )

        # Admins
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

        self.stdout.write(self.style.SUCCESS('Successfully reset database to clean production state!'))
